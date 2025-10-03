import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  Flight as FlightIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Add as AddIcon,
  SearchOff as SearchOffIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { Transaction } from '../data/mockData';
import { fetchPayments } from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import DevPaymentModal from '../components/DevPaymentModal';

// Status Chip Component
const StatusChip: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Transaction['status']) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return { 
          text: 'CONFIRMADA', 
          sx: { 
            backgroundColor: '#4caf50', 
            color: 'white',
            '&:hover': { backgroundColor: '#388e3c' }
          }
        };
      case 'pending':
        return { 
          text: 'PENDIENTE', 
          sx: { 
            backgroundColor: '#ff9800', 
            color: 'white',
            '&:hover': { backgroundColor: '#f57c00' }
          }
        };
      case 'failure':
        return { 
          text: 'CANCELADA', 
          sx: { 
            backgroundColor: '#f44336', 
            color: 'white',
            '&:hover': { backgroundColor: '#d32f2f' }
          }
        };
      case 'underpaid':
        return { 
          text: 'PAGO INSUFICIENTE', 
          sx: { 
            backgroundColor: '#ff9800', 
            color: 'white',
            '&:hover': { backgroundColor: '#f57c00' }
          }
        };
      case 'overpaid':
        return { 
          text: 'SOBREPAGO', 
          sx: { 
            backgroundColor: '#2196f3', 
            color: 'white',
            '&:hover': { backgroundColor: '#1976d2' }
          }
        };
      case 'expired':
        return { 
          text: 'EXPIRADA', 
          sx: { 
            backgroundColor: '#f44336', 
            color: 'white',
            '&:hover': { backgroundColor: '#d32f2f' }
          }
        };
      case 'refund':
        return { 
          text: 'REEMBOLSADA', 
          sx: { 
            backgroundColor: '#2196f3', 
            color: 'white',
            '&:hover': { backgroundColor: '#1976d2' }
          }
        };
      default:
        return { 
          text: status?.toUpperCase() || 'DESCONOCIDO', 
          sx: { 
            backgroundColor: '#9e9e9e', 
            color: 'white',
            '&:hover': { backgroundColor: '#757575' }
          }
        };
    }
  };
  const config = getStatusConfig(status);
  return <Chip label={config.text} size="small" variant="filled" sx={config.sx} />;
};

// Custom Empty State Component
const CustomNoRowsOverlay: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 400,
        textAlign: 'center',
        p: 4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: 'grey.50',
          mb: 3,
          border: '2px dashed',
          borderColor: 'grey.300',
        }}
      >
        <SearchOffIcon 
          sx={{ 
            fontSize: 48, 
            color: 'grey.400' 
          }} 
        />
      </Box>
      
      <Typography 
        variant="h6" 
        sx={{ 
          color: 'grey.600', 
          fontWeight: 600, 
          mb: 1 
        }}
      >
        No se encontraron transacciones
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: 'grey.500', 
          maxWidth: 300,
          lineHeight: 1.6 
        }}
      >
        No hay transacciones que coincidan con los filtros aplicados. 
        Intenta ajustar los criterios de búsqueda o crear un nuevo pago de prueba.
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1, 
          mt: 3,
          alignItems: 'center',
          color: 'grey.400',
          fontSize: '0.875rem'
        }}
      >
        <ReceiptIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption">
          Usa los filtros de arriba para refinar la búsqueda
        </Typography>
      </Box>
    </Box>
  );
};

// PDF Generation Function
const generatePaymentPDF = (transaction: Transaction) => {
  const doc = new jsPDF();
  
  // PDF Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SKYTRACKER', 20, 20);
  doc.text('Detalle de Transacción', 20, 35);
  
  // Reset font
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  // Transaction Information (only from Supabase data)
  let yPosition = 55;
  const lineHeight = 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE PAGO', 20, yPosition);
  yPosition += lineHeight * 1.5;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`ID de Pago: ${transaction.id}`, 20, yPosition);
  yPosition += lineHeight;
  doc.text(`ID de Reserva: ${transaction.reservationId}`, 20, yPosition);
  yPosition += lineHeight;
  doc.text(`ID de Usuario: ${transaction.userId}`, 20, yPosition);
  yPosition += lineHeight;
  doc.text(`Fecha de Compra: ${new Date(transaction.purchaseDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`, 20, yPosition);
  yPosition += lineHeight;
  doc.text(`Monto: $${transaction.amount.toFixed(2)}`, 20, yPosition);
  yPosition += lineHeight;
  doc.text(`Estado: ${transaction.status?.toUpperCase()}`, 20, yPosition);
  
  // Footer
  yPosition = 280;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento generado automáticamente por Skytracker', 20, yPosition);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition + 5);
  
  // Download the PDF
  doc.save(`skytracker-pago-${transaction.id}.pdf`);
};

const TransactionsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const queryClient = useQueryClient();

  // Handle logout functionality
  const handleLogout = () => {
    logout();
    // Redirect to our custom login page
    window.location.href = '/login';
  };

  // Function to refresh payments data
  const handleRefreshPayments = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    setSnackbar({
      open: true,
      message: 'Actualizando datos de pagos...',
      severity: 'success'
    });
  };

  // Mutation for updating payment status
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const apiUrl = process.env.REACT_APP_VERCEL_API || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/webhooks/payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error updating payment');
      }

      return data.payment;
    },
    onSuccess: (updatedPayment, { status }) => {
      // Refresh the payments list
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      // Show success message
      let statusText: string;
      switch (status) {
        case 'SUCCESS':
          statusText = 'confirmado';
          break;
        case 'FAILURE':
          statusText = 'cancelado';
          break;
        case 'REFUND':
          statusText = 'reembolsado';
          break;
        default:
          statusText = 'actualizado';
      }
      
      setSnackbar({
        open: true,
        message: `Pago ${statusText} exitosamente`,
        severity: 'success'
      });
    },
    onError: (error) => {
      console.error('Error updating payment:', error);
      setSnackbar({
        open: true,
        message: `Error al actualizar el pago: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const handleUpdatePaymentStatus = (id: string, status: 'SUCCESS' | 'FAILURE' | 'REFUND') => {
    updatePaymentMutation.mutate({ id, status });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePaymentCreated = () => {
    // Refresh the payments list when a new payment is created
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    setSnackbar({
      open: true,
      message: 'Pago de prueba creado exitosamente',
      severity: 'success'
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'reservationId',
      headerName: 'ID Reserva',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'id',
      headerName: 'ID Pago',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'userId',
      headerName: 'ID Usuario',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'purchaseDate',
      headerName: 'Fecha',
      flex: 1,
      minWidth: 130,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        // Format YYYY-MM-DD string to MM/DD/YYYY for display
        const value = params.value;
        if (value && typeof value === 'string') {
          const [year, month, day] = value.split('-');
          return `${month}/${day}/${year}`;
        }
        return value;
      }
    },
    {
      field: 'amount',
      headerName: 'Monto',
      flex: 0.8,
      minWidth: 100,
      headerAlign: 'center',
      align: 'center',
      type: 'number',
      valueFormatter: (value) => `$${Number(value).toFixed(2)}`
    },
    {
      field: 'status',
      headerName: 'Estado',
      flex: 0.8,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => <StatusChip status={params.value} />
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1.5,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const status = params.row.status?.toLowerCase();
        const isPending = status === 'pending';
        const isSuccess = status === 'success';
        const isUpdating = updatePaymentMutation.isPending;

        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {/* Status update buttons - only for pending payments (shown first) */}
            {isPending && (
              <>
                <CheckIcon
                  onClick={() => !isUpdating && handleUpdatePaymentStatus(params.id as string, 'SUCCESS')}
                  sx={{
                    color: isUpdating ? '#bdbdbd' : '#757575',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    fontSize: '1.25rem',
                    '&:hover': {
                      color: isUpdating ? '#bdbdbd' : '#4caf50',
                    }
                  }}
                />
                <CloseIcon
                  onClick={() => !isUpdating && handleUpdatePaymentStatus(params.id as string, 'FAILURE')}
                  sx={{
                    color: isUpdating ? '#bdbdbd' : '#757575',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    fontSize: '1.25rem',
                    '&:hover': {
                      color: isUpdating ? '#bdbdbd' : '#f44336',
                    }
                  }}
                />
              </>
            )}

            {/* Refund button - only for confirmed payments */}
            {isSuccess && (
              <CurrencyExchangeIcon
                onClick={() => !isUpdating && handleUpdatePaymentStatus(params.id as string, 'REFUND')}
                sx={{
                  color: isUpdating ? '#bdbdbd' : '#757575',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '1.25rem',
                  '&:hover': {
                    color: isUpdating ? '#bdbdbd' : '#ff9800',
                  }
                }}
              />
            )}

            {/* PDF Download - always available (shown last) */}
            <DownloadIcon
              onClick={() => handleDownloadPDF(params.id as string)}
              sx={{
                color: '#757575',
                cursor: 'pointer',
                fontSize: '1.25rem',
                '&:hover': {
                  color: '#1976d2',
                }
              }}
            />
          </Box>
        );
      }
    }
  ];

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    staleTime: 60_000,
  });

  // Map payments from Supabase into Transaction shape expected by the grid
  const transactions: Transaction[] = payments
    .map(p => ({
      id: p.id,
      reservationId: p.res_id,
      userId: p.user_id || 'N/A',
      destination: '', // Removed - not used in new design
      airline: '', // Removed - not used in new design
      purchaseDate: p.created_at?.substring(0, 10) || '',
      status: p.status || 'pending',
      amount: p.amount,
      // Keep full timestamp for sorting
      fullCreatedAt: p.created_at || '',
    }))
    // Sort by creation date/time in descending order (newest first)
    .sort((a, b) => {
      const dateA = new Date(a.fullCreatedAt);
      const dateB = new Date(b.fullCreatedAt);
      return dateB.getTime() - dateA.getTime();
    });

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'todos' || transaction.status?.toLowerCase() === selectedStatus;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      // Transaction date is in YYYY-MM-DD format
      const transactionDateStr = transaction.purchaseDate; // e.g., "2025-09-15"
      
      if (dateFrom) {
        matchesDate = matchesDate && transactionDateStr >= dateFrom;
      }
      if (dateTo) {
        matchesDate = matchesDate && transactionDateStr <= dateTo;
      }
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDownloadPDF = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
      generatePaymentPDF(transaction);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">Cargando transacciones...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>Error al cargar las transacciones</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>Reintentar</Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FlightIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1.5 }} />
          <Typography variant="h2" component="h1">Skytracker</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, maxWidth: 400, ml: 4 }}>
          <TextField fullWidth size="small" placeholder="Buscar transacciones..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} /> }} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user.name || user.email}
              </Typography>
            </Box>
          )}
          <Button
            variant="outlined"
            size="medium"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              minWidth: '140px'
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Box>

      {/* Subtitle Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
            Últimas transacciones
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Tus vuelos comprados
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDevModalOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
          }}
        >
          Crear Pago de Prueba
        </Button>
      </Box>

      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3, alignItems: 'end' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Rango de Fecha</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: 'center' }}>
              <TextField type="date" size="small" label="Desde" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>a</Typography>
              <TextField type="date" size="small" label="Hasta" value={dateTo} onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Box>
          </Box>
          <FormControl size="small" fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select value={selectedStatus} label="Estado" onChange={(e) => setSelectedStatus(e.target.value)}>
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="success">Confirmada</MenuItem>
              <MenuItem value="failure">Cancelada</MenuItem>
              <MenuItem value="underpaid">Pago Insuficiente</MenuItem>
              <MenuItem value="overpaid">Sobrepago</MenuItem>
              <MenuItem value="expired">Expirada</MenuItem>
              <MenuItem value="refund">Reembolsada</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              startIcon={<ClearIcon />} 
              onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); setSelectedStatus('todos'); }} 
              fullWidth
            >
              Limpiar Filtros
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />} 
              onClick={handleRefreshPayments} 
              fullWidth
            >
              Actualizar
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={filteredTransactions}
          columns={columns}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          slotProps={{
            pagination: {
              labelRowsPerPage: 'Filas por página:',
              labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) =>
                `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
            },
          }}
          sx={{
            '& .MuiDataGrid-cell:hover': { color: 'primary.main' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.50', fontSize: '0.875rem', fontWeight: 600 },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'grey.50' },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-virtualScroller': { overflow: 'hidden' },
            '& .MuiDataGrid-footerContainer': { 
              borderTop: '1px solid', 
              borderColor: 'divider',
              minHeight: 52 // Ensure enough space for pagination
            }
          }}
          autoHeight={false}
          disableColumnMenu
          disableColumnResize
        />
      </Box>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dev Payment Creation Modal */}
      <DevPaymentModal
        open={devModalOpen}
        onClose={() => setDevModalOpen(false)}
        onPaymentCreated={handlePaymentCreated}
      />
    </Container>
  );
};

export default TransactionsPage;
