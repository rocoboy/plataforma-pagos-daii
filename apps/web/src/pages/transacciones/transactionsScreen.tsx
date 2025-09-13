import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { 
  DataGrid, 
  GridColDef, 
  GridActionsCellItem,
  GridRowParams 
} from '@mui/x-data-grid';
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
  Visibility as VisibilityIcon, 
  Download as DownloadIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Flight as FlightIcon
} from '@mui/icons-material';
import { Transaction } from '../../data/mockData';
import { paymentService, Payment } from '../../services/paymentService';

// Status Chip Component using our custom theme colors - Updated
const StatusChip: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmado':
        return {
          text: 'Confirmado',
          color: 'success' as const
        };
      case 'pendiente':
        return {
          text: 'Pendiente',
          color: 'warning' as const
        };
      case 'cancelado':
        return {
          text: 'Cancelado',
          color: 'error' as const
        };
      default:
        return {
          text: status,
          color: 'default' as const
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip 
      label={config.text}
      color={config.color}
      size="small"
      variant="filled"
    />
  );
};

// Main Component Props
interface TransactionsScreenProps {
  onViewDetail?: (transactionId: string) => void;
}

// Main Component
const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ onViewDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('todas');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [generatingPDFs, setGeneratingPDFs] = useState<Set<string>>(new Set());

  // Define DataGrid columns with flexible widths
  const columns: GridColDef[] = [
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
      field: 'purchaseDate',
      headerName: 'Fecha de Compra',
      flex: 1,
      minWidth: 130,
      headerAlign: 'center',
      align: 'center',
      type: 'date',
      valueGetter: (value) => new Date(value)
    },
    {
      field: 'reservationId',
      headerName: 'ID Reserva',
      flex: 0.9,
      minWidth: 120,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'destination',
      headerName: 'Destino',
      flex: 1,
      minWidth: 130,
      headerAlign: 'center',
      align: 'center'
    },
    {
      field: 'airline',
      headerName: 'Aerolínea',
      flex: 1.2,
      minWidth: 140,
      headerAlign: 'center',
      align: 'center'
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
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      flex: 1.3,
      minWidth: 180,
      headerAlign: 'center',
      align: 'center',
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="Ver Detalle"
          onClick={() => handleViewDetail(params.id as string)}
        />,
        <GridActionsCellItem
          key="download"
          icon={generatingPDFs.has(params.id as string) ? <CircularProgress size={16} /> : <DownloadIcon />}
          label="Descargar Factura"
          onClick={() => handleDownloadInvoice(params.id as string)}
          disabled={generatingPDFs.has(params.id as string)}
        />
      ]
    }
  ];

  // Transform Payment data to Transaction format
  const transformPaymentToTransaction = (payment: Payment): Transaction => {
    // Map payment status to transaction status
    const statusMapping = {
      'SUCCESS': 'confirmado' as const,
      'PENDING': 'pendiente' as const,
      'FAILURE': 'cancelado' as const,
      'UNDERPAID': 'pendiente' as const,
      'OVERPAID': 'confirmado' as const,
      'EXPIRED': 'cancelado' as const,
      'REFUND': 'cancelado' as const,
    };

    return {
      id: payment.id,
      reservationId: payment.res_id,
      destination: payment.meta?.destination || 'Destino no especificado',
      airline: payment.meta?.airline || 'Aerolínea no especificada',
      purchaseDate: new Date(payment.created_at).toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: statusMapping[payment.status as keyof typeof statusMapping] || 'pendiente',
      amount: payment.amount
    };
  };

  // Transform Payment data to TransactionDetail format for PDF generation
  const transformPaymentToTransactionDetail = (payment: Payment) => {
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    return {
      id: payment.id,
      reservationId: payment.res_id,
      purchaseDate: formatDate(payment.created_at),
      amount: payment.amount,
      paymentMethod: payment.meta?.paymentMethod || 'Método no especificado',
      cardNumber: payment.meta?.cardNumber || '**** ****',
      flightNumber: payment.meta?.flightNumber || 'N/A',
      departure: payment.meta?.departure || 'Origen no especificado',
      arrival: payment.meta?.arrival || 'Destino no especificado',
      duration: payment.meta?.duration || 'N/A',
      flightClass: payment.meta?.flightClass || 'Clase no especificada'
    };
  };

  // Fetch transactions using TanStack Query
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await paymentService.getAllPayments();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch payments');
      }
      
      // Transform payments to transactions
      return response.data.map(transformPaymentToTransaction);
    }
  });

  // Get unique airlines from transactions for filter
  const uniqueAirlines = Array.from(new Set(transactions.map(t => t.airline))).filter(airline => airline !== 'Aerolínea no especificada');

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.reservationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.airline.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAirline = selectedAirline === 'todas' || transaction.airline === selectedAirline;
    const matchesStatus = selectedStatus === 'todos' || transaction.status === selectedStatus;
    
    // Date filtering - improved logic
    let matchesDate = true;
    if (dateFrom || dateTo) {
      // Parse transaction date and normalize to start of day
      const transactionDate = new Date(transaction.purchaseDate);
      transactionDate.setHours(0, 0, 0, 0);
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && transactionDate >= fromDate;
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include entire day
        matchesDate = matchesDate && transactionDate <= toDate;
      }
    }
    
    return matchesSearch && matchesAirline && matchesStatus && matchesDate;
  });

  const handleViewDetail = (transactionId: string) => {
    if (onViewDetail) {
      onViewDetail(transactionId);
    } else {
      console.log('View detail for transaction:', transactionId);
      // TODO: Implement view detail functionality
    }
  };

  const handleDownloadInvoice = async (transactionId: string) => {
    // Add to generating PDFs set
    setGeneratingPDFs(prev => {
      const newSet = new Set(prev);
      newSet.add(transactionId);
      return newSet;
    });
    
    try {
      // Fetch payment data
      const response = await paymentService.getPayment(transactionId);
      if (!response.success || !response.data) {
        console.error('Payment not found for ID:', transactionId);
        return;
      }

      const payment = response.data;
      const transactionDetail = transformPaymentToTransactionDetail(payment);
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set up fonts and colors
      doc.setFont('helvetica');
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(80, 123, 216); // Primary color
      doc.text('FACTURA DE VUELO', 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 20, 45);
      
      // Transaction Details Section
      doc.setFontSize(16);
      doc.setTextColor(80, 123, 216);
      doc.text('DETALLES DE LA TRANSACCIÓN', 20, 65);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      let yPos = 80;
      
      doc.text(`ID Reserva: ${transactionDetail.reservationId}`, 20, yPos);
      yPos += 10;
      doc.text(`Fecha de Compra: ${transactionDetail.purchaseDate}`, 20, yPos);
      yPos += 10;
      doc.text(`Monto Total: $${transactionDetail.amount.toFixed(2)}`, 20, yPos);
      yPos += 10;
      doc.text(`Medio de Pago: ${transactionDetail.paymentMethod}`, 20, yPos);
      yPos += 10;
      doc.text(`Tarjeta: ${transactionDetail.cardNumber}`, 20, yPos);
      
      // Flight Details Section
      yPos += 25;
      doc.setFontSize(16);
      doc.setTextColor(80, 123, 216);
      doc.text('DETALLES DEL VUELO', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      doc.text(`Número de Vuelo: ${transactionDetail.flightNumber}`, 20, yPos);
      yPos += 10;
      doc.text(`Salida: ${transactionDetail.departure}`, 20, yPos);
      yPos += 10;
      doc.text(`Llegada: ${transactionDetail.arrival}`, 20, yPos);
      yPos += 10;
      doc.text(`Duración: ${transactionDetail.duration}`, 20, yPos);
      yPos += 10;
      doc.text(`Clase: ${transactionDetail.flightClass}`, 20, yPos);
      
      // Footer
      yPos += 30;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Plataforma de Pagos DAII - Sistema de Gestión de Pagos', 20, yPos);
      doc.text('Desarrollo de Apps II - Grupo 7', 20, yPos + 8);
      
      // Add a border
      doc.setDrawColor(80, 123, 216);
      doc.setLineWidth(0.5);
      doc.rect(15, 15, 180, yPos + 15);
      
      // Download the PDF
      const fileName = `Factura_${transactionDetail.reservationId.replace('#', '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      console.log('Invoice downloaded:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      // Remove from generating PDFs set
      setGeneratingPDFs(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Cargando transacciones...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          Error al cargar las transacciones
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FlightIcon sx={{ fontSize: 28, color: 'primary.main', mr: 1.5 }} />
          <Typography variant="h2" component="h1">
            Historial de Transacciones
          </Typography>
        </Box>
        
        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, maxWidth: 400, ml: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
            }}
          />
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, alignItems: 'end' }}>
          {/* Date Range Filter */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Rango de Fecha
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, alignItems: 'center' }}>
              <TextField
                type="date"
                size="small"
                label="Desde"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: '2px',
                    },
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                a
              </Typography>
              <TextField
                type="date"
                size="small"
                label="Hasta"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: '2px',
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Airline Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>Aerolínea</InputLabel>
            <Select
              value={selectedAirline}
              label="Aerolínea"
              onChange={(e) => setSelectedAirline(e.target.value)}
            >
              <MenuItem value="todas">Todas</MenuItem>
              {uniqueAirlines.map((airline) => (
                <MenuItem key={airline} value={airline}>
                  {airline}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl size="small" fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={selectedStatus}
              label="Estado"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="confirmado">Confirmado</MenuItem>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="cancelado">Cancelado</MenuItem>
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ClearIcon />}
            onClick={() => {
              setSearchTerm('');
              setDateFrom('');
              setDateTo('');
              setSelectedAirline('todas');
              setSelectedStatus('todos');
            }}
            fullWidth
          >
            Limpiar Filtros
          </Button>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredTransactions}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
              fontSize: '0.875rem',
              fontWeight: 600,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'grey.50',
            },
            '& .MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            // Asegurar que las columnas ocupen todo el ancho
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'hidden',
            }
          }}
          autoHeight={false}
          disableColumnMenu
          disableColumnResize
        />
      </Box>

      {/* Results Summary */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1, textAlign: 'center' }}>
        <Typography variant="body2">
          Mostrando {filteredTransactions.length} de {transactions.length} transacciones
          {(dateFrom || dateTo || selectedAirline !== 'todas' || selectedStatus !== 'todos' || searchTerm) && 
            <Typography component="span" sx={{ ml: 1, fontWeight: 'medium' }}>
              (filtrado aplicado)
            </Typography>
          }
        </Typography>
      </Box>
    </Container>
  );
};

export default TransactionsScreen;
