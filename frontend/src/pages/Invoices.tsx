import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { gql } from "@apollo/client";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const GET_INVOICES = gql`
  query GetInvoices {
    invoices {
      id
      number
      date
      dueDate
      status
      total
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

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      name
    }
  }
`;

const GET_SERVICES = gql`
  query GetServices {
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
      number
      date
      dueDate
      status
      total
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

const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id) {
      id
    }
  }
`;

interface InvoiceItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  service: {
    id: string;
    name: string;
  };
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: string;
  total: number;
  client: {
    id: string;
    name: string;
  };
  items: InvoiceItem[];
}

interface Client {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

const Invoices: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    date: new Date(),
    dueDate: new Date(),
    items: [{ serviceId: "", quantity: 1, price: 0 }],
  });

  const {
    loading: loadingInvoices,
    error: errorInvoices,
    data: invoiceData,
  } = useQuery(GET_INVOICES);
  const {
    loading: loadingClients,
    error: errorClients,
    data: clientData,
  } = useQuery(GET_CLIENTS);
  const {
    loading: loadingServices,
    error: errorServices,
    data: serviceData,
  } = useQuery(GET_SERVICES);

  const [createInvoice] = useMutation(CREATE_INVOICE, {
    refetchQueries: [{ query: GET_INVOICES }],
  });
  const [updateInvoice] = useMutation(UPDATE_INVOICE, {
    refetchQueries: [{ query: GET_INVOICES }],
  });
  const [deleteInvoice] = useMutation(DELETE_INVOICE, {
    refetchQueries: [{ query: GET_INVOICES }],
  });

  const handleOpen = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        clientId: invoice.client.id,
        date: new Date(invoice.date),
        dueDate: new Date(invoice.dueDate),
        items: invoice.items.map((item) => ({
          serviceId: item.service.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    } else {
      setEditingInvoice(null);
      setFormData({
        clientId: "",
        date: new Date(),
        dueDate: new Date(),
        items: [{ serviceId: "", quantity: 1, price: 0 }],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInvoice(null);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { serviceId: "", quantity: 1, price: 0 }],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await updateInvoice({
          variables: {
            id: editingInvoice.id,
            input: {
              clientId: formData.clientId,
              date: formData.date,
              dueDate: formData.dueDate,
              items: formData.items.map((item) => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });
      } else {
        await createInvoice({
          variables: {
            input: {
              clientId: formData.clientId,
              number: `INV-${Date.now()}`,
              date: formData.date,
              dueDate: formData.dueDate,
              items: formData.items.map((item) => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });
      }
      setOpen(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice({
          variables: { id },
        });
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  if (loadingInvoices || loadingClients || loadingServices) {
    return <Typography>Loading...</Typography>;
  }

  if (errorInvoices || errorClients || errorServices) {
    return <Typography color="error">Error loading data</Typography>;
  }
  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Invoices</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Create Invoice
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoiceData.invoices.map((invoice: Invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.number}</TableCell>
                <TableCell>{invoice.client.name}</TableCell>
                <TableCell>
                  {new Date(invoice.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>${invoice.total.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpen(invoice)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(invoice.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle>
            {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {/* @ts-ignore */}
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Client</InputLabel>
                  <Select
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                    label="Client"
                  >
                    {clientData.clients.map((client: Client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* @ts-ignore */}
              <Grid xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={formData.date}
                    onChange={(date) =>
                      setFormData({ ...formData, date: date || new Date() })
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              {/* @ts-ignore */}
              <Grid xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Due Date"
                    value={formData.dueDate}
                    onChange={(date) =>
                      setFormData({ ...formData, dueDate: date || new Date() })
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              {/* @ts-ignore */}
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom>
                  Items
                </Typography>
                {formData.items.map((item, index) => (
                  <Box key={index} mb={2}>
                    <Grid container spacing={2} alignItems="center">
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={4}>
                        <FormControl fullWidth>
                          <InputLabel>Service</InputLabel>
                          <Select
                            value={item.serviceId}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "serviceId",
                                e.target.value
                              )
                            }
                            label="Service"
                          >
                            {serviceData.services.map((service: Service) => (
                              <MenuItem key={service.id} value={service.id}>
                                {service.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={3}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={3}>
                        <TextField
                          label="Price"
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              parseFloat(e.target.value)
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                      {/* @ts-ignore */}
                      <Grid xs={12} sm={2}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  sx={{ mt: 2 }}
                >
                  Add Item
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingInvoice ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Invoices;
