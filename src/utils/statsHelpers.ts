// src/utils/statsHelpers.ts
import type { Encomienda, Pago, Sucursal } from "../types";

export function groupByEstadoEntrega(
  encomiendas: Encomienda[],
): Record<string, number> {
  return encomiendas.reduce(
    (acc, encomienda) => {
      const estado = encomienda.estadoEntrega;
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function groupByMonth(
  encomiendas: Encomienda[],
  meses: number = 6,
): { label: string; count: number }[] {
  const now = new Date();
  const months = [];

  for (let i = meses - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleString("es-ES", { month: "short" }),
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  return months.map((month) => {
    const count = encomiendas.filter((encomienda) => {
      const fecha = new Date(encomienda.fechaEmision);
      return (
        fecha.getMonth() === month.month && fecha.getFullYear() === month.year
      );
    }).length;
    return { label: month.label, count };
  });
}

export function sumByMonth(
  pagos: Pago[],
  meses: number = 6,
): { label: string; total: number }[] {
  const now = new Date();
  const months = [];

  for (let i = meses - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: date.toLocaleString("es-ES", { month: "short" }),
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  return months.map((month) => {
    const total = pagos
      .filter((pago) => {
        const fecha = new Date(pago.fecha);
        return (
          fecha.getMonth() === month.month &&
          fecha.getFullYear() === month.year &&
          pago.estado === "COMPLETADO"
        );
      })
      .reduce((sum, pago) => sum + Number(pago.monto), 0);

    return { label: month.label, total };
  });
}

export function groupBySucursal(
  encomiendas: Encomienda[],
  sucursales: Sucursal[],
): { label: string; count: number }[] {
  const counts: Record<number, number> = {};

  encomiendas.forEach((encomienda) => {
    const id = encomienda.idSucursalOrigen;
    counts[id] = (counts[id] || 0) + 1;
  });

  return sucursales
    .filter((s) => counts[s.idSucursal])
    .map((s) => ({ label: s.nombre, count: counts[s.idSucursal] }))
    .sort((a, b) => b.count - a.count);
}

export function groupByMetodoPago(pagos: Pago[]): Record<string, number> {
  return pagos
    .filter((pago) => pago.estado === "COMPLETADO")
    .reduce(
      (acc, pago) => {
        const metodo = pago.metodoPago;
        acc[metodo] = (acc[metodo] || 0) + pago.monto;
        return acc;
      },
      {} as Record<string, number>,
    );
}

export function groupBySucursalIngresos(
  pagos: Pago[],
  encomiendas: Encomienda[],
  sucursales: Sucursal[],
): { label: string; total: number }[] {
  // Crear mapa de encomienda -> sucursal origen
  const encomiendaSucursal: Record<number, number> = {};
  encomiendas.forEach((e) => {
    encomiendaSucursal[e.idEncomienda] = e.idSucursalOrigen;
  });

  // Agrupar pagos por sucursal
  const sucursalTotals: Record<number, number> = {};
  pagos
    .filter((p) => p.estado === "COMPLETADO")
    .forEach((pago) => {
      const sucursalId = encomiendaSucursal[pago.idEncomienda];
      if (sucursalId) {
        sucursalTotals[sucursalId] =
          (sucursalTotals[sucursalId] || 0) + pago.monto;
      }
    });

  return sucursales
    .filter((s) => sucursalTotals[s.idSucursal])
    .map((s) => ({ label: s.nombre, total: sucursalTotals[s.idSucursal] }))
    .sort((a, b) => b.total - a.total);
}

export function filterEncomiendasByDate(
  encomiendas: Encomienda[],
  desde?: string,
  hasta?: string,
): Encomienda[] {
  return encomiendas.filter((e) => {
    const fecha = new Date(e.fechaEmision);
    if (desde && fecha < new Date(desde)) return false;
    if (hasta && fecha > new Date(hasta)) return false;
    return true;
  });
}

export function filterPagosByDate(
  pagos: Pago[],
  desde?: string,
  hasta?: string,
): Pago[] {
  return pagos.filter((p) => {
    const fecha = new Date(p.fecha);
    if (desde && fecha < new Date(desde)) return false;
    if (hasta && fecha > new Date(hasta)) return false;
    return true;
  });
}
