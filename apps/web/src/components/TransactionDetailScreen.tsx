import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  IconButton, 
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Download as DownloadIcon,
  Flight as FlightIcon
} from '@mui/icons-material';
import { mockTransactionDetails, TransactionDetail } from '../data/mockData';

interface TransactionDetailScreenProps {
  transactionId?: string;
  onBack?: () => void;
}

const TransactionDetailScreen: React.FC<TransactionDetailScreenProps> = ({ 
  transactionId, 
  onBack 
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Fetch transaction detail using TanStack Query
  const { data: transactionDetail, isLoading, error } = useQuery({
    queryKey: ['transactionDetail', transactionId],
    queryFn: async (): Promise<TransactionDetail> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get transaction detail by ID, fallback to first one if not found
      const detail = transactionId ? mockTransactionDetails[transactionId] : null;
      if (!detail) {
        throw new Error('Transacción no encontrada');
      }
      
      return detail;
    },
    enabled: !!transactionId
  });

  const handleDownloadInvoice = async () => {
    if (!transactionDetail) return;
    
    setIsGeneratingPDF(true);
    
    try {
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
      setIsGeneratingPDF(false);
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
          Cargando detalles...
        </Typography>
      </Box>
    );
  }

  if (error || !transactionDetail) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          Error al cargar los detalles
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
        {onBack && (
          <IconButton 
            onClick={onBack}
            sx={{ mr: 2 }}
            aria-label="Volver"
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h2" component="h1">
          Historial de Transacciones
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Transaction Details */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Transaction Details Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
              Detalles de la transacción
            </Typography>
            <Button
              variant="contained"
              startIcon={isGeneratingPDF ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
              onClick={handleDownloadInvoice}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generando PDF...' : 'Descargar Factura'}
            </Button>
          </Box>
          
          {/* Transaction Details Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">ID Reserva</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{transactionDetail.reservationId}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Fecha</Typography>
                  <Typography variant="body1">{transactionDetail.purchaseDate}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Monto</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>${transactionDetail.amount.toFixed(2)}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Medio de pago</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">{transactionDetail.paymentMethod}</Typography>
                    <Typography variant="body2" color="text.secondary">{transactionDetail.cardNumber}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Flight Details Header */}
          <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            Detalles del Vuelo
          </Typography>

          {/* Flight Details Card */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Número de vuelo</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{transactionDetail.flightNumber}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Salida</Typography>
                  <Typography variant="body1">{transactionDetail.departure}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Llegada</Typography>
                  <Typography variant="body1">{transactionDetail.arrival}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Duración</Typography>
                  <Typography variant="body1">{transactionDetail.duration}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Clase</Typography>
                  <Typography variant="body1">{transactionDetail.flightClass}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Airplane Illustration */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box 
            sx={{ 
              background: 'linear-gradient(to bottom, #60a5fa, #2563eb)',
              borderRadius: 2,
              height: { xs: 300, lg: '100%' },
              minHeight: 400,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Airplane Icon */}
            <FlightIcon 
              sx={{ 
                fontSize: 120, 
                color: 'rgba(0,0,0,0.3)', 
                transform: 'rotate(45deg)' 
              }} 
            />
            
            {/* Decorative clouds */}
            <Box sx={{ position: 'absolute', bottom: 80, left: 32 }}>
              <Box sx={{ width: 64, height: 32, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50px' }} />
              <Box sx={{ width: 48, height: 24, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '50px', ml: 2, mt: -1.5 }} />
            </Box>
            
            <Box sx={{ position: 'absolute', top: 128, right: 48 }}>
              <Box sx={{ width: 80, height: 40, bgcolor: 'rgba(255,255,255,0.25)', borderRadius: '50px' }} />
              <Box sx={{ width: 56, height: 28, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50px', ml: 3, mt: -2 }} />
            </Box>
            
            <Box sx={{ position: 'absolute', bottom: 128, right: 24 }}>
              <Box sx={{ width: 48, height: 24, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50px' }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TransactionDetailScreen;
