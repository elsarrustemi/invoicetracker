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

const GET_SERVICES = gql`
  query GetServices {
    services {
      id
      name
      description
      price
    }
  }
`;

const CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      id
      name
      description
      price
    }
  }
`;

const UPDATE_SERVICE = gql`
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      id
      name
      description
      price
    }
  }
`;

const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      id
    }
  }
`;

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
}

const Services: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  const { loading, error, data } = useQuery(GET_SERVICES);
  const [createService] = useMutation(CREATE_SERVICE, {
    refetchQueries: [{ query: GET_SERVICES }],
  });
  const [updateService] = useMutation(UPDATE_SERVICE, {
    refetchQueries: [{ query: GET_SERVICES }],
  });
  const [deleteService] = useMutation(DELETE_SERVICE, {
    refetchQueries: [{ query: GET_SERVICES }],
  });

  const handleOpen = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || "",
        price: service.price.toString(),
      });
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        description: "",
        price: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingService) {
        await updateService({
          variables: {
            id: editingService.id,
            input,
          },
        });
      } else {
        await createService({
          variables: {
            input,
          },
        });
      }
      handleClose();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService({
          variables: { id },
        });
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error)
    return <Typography color="error">Error loading services</Typography>;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Services</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Service
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.services.map((service: Service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.description}</TableCell>
                <TableCell>${service.price.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpen(service)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(service.id)}
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
            {editingService ? "Edit Service" : "Add New Service"}
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
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
              inputProps={{ step: "0.01", min: "0" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingService ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Services;
