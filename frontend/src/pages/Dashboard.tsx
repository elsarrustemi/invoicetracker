import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { gql } from "@apollo/client";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    invoices {
      id
      total
      status
      dueDate
      number
      client {
        id
        name
      }
    }
    clients {
      id
      name
    }
    services {
      id
      name
      price
    }
  }
`;

const CREATE_INVOICE = gql`
  mutation CreateInvoice($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      id
      number
      date
      dueDate
      total
      status
      client {
        id
        name
      }
      items {
        id
        quantity
        price
        total
        service {
          id
          name
        }
      }
    }
  }
`;

const UPDATE_INVOICE = gql`
  mutation UpdateInvoice($id: ID!, $input: UpdateInvoiceInput!) {
    updateInvoice(id: $id, input: $input) {
      id
      status
    }
  }
`;

const avatarColors = ["#1976d2", "#9c27b0", "#ff9800"];

const getStatusChip = (status: string) => {
  switch (status) {
    case "PAID":
      return (
        <Chip
          label="Paid"
          size="small"
          sx={{ bgcolor: "#e6f4ea", color: "#219653" }}
        />
      );
    case "OVERDUE":
      return (
        <Chip
          label="Overdue"
          size="small"
          sx={{ bgcolor: "#fff4e6", color: "#e67c30" }}
        />
      );
    case "PENDING":
      return (
        <Chip
          label="Pending"
          size="small"
          sx={{ bgcolor: "#fffbe6", color: "#e6c300" }}
        />
      );
    default:
      return <Chip label={status} size="small" />;
  }
};

const NewInvoiceModal = ({ open, onClose, clients, refetchDashboard, services }: any) => {
  const [invoiceNumber, setInvoiceNumber] = React.useState('INV-001');
  const [issueDate, setIssueDate] = React.useState<Date | null>(null);
  const [dueDate, setDueDate] = React.useState<Date | null>(null);
  const [status, setStatus] = React.useState('DRAFT');
  const [clientId, setClientId] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [billingAddress, setBillingAddress] = React.useState('');
  const [items, setItems] = React.useState([
    { serviceId: '', quantity: 1, rate: 0, amount: 0 },
  ]);
  const [notes, setNotes] = React.useState('');
  const [createInvoice, { loading }] = useMutation(CREATE_INVOICE);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'serviceId') {
        const selectedService = services.find((s: any) => s.id === value);
        return {
          ...item,
          serviceId: value,
          rate: selectedService ? selectedService.price : 0,
          amount: item.quantity * (selectedService ? selectedService.price : 0),
        };
      }
      if (field === 'rate' || field === 'quantity') {
        const newVal = field === 'rate' ? value : item.rate;
        const newQty = field === 'quantity' ? value : item.quantity;
        return {
          ...item,
          [field]: value,
          amount: newQty * newVal,
        };
      }
      return { ...item, [field]: value };
    }));
  };
  const handleAddItem = () => setItems((prev) => [...prev, { serviceId: '', quantity: 1, rate: 0, amount: 0 }]);
  const handleRemoveItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    try {
      await createInvoice({
        variables: {
          input: {
            clientId,
            number: invoiceNumber,
            date: issueDate,
            dueDate: dueDate,
            status,
            items: items.map(item => ({
              serviceId: item.serviceId,
              quantity: item.quantity,
              price: item.rate,
            })),
            notes,
            billingAddress,
            contactEmail,
          },
        },
      });
      if (refetchDashboard) refetchDashboard();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>Create New Invoice</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Generate a professional invoice for your client
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography fontWeight={600} mb={2}>
            Invoice Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField label="Invoice Number" fullWidth size="small" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Issue Date"
                  value={issueDate}
                  onChange={setIssueDate}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  onChange={setDueDate}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={status} onChange={e => setStatus(e.target.value)}>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="SENT">Sent</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="OVERDUE">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography fontWeight={600} mb={2}>
            Client Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Client</InputLabel>
                <Select label="Select Client" value={clientId} onChange={e => setClientId(e.target.value)}>
                  {clients && clients.map((c: any) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Contact Email" fullWidth size="small" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Billing Address" fullWidth size="small" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
            </Grid>
          </Grid>
        </Paper>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography fontWeight={600}>Invoice Items</Typography>
            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={handleAddItem} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Add Item
            </Button>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <InputLabel>Service</InputLabel>
                        <Select
                          value={item.serviceId}
                          label="Service"
                          onChange={e => handleItemChange(idx, 'serviceId', e.target.value)}
                        >
                          {services && services.map((s: any) => (
                            <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        size="small"
                        inputProps={{ min: 1 }}
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.rate}
                        onChange={e => handleItemChange(idx, 'rate', Number(e.target.value))}
                        size="small"
                        inputProps={{ min: 0 }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      ${item.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveItem(idx)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Notes"
              placeholder="Additional notes or payment terms..."
              multiline
              minRows={3}
              fullWidth
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography fontWeight={600} mb={1}>
                Invoice Summary
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal:</Typography>
                <Typography fontWeight={600}>${subtotal.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Tax (10%):</Typography>
                <Typography fontWeight={600}>${tax.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography fontWeight={700}>Total:</Typography>
                <Typography fontWeight={700} color="primary.main">${total.toFixed(2)}</Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
        <Button variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Save as Draft</Button>
        <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }} disabled={loading}>Create Invoice</Button>
      </DialogActions>
    </Dialog>
  );
};

const Dashboard: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_DASHBOARD_STATS);
  const [openModal, setOpenModal] = React.useState(false);
  const [updateInvoice] = useMutation(UPDATE_INVOICE);

  if (loading) return <Typography>Loading...</Typography>;
  if (error)
    return <Typography color="error">Error loading dashboard data</Typography>;

  const totalOutstanding = data.invoices.reduce(
    (sum: number, inv: any) => sum + (inv.status !== "PAID" ? inv.total : 0),
    0
  );
  const paidThisMonth = data.invoices
    .filter((inv: any) => inv.status === "PAID")
    .reduce((sum: number, inv: any) => sum + inv.total, 0);
  const overdueInvoices = data.invoices.filter(
    (inv: any) => inv.status === "OVERDUE"
  );
  const criticalOverdue = overdueInvoices.length > 0 ? 3 : 0; 

  const recentInvoices = [...data.invoices]
    .sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    )
    .slice(0, 3);

  const handleMarkPaid = async (invoiceId: string) => {
    await updateInvoice({
      variables: {
        id: invoiceId,
        input: { status: 'PAID' },
      },
    });
    refetch();
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Dashboard
      </Typography>
      <Grid container spacing={3} mb={3}>
        {/* @ts-ignore */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, minHeight: 140 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Outstanding
                </Typography>
                <Typography variant="h4" fontWeight={700} mt={1}>
                  ${totalOutstanding.toLocaleString()}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                  <Typography variant="caption" color="error.main" fontWeight={500}>
                    +12%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    from last month
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ bgcolor: '#ffeaea', borderRadius: 2, p: 1 }}>
                <ErrorOutlineIcon color="error" fontSize="large" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
        {/* @ts-ignore */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, minHeight: 140 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Paid This Month
                </Typography>
                <Typography variant="h4" fontWeight={700} mt={1}>
                  ${paidThisMonth.toLocaleString()}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                  <Typography variant="caption" color="success.main" fontWeight={500}>
                    +8%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    from last month
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ bgcolor: '#e6f4ea', borderRadius: 2, p: 1 }}>
                <CheckCircleIcon color="success" fontSize="large" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
        {/* @ts-ignore */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1, minHeight: 140 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Overdue Invoices
                </Typography>
                <Typography variant="h4" fontWeight={700} mt={1}>
                  {overdueInvoices.length}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                  <Typography variant="caption" color="error.main" fontWeight={500}>
                    {criticalOverdue} critical
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    need attention
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ bgcolor: '#fff4e6', borderRadius: 2, p: 1 }}>
                <AccessTimeIcon color="warning" fontSize="large" />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={700}>
            Recent Invoices
          </Typography>
          <Button variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', px: 3 }} onClick={() => setOpenModal(true)}>
            + New Invoice
          </Button>
        </Stack>
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>CLIENT</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>DUE DATE</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentInvoices.map((inv: any, idx: number) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          bgcolor: avatarColors[idx % avatarColors.length],
                          width: 36,
                          height: 36,
                          fontWeight: 700,
                        }}
                      >
                        {inv.client.name ? inv.client.name[0] : "?"}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>{inv.client.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {inv.number}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      ${inv.total.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(inv.status)}</TableCell>
                  <TableCell>
                    {new Date(inv.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button variant="text" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                        View
                      </Button>
                      {inv.status !== 'PAID' && (
                        <Button variant="outlined" size="small" color="success" sx={{ textTransform: 'none', fontWeight: 600 }} onClick={() => handleMarkPaid(inv.id)}>
                          Mark Paid
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
      <NewInvoiceModal open={openModal} onClose={() => setOpenModal(false)} clients={data.clients} refetchDashboard={refetch} services={data.services} />
    </Box>
  );
};

export default Dashboard;
