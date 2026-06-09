// src/api/endpoints/consignatarios.api.ts
import api from "../axiosConfig";
import type {
  Consignatario,
  CreateConsignatarioDto,
  UpdateConsignatarioDto,
} from "../../types";

export async function getAllConsignatarios(): Promise<Consignatario[]> {
  const res = await api.get<Consignatario[]>("/consignatarios");
  return res.data;
}

export async function getConsignatarioById(id: number): Promise<Consignatario> {
  const res = await api.get<Consignatario>(`/consignatarios/${id}`);
  return res.data;
}

export async function createConsignatario(
  dto: CreateConsignatarioDto,
): Promise<Consignatario> {
  const res = await api.post<Consignatario>("/consignatarios", dto);
  return res.data;
}

export async function updateConsignatario(
  id: number,
  dto: UpdateConsignatarioDto,
): Promise<Consignatario> {
  const res = await api.patch<Consignatario>(`/consignatarios/${id}`, dto);
  return res.data;
}

export async function deleteConsignatario(id: number): Promise<void> {
  await api.delete(`/consignatarios/${id}`);
}
