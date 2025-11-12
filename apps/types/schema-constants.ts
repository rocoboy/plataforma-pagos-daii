/**
 * Database schema constants
 * 
 * IMPORTANTE: Este archivo DEBE estar aquí para que el bridge pueda compilar en Railway.
 * Cuando prepare-types.js copia los archivos, todas las dependencias deben ser locales.
 * 
 * NO BORRAR - requerido para deployment en Railway
 */
export const Constants = {
  public: {
    Enums: {
      currency: ["ARS", "USD", "EUR"],
      payment_status: [
        "PENDING",
        "SUCCESS",
        "FAILURE",
        "UNDERPAID",
        "OVERPAID",
        "EXPIRED",
        "REFUND",
      ],
    },
  },
} as const;

