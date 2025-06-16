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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { gql } from "@apollo/client";

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      name
      email
      phone
      address
    }
  }
`;

const CREATE_CLIENT = gql`
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      id
      name
      email
      phone
      address
    }
  }
`;

const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      name
      email
      phone
      address
    }
  }
`;

const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id) {
      id
    }
  }
`;

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const Clients: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const { loading, error, data } = useQuery(GET_CLIENTS);
  const [createClient] = useMutation(CREATE_CLIENT, {
    refetchQueries: [{ query: GET_CLIENTS }],
  });
  const [updateClient] = useMutation(UPDATE_CLIENT, {
    refetchQueries: [{ query: GET_CLIENTS }],
  });
  const [deleteClient] = useMutation(DELETE_CLIENT, {
    refetchQueries: [{ query: GET_CLIENTS }],
  });

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await updateClient({
          variables: {
            id: editingClient.id,
            input: formData,
          },
        });
      } else {
        await createClient({
          variables: {
            input: formData,
          },
        });
      }
      handleClose();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient({
          variables: { id },
        });
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error)
    return <Typography color="error">Error loading clients</Typography>;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Clients</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.clients.map((client: Client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.address}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpen(client)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(client.id)}
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

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingClient ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <TextField
              margin="dense"
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Address"
              fullWidth
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingClient ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Clients;
