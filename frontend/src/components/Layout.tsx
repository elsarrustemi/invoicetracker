import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  ButtonBase,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  BarChart as BarChartIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Invoices", icon: <ReceiptIcon />, path: "/invoices" },
    { text: "Clients", icon: <PeopleIcon />, path: "/clients" },
    { text: "Payments", icon: <PaymentIcon />, path: "/payments" },
    { text: "Services", icon: <SettingsIcon />, path: "/services" },
    { text: "Reports", icon: <BarChartIcon />, path: "/reports" },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ButtonBase
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              width: "100%",
              textAlign: "left",
              bgcolor:
                location.pathname === item.path
                  ? "primary.main"
                  : "transparent",
              color:
                location.pathname === item.path
                  ? "#fff"
                  : "text.primary",
              borderRadius: 2,
              mb: 0.5,
              px: 1,
              py: 0.5,
              '&:hover': {
                bgcolor: location.pathname === item.path ? 'primary.main' : 'action.hover',
              },
            }}
          >
            <ListItem>
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#fff' : 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ fontWeight: location.pathname === item.path ? 700 : 500 }} />
            </ListItem>
          </ButtonBase>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#fff',
          color: 'text.primary',
          boxShadow: 0,
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" fontWeight={700}>
              Invoice Tracker
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon sx={{ fontSize: 28, cursor: 'pointer' }} />
            </Badge>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar
                alt="Sarah Johnson"
                src="https://randomuser.me/api/portraits/women/44.jpg"
                sx={{ width: 36, height: 36 }}
              />
              <Typography fontWeight={600} sx={{ display: { xs: 'none', md: 'block' } }}>
                Sarah Johnson
              </Typography>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
