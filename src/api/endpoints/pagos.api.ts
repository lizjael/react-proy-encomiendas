// src/api/endpoints/pagos.api.ts
import api from "../axiosConfig";
import type { Pago, CreatePagoDto, MetodoPago } from "../../types";

// Los métodos de pago son un enum en el backend — no existe endpoint GET.
// Se exponen aquí como constante para usarlos en selects.
export const METODOS_PAGO: MetodoPago[] = [
  "EFECTIVO",
  "TARJETA_CREDITO",
  "TARJETA_DEBITO",
  "TRANSFERENCIA",
  "QR",
  "DEPOSITO_BANCARIO",
  "MERCADO_PAGO",
  "YAPE",
  "PLIN",
];

export async function getAllPagos(): Promise<Pago[]> {
  const res = await api.get<Pago[]>("/pagos");
  return res.data;
}

export async function getPagoById(id: number): Promise<Pago> {
  const res = await api.get<Pago>(`/pagos/${id}`);
  return res.data;
}

export async function createPago(dto: CreatePagoDto): Promise<Pago> {
  const res = await api.post<Pago>("/pagos", dto);
  return res.data;
}

export async function updatePago(
  id: number,
  dto: Partial<CreatePagoDto>,
): Promise<Pago> {
  const res = await api.patch<Pago>(`/pagos/${id}`, dto);
  return res.data;
}

export async function deletePago(id: number): Promise<void> {
  await api.delete(`/pagos/${id}`);
}
