//solamente lo uso para hacer unas pruebas locales, este archivo no se usa!


type Row<T> = T & { created_at: string; updated_at?: string };

export const db = {
  bookings: new Map<string, Row<any>>(),
  payments: new Map<string, Row<any>>(),
  refunds: new Map<string, Row<any>>(),
  invoices: new Map<string, Row<any>>(),
  creditNotes: new Map<string, Row<any>>(),
};

export const now = () => new Date().toISOString();
export const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
