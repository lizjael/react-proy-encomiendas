// src/api/endpoints/encomiendas.api.ts
import api from "../axiosConfig";
import type {
  Encomienda,
  CreateEncomiendaDto,
  UpdateEncomiendaDto,
} from "../../types";

export async function getAllEncomiendas(): Promise<Encomienda[]> {
  const res = await api.get<Encomienda[]>("/encomiendas");
  return res.data;
}

export async function getEncomiendaById(id: number): Promise<Encomienda> {
  const res = await api.get<Encomienda>(`/encomiendas/${id}`);
  return res.data;
}

export async function findEncomiendaByGuia(
  nroGuia: string,
): Promise<Encomienda> {
  const res = await api.get<Encomienda>(
    `/encomiendas/buscar/guia?nroGuia=${nroGuia}`,
  );
  return res.data;
}

export async function createEncomienda(
  dto: CreateEncomiendaDto,
): Promise<Encomienda> {
  const res = await api.post<Encomienda>("/encomiendas", dto);
  return res.data;
}

export async function updateEncomienda(
  id: number,
  dto: UpdateEncomiendaDto,
): Promise<Encomienda> {
  const res = await api.patch<Encomienda>(`/encomiendas/${id}`, dto);
  return res.data;
}

export async function deleteEncomienda(id: number): Promise<void> {
  await api.delete(`/encomiendas/${id}`);
}
