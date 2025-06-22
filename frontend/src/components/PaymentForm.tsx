import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_REPLACE_ME');

const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
    createPaymentIntent(input: $input) {
      id
      clientSecret
      amount
      currency
      status
    }
  }
`;

interface PaymentFormProps {
  invoiceId: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  invoiceId,
  amount,
  currency = 'usd',
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [createPaymentIntent] = useMutation(CREATE_PAYMENT_INTENT);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
      setError('Stripe is not ready. Please wait a moment and try again.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card details are not available. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await createPaymentIntent({
        variables: {
          input: { invoiceId, amount, currency },
        },
      });

      if (!data?.createPaymentIntent?.clientSecret) {
        throw new Error('Failed to create payment intent.');
      }

      const { clientSecret } = data.createPaymentIntent;
        
      const { error: paymentError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message || 'Payment failed. Please try again.');
      }

      if (confirmedIntent?.status === 'succeeded') {
        console.log('Payment succeeded!');
        onSuccess?.();
      } else {
        setError(`Payment status: ${confirmedIntent?.status}. Please contact support.`);
      }
    } catch (apiError: any) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Payment Details
      </Typography>
      
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          ${amount.toFixed(2)} {currency.toUpperCase()}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Card Information
          </Typography>
          <CardElement options={cardElementOptions} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !stripe}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'Pay Now'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm; 