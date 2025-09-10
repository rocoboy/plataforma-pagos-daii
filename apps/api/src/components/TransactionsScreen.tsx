import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import { mockTransactions, mockTransactionDetails, Transaction, TransactionDetail } from '../../data/mockData';

// Status Badge Component
const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Transaction['status']) => {
    switch (status) {
      case 'confirmado':
        return {
          text: 'Confirmado',
          className: 'bg-success text-success-foreground'
        };
      case 'pendiente':
        return {
          text: 'Pendiente',
          className: 'bg-warning text-warning-foreground'
        };
      case 'cancelado':
        return {
          text: 'Cancelado',
          className: 'bg-destructive text-destructive-foreground'
        };
      default:
        return {
          text: status,
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-3 py-1 rounded-full text-body-sm font-medium ${config.className}`}>
      {config.text}
    </span>
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

  // Fetch transactions using TanStack Query
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async (): Promise<Transaction[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockTransactions;
    }
  });

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
    const transactionDetail = mockTransactionDetails[transactionId];
    if (!transactionDetail) {
      console.error('Transaction detail not found for ID:', transactionId);
      return;
    }
    
    // Add to generating PDFs set
    setGeneratingPDFs(prev => {
      const newSet = new Set(prev);
      newSet.add(transactionId);
      return newSet;
    });
    
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
      <div className="min-h-screen bg-background flex items-center justify-center font-roboto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body-md text-muted-foreground">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-roboto">
        <div className="text-center">
          <p className="text-body-md text-destructive mb-4">Error al cargar las transacciones</p>
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
    <div className="min-h-screen bg-background pb-16 font-roboto">
      {/* Main Content Container */}
      <div className="bg-background shadow-lg">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Plane Icon */}
              <svg className="w-7 h-7 text-primary mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <h1 className="text-heading-lg text-foreground">Historial de Transacciones</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-md ml-8">
              <input
                type="text"
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-body-md"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-background border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              {/* Date Range Filter */}
              <div>
                <label className="block text-subtitle-sm text-foreground mb-1">
                  Rango de Fecha
                </label>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-1">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="Desde"
                    className="w-full sm:flex-1 px-2 py-2 text-body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                  <span className="hidden sm:flex items-center text-muted-foreground text-body-sm px-1">a</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="Hasta"
                    className="w-full sm:flex-1 px-2 py-2 text-body-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
              </div>

              {/* Airline Filter */}
              <div>
                <label className="block text-subtitle-sm text-foreground mb-1">
                  Aerolínea
                </label>
                <select
                  value={selectedAirline}
                  onChange={(e) => setSelectedAirline(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-body-md"
                >
                  <option value="todas">Todas</option>
                  <option value="Delta">Delta</option>
                  <option value="American Airlines">American Airlines</option>
                  <option value="United Airlines">United Airlines</option>
                  <option value="Alaska Airlines">Alaska Airlines</option>
                  <option value="JetBlue">JetBlue</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-subtitle-sm text-foreground mb-1">
                  Estado
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-body-md"
                >
                  <option value="todos">Todos</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateFrom('');
                    setDateTo('');
                    setSelectedAirline('todas');
                    setSelectedStatus('todos');
                  }}
                  className="w-full px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-foreground hover:text-background transition-colors text-subtitle-sm"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-subtitle-sm text-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-subtitle-sm text-foreground uppercase tracking-wider">
                  Fecha de Compra
                </th>
                <th className="px-6 py-3 text-left text-subtitle-sm text-foreground uppercase tracking-wider">
                  ID Reserva
                </th>
                <th className="px-6 py-3 text-left text-subtitle-sm text-foreground uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-subtitle-sm text-foreground uppercase tracking-wider">
                  Aerolínea
                </th>
                <th className="px-6 py-3 text-left text-subtitle-sm text-foreground uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-center text-subtitle-sm text-foreground uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-muted">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={transaction.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body-md text-foreground">
                    {transaction.purchaseDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body-md font-medium text-foreground">
                    {transaction.reservationId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body-md text-foreground">
                    {transaction.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body-md text-foreground">
                    {transaction.airline}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body-md text-foreground">
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-body-md font-medium text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetail(transaction.id)}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded text-body-sm hover:opacity-90 transition-opacity"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(transaction.id)}
                        disabled={generatingPDFs.has(transaction.id)}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-body-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {generatingPDFs.has(transaction.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            <span className="text-xs">PDF...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs">Descargar Factura</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-7xl mx-auto px-6">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-subtitle-md text-foreground">No se encontraron transacciones</h3>
              <p className="mt-1 text-body-md text-muted-foreground">
                Intenta ajustar los filtros de búsqueda.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Results Summary - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-3 bg-primary/10 border-t border-primary/20 shadow-lg z-10">
        <div className="max-w-7xl mx-auto">
          <p className="text-body-md text-primary text-center">
            Mostrando {filteredTransactions.length} de {transactions.length} transacciones
            {(dateFrom || dateTo || selectedAirline !== 'todas' || selectedStatus !== 'todos' || searchTerm) && 
              <span className="ml-2 text-primary font-medium">(filtrado aplicado)</span>
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionsScreen;
