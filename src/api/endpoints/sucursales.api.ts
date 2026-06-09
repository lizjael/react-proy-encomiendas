// src/api/endpoints/sucursales.api.ts
import api from "../axiosConfig";
import type {
  Sucursal,
  CreateSucursalDto,
  UpdateSucursalDto,
} from "../../types";

export async function getAllSucursales(): Promise<Sucursal[]> {
  const res = await api.get<Sucursal[]>("/sucursales");
  return res.data;
}

export async function getSucursalById(id: number): Promise<Sucursal> {
  const res = await api.get<Sucursal>(`/sucursales/${id}`);
  return res.data;
}

export async function createSucursal(
  dto: CreateSucursalDto,
): Promise<Sucursal> {
  const res = await api.post<Sucursal>("/sucursales", dto);
  return res.data;
}

export async function updateSucursal(
  id: number,
  dto: UpdateSucursalDto,
): Promise<Sucursal> {
  const res = await api.patch<Sucursal>(`/sucursales/${id}`, dto);
  return res.data;
}

export async function deleteSucursal(id: number): Promise<void> {
  await api.delete(`/sucursales/${id}`);
}
