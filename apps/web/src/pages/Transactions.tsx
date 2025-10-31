import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '../data/mockData';
import { fetchPayments } from '../lib/apiClient';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Search, 
  LogOut, 
  User, 
  RotateCw, 
  X as XIcon, 
  Download, 
  SearchX,
  Receipt,
  Loader2
} from 'lucide-react';

// Status Badge Component
const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Transaction['status']) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return { text: 'CONFIRMADA', variant: 'success' as const };
      case 'pending':
        return { text: 'PENDIENTE', variant: 'pending' as const };
      case 'failure':
        return { text: 'CANCELADA', variant: 'destructive' as const };
      case 'underpaid':
        return { text: 'PAGO INSUFICIENTE', variant: 'warning' as const };
      case 'overpaid':
        return { text: 'SOBREPAGO', variant: 'default' as const };
      case 'expired':
        return { text: 'EXPIRADA', variant: 'destructive' as const };
      case 'refund':
        return { text: 'REEMBOLSADA', variant: 'info' as const };
      default:
        return { text: status?.toUpperCase() || 'DESCONOCIDO', variant: 'outline' as const };
    }
  };
  const config = getStatusConfig(status);
  return <Badge variant={config.variant}>{config.text}</Badge>;
};

// Empty State Component
const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 border-2 border-dashed border-border">
        <SearchX className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No se encontraron transacciones
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-md mb-4">
        No hay transacciones que coincidan con los filtros aplicados. 
        Intenta ajustar los criterios de búsqueda o crear un nuevo pago de prueba.
      </p>
      
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Receipt className="w-4 h-4" />
        <span>Usa los filtros de arriba para refinar la búsqueda</span>
      </div>
    </div>
  );
};

// PDF Generation Function
const generatePaymentPDF = (transaction: Transaction) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SISTEMA DE PAGOS', 20, 20);
  doc.text('Detalle de Transacción', 20, 35);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
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
  
  yPosition = 280;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Documento generado automáticamente', 20, yPosition);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, yPosition + 5);
  
  doc.save(`pago-${transaction.id}.pdf`);
};

const TransactionsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleRefreshPayments = () => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    setSnackbar({ message: 'Actualizando datos de pagos...', type: 'success' });
    setTimeout(() => setSnackbar(null), 3000);
  };

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
    staleTime: 60_000,
  });

  // Map payments from Supabase
  const transactions: Transaction[] = payments
    .map(p => ({
      id: p.id,
      reservationId: p.res_id,
      userId: p.user_id || 'N/A',
      destination: '',
      airline: '',
      purchaseDate: p.created_at?.substring(0, 10) || '',
      status: p.status || 'pending',
      amount: p.amount,
      fullCreatedAt: p.created_at || '',
    }))
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
      const transactionDateStr = transaction.purchaseDate;
      
      if (dateFrom) {
        matchesDate = matchesDate && transactionDateStr >= dateFrom;
      }
      if (dateTo) {
        matchesDate = matchesDate && transactionDateStr <= dateTo;
      }
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div className="container mx-auto py-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Transacciones</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Buscar transacciones..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user.name || user.email}</span>
            </div>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Title Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-medium mb-2">
            Últimas transacciones
          </h2>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Desde</Label>
            <Input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Hasta</Label>
            <Input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="success">Confirmada</SelectItem>
                <SelectItem value="failure">Cancelada</SelectItem>
                <SelectItem value="underpaid">Pago Insuficiente</SelectItem>
                <SelectItem value="overpaid">Sobrepago</SelectItem>
                <SelectItem value="expired">Expirada</SelectItem>
                <SelectItem value="refund">Reembolsada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); setSelectedStatus('todos'); }} 
              className="flex-1"
            >
              <XIcon className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
            <Button 
              variant="outline"
              onClick={handleRefreshPayments} 
              className="flex-1"
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {/* Snackbar */}
      {snackbar && (
        <Alert variant={snackbar.type === 'success' ? 'default' : 'destructive'} className="mb-4">
          <AlertDescription>{snackbar.message}</AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-gray-900 mb-4" />
            <p className="text-lg text-muted-foreground">Cargando transacciones...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-lg text-gray-900">Error al cargar las transacciones</p>
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        ) : paginatedTransactions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ID Reserva</TableHead>
                  <TableHead className="text-center">ID Pago</TableHead>
                  <TableHead className="text-center">ID Usuario</TableHead>
                  <TableHead className="text-center">Fecha</TableHead>
                  <TableHead className="text-center">Monto</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-center">{transaction.reservationId}</TableCell>
                      <TableCell className="text-center">{transaction.id}</TableCell>
                      <TableCell className="text-center">{transaction.userId}</TableCell>
                      <TableCell className="text-center">
                        {transaction.purchaseDate && (() => {
                          const [year, month, day] = transaction.purchaseDate.split('-');
                          return `${month}/${day}/${year}`;
                        })()}
                      </TableCell>
                      <TableCell className="text-center">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => generatePaymentPDF(transaction)}
                            className="h-8 w-8"
                            title="Descargar PDF"
                          >
                            <Download className="h-4 w-4 text-gray-700" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, filteredTransactions.length)} de {filteredTransactions.length}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Filas:</Label>
                  <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(0); }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Anterior
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TransactionsPage;
