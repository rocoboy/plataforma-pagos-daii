import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  Flight as FlightIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Transaction } from '../data/mockData';
import { fetchPayments } from '../lib/apiClient';
import jsPDF from 'jspdf';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');

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
      type: 'date',
      valueGetter: (value) => new Date(value)
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
      headerName: 'PDF',
      flex: 1,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={() => handleDownloadPDF(params.id as string)}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            fontSize: '0.75rem',
            padding: '4px 12px',
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          DESCARGAR PDF
        </Button>
      )
    }
  ];

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    staleTime: 60_000,
  });

  // Map payments from Supabase into Transaction shape expected by the grid
  const transactions: Transaction[] = payments.map(p => ({
    id: p.id,
    reservationId: p.res_id,
    userId: p.user_id || 'N/A',
    destination: '', // Removed - not used in new design
    airline: '', // Removed - not used in new design
    purchaseDate: p.created_at?.substring(0, 10) || '',
    status: p.status || 'pending',
    amount: p.amount,
  }));

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'todos' || transaction.status === selectedStatus;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const transactionDate = new Date(transaction.purchaseDate); transactionDate.setHours(0,0,0,0);
      if (dateFrom) { const fromDate = new Date(dateFrom); fromDate.setHours(0,0,0,0); matchesDate = matchesDate && transactionDate >= fromDate; }
      if (dateTo) { const toDate = new Date(dateTo); toDate.setHours(23,59,59,999); matchesDate = matchesDate && transactionDate <= toDate; }
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
      </Box>

      {/* Subtitle Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h2" sx={{ color: 'primary.main', fontWeight: 600, mb: 1 }}>
          Últimas transacciones
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Tus vuelos comprados
        </Typography>
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
          <Button variant="outlined" color="secondary" startIcon={<ClearIcon />} onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); setSelectedStatus('todos'); }} fullWidth>Limpiar Filtros</Button>
        </Box>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTransactions}
          columns={columns}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': { color: 'primary.main' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: 'grey.50', fontSize: '0.875rem', fontWeight: 600 },
            '& .MuiDataGrid-cell': { borderBottom: '1px solid', borderColor: 'divider', fontSize: '0.875rem' },
            '& .MuiDataGrid-row:hover': { backgroundColor: 'grey.50' },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-virtualScroller': { overflow: 'hidden' }
          }}
          autoHeight={false}
          disableColumnMenu
          disableColumnResize
        />
      </Box>
    </Container>
  );
};

export default TransactionsPage;
