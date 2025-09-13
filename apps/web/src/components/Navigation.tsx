import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current tab based on path
  const getCurrentTab = () => {
    if (location.pathname.startsWith('/payments')) {
      return 0;
    } else if (location.pathname.startsWith('/transactions')) {
      return 1;
    }
    return 0; // default to payments
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/payments');
        break;
      case 1:
        navigate('/transactions');
        break;
    }
  };

  return (
    <Paper sx={{ mb: 3, mx: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={getCurrentTab()} 
          onChange={handleTabChange}
          aria-label="navigation tabs"
        >
          <Tab 
            icon={<PaymentIcon />} 
            label="Gestión de Pagos" 
            iconPosition="start"
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="Historial de Transacciones" 
            iconPosition="start"
          />
        </Tabs>
      </Box>
    </Paper>
  );
};

export default Navigation;
