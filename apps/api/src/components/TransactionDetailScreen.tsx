import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { mockTransactionDetails, TransactionDetail } from '../../data/mockData';

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
      <div className="min-h-screen bg-background flex items-center justify-center font-roboto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body-md text-muted-foreground">Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (error || !transactionDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-roboto">
        <div className="text-center">
          <p className="text-body-md text-destructive mb-4">Error al cargar los detalles</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 text-body-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-roboto">
      {/* Main Content Container */}
      <div className="bg-background shadow-lg">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-muted rounded-md transition-colors"
                aria-label="Volver"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-heading-lg text-foreground">Historial de Transacciones</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Transaction Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Transaction Details Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-heading-md text-primary font-bold">Detalles de la transacción</h2>
              <button
                onClick={handleDownloadInvoice}
                disabled={isGeneratingPDF}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-body-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar Factura
                  </>
                )}
              </button>
            </div>
            
            {/* Transaction Details Section */}
            <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">ID Reserva</span>
                  <span className="text-body-md text-foreground font-medium">{transactionDetail.reservationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Fecha</span>
                  <span className="text-body-md text-foreground">{transactionDetail.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Monto</span>
                  <span className="text-body-md text-foreground font-medium">${transactionDetail.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Medio de pago</span>
                  <div className="text-right">
                    <div className="text-body-md text-foreground">{transactionDetail.paymentMethod}</div>
                    <div className="text-body-sm text-muted-foreground">{transactionDetail.cardNumber}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details Header */}
            <h2 className="text-heading-md text-primary font-bold">Detalles del Vuelo</h2>

            {/* Flight Details Section */}
            <div className="bg-background rounded-lg border border-border p-6 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Número de vuelo</span>
                  <span className="text-body-md text-foreground font-medium">{transactionDetail.flightNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Salida</span>
                  <span className="text-body-md text-foreground">{transactionDetail.departure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Llegada</span>
                  <span className="text-body-md text-foreground">{transactionDetail.arrival}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Duración</span>
                  <span className="text-body-md text-foreground">{transactionDetail.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-subtitle-sm text-muted-foreground">Clase</span>
                  <span className="text-body-md text-foreground">{transactionDetail.flightClass}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Airplane Image */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg overflow-hidden h-96 lg:h-full min-h-[400px] relative">
              {/* Airplane silhouette */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className="w-32 h-32 text-black/30 transform rotate-45" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              
              {/* Cloud elements */}
              <div className="absolute bottom-20 left-8">
                <div className="w-16 h-8 bg-white/20 rounded-full"></div>
                <div className="w-12 h-6 bg-white/15 rounded-full ml-4 -mt-3"></div>
              </div>
              
              <div className="absolute top-32 right-12">
                <div className="w-20 h-10 bg-white/25 rounded-full"></div>
                <div className="w-14 h-7 bg-white/20 rounded-full ml-6 -mt-4"></div>
              </div>
              
              <div className="absolute bottom-32 right-6">
                <div className="w-12 h-6 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Close Main Content Container */}
      </div>
    </div>
  );
};

export default TransactionDetailScreen;
