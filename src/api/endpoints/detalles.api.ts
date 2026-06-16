// src/api/endpoints/detalles.api.ts
import api from "../axiosConfig";
import type {
  DetalleEncomienda,
  CreateDetalleEncomiendaDto,
} from "../../types";

// ✅ NUEVO: obtener todos los detalles de una encomienda específica
export async function getDetallesByEncomienda(
  idEncomienda: number,
): Promise<DetalleEncomienda[]> {
  const res = await api.get<DetalleEncomienda[]>(
    `/detalle-encomiendas/encomienda/${idEncomienda}`,
  );
  return res.data;
}

export async function createDetalle(
  dto: CreateDetalleEncomiendaDto,
): Promise<DetalleEncomienda> {
  const res = await api.post<DetalleEncomienda>("/detalle-encomiendas", dto);
  return res.data;
}

export async function updateDetalle(
  id: number,
  dto: Partial<CreateDetalleEncomiendaDto>,
): Promise<DetalleEncomienda> {
  const res = await api.patch<DetalleEncomienda>(
    `/detalle-encomiendas/${id}`,
    dto,
  );
  return res.data;
}

export async function deleteDetalle(id: number): Promise<void> {
  await api.delete(`/detalle-encomiendas/${id}`);
}
