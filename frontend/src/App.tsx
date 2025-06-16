import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { client } from "./apollo/client";
import { theme } from "./theme";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Services from "./pages/Services";
import Invoices from "./pages/Invoices";

function App() {
  return (
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/services" element={<Services />} />
              <Route path="/invoices" element={<Invoices />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </ApolloProvider>
  );
}

export default App;
