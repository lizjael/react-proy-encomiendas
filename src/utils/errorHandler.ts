// src/utils/errorHandler.ts
import axios from "axios";

/**
 * Extrae un mensaje legible de cualquier error.
 * Maneja AxiosError con message como string o string[],
 * y códigos HTTP específicos con mensajes amigables.
 */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Mensajes específicos por código HTTP
    switch (status) {
      case 400: {
        const msg = data?.message;
        const detail = Array.isArray(msg) ? msg.join(", ") : msg;
        return detail
          ? `Datos inválidos: ${detail}`
          : "Datos inválidos. Revisa el formulario.";
      }
      case 403:
        return "No tienes permiso para realizar esta acción.";
      case 404:
        return "Registro no encontrado.";
      case 409:
        return "Ya existe un registro con esos datos.";
      case 500:
        return "Error del servidor. Contacta al administrador.";
    }

    // Mensaje genérico del backend
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    if (typeof error.message === "string") return error.message;
  }

  if (typeof error === "string") return error;

  return "Error inesperado. Intenta de nuevo.";
}
