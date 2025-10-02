import React from 'react';
import { Box } from '@mui/material';
import AccessDenied from '../components/AccessDenied';

const AccessDeniedPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <AccessDenied />
    </Box>
  );
};

export default AccessDeniedPage;