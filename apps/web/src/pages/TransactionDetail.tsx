import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { useNavigate, useParams } from 'react-router-dom';
import { mockTransactionDetails, TransactionDetail } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Download, Loader2, Plane } from 'lucide-react';

const TransactionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: transactionDetail, isLoading, error } = useQuery({
    queryKey: ['transactionDetail', transactionId],
    queryFn: async (): Promise<TransactionDetail> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!transactionId) throw new Error('ID no provisto');
      const detail = mockTransactionDetails[transactionId];
      if (!detail) throw new Error('Transacción no encontrada');
      return detail;
    },
    enabled: !!transactionId
  });

  const handleDownloadInvoice = async () => {
    if (!transactionDetail) return;
    setIsGeneratingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const doc = new jsPDF();
      doc.setFont('helvetica');
      doc.setFontSize(20); 
      doc.setTextColor(0, 0, 0); 
      doc.text('COMPROBANTE DE PAGO', 20, 30);
      doc.setFontSize(12); 
      doc.setTextColor(0, 0, 0); 
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 20, 45);
      doc.setFontSize(16); 
      doc.setTextColor(0, 0, 0); 
      doc.text('DETALLES DE LA TRANSACCIÓN', 20, 65);
      doc.setFontSize(11); 
      doc.setTextColor(0, 0, 0); 
      let yPos = 80;
      doc.text(`ID Reserva: ${transactionDetail.reservationId}`, 20, yPos); yPos += 10;
      doc.text(`Fecha de Compra: ${transactionDetail.purchaseDate}`, 20, yPos); yPos += 10;
      doc.text(`Monto Total: $${transactionDetail.amount.toFixed(2)}`, 20, yPos); yPos += 10;
      doc.text(`Medio de Pago: ${transactionDetail.paymentMethod}`, 20, yPos); yPos += 10;
      doc.text(`Tarjeta: ${transactionDetail.cardNumber}`, 20, yPos);
      yPos += 25; 
      doc.setFontSize(16); 
      doc.setTextColor(0, 0, 0); 
      doc.text('DETALLES ADICIONALES', 20, yPos);
      yPos += 15; 
      doc.setFontSize(11); 
      doc.setTextColor(0, 0, 0);
      doc.text(`Número de Vuelo: ${transactionDetail.flightNumber}`, 20, yPos); yPos += 10;
      doc.text(`Salida: ${transactionDetail.departure}`, 20, yPos); yPos += 10;
      doc.text(`Llegada: ${transactionDetail.arrival}`, 20, yPos); yPos += 10;
      doc.text(`Duración: ${transactionDetail.duration}`, 20, yPos); yPos += 10;
      doc.text(`Clase: ${transactionDetail.flightClass}`, 20, yPos);
      yPos += 30; 
      doc.setFontSize(10); 
      doc.setTextColor(128, 128, 128);
      doc.text('Sistema de Gestión de Pagos', 20, yPos);
      doc.text('© 2025', 20, yPos + 8);
      doc.setDrawColor(0, 0, 0); 
      doc.setLineWidth(0.5); 
      doc.rect(15, 15, 180, yPos + 15);
      const fileName = `Comprobante_${transactionDetail.reservationId.replace('#', '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (e) {
      console.error('Error generating PDF:', e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-gray-900" />
        <p className="text-lg text-muted-foreground">Cargando detalles...</p>
      </div>
    );
  }

  if (error || !transactionDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-900">Error al cargar los detalles</p>
        <Button onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 min-h-screen">
      <div className="flex items-center mb-6 pb-4 border-b">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Historial de Transacciones</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Detalles de la transacción</h2>
            <Button onClick={handleDownloadInvoice} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Comprobante
                </>
              )}
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">ID Reserva</span>
                <span className="font-medium">{transactionDetail.reservationId}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Fecha</span>
                <span>{transactionDetail.purchaseDate}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Monto</span>
                <span className="font-medium">${transactionDetail.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-muted-foreground">Medio de pago</span>
                <div className="text-right">
                  <div>{transactionDetail.paymentMethod}</div>
                  <div className="text-sm text-muted-foreground">{transactionDetail.cardNumber}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-xl font-medium">Detalles Adicionales</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Número de vuelo</span>
                <span className="font-medium">{transactionDetail.flightNumber}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Salida</span>
                <span>{transactionDetail.departure}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Llegada</span>
                <span>{transactionDetail.arrival}</span>
              </div>
              <div className="flex justify-between py-3 border-b">
                <span className="text-sm text-muted-foreground">Duración</span>
                <span>{transactionDetail.duration}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-muted-foreground">Clase</span>
                <span>{transactionDetail.flightClass}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg h-full min-h-[400px] relative overflow-hidden flex items-center justify-center">
            <Plane className="w-32 h-32 text-white/20 rotate-45" />
            <div className="absolute bottom-20 left-8">
              <div className="w-16 h-8 bg-white/20 rounded-full" />
              <div className="w-12 h-6 bg-white/15 rounded-full ml-2 -mt-3" />
            </div>
            <div className="absolute top-32 right-12">
              <div className="w-20 h-10 bg-white/25 rounded-full" />
              <div className="w-14 h-7 bg-white/20 rounded-full ml-3 -mt-4" />
            </div>
            <div className="absolute bottom-32 right-6">
              <div className="w-12 h-6 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailPage;
