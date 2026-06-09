// src/pages/dashboard/DashboardSuperAdmin.tsx
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { KPICard } from "../../components/ui/KPICard";
import { ChartCard } from "../../components/ui/ChartCard";
import { getAllEncomiendas } from "../../api/endpoints/encomiendas.api";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import { getAllSucursales } from "../../api/endpoints/sucursales.api";
import { getAllUsers } from "../../api/endpoints/users.api";
import {
  groupBySucursal,
  groupByMonth,
  groupByMetodoPago,
  groupBySucursalIngresos,
} from "../../utils/statsHelpers";
import type { Encomienda, Pago, Sucursal } from "../../types";

export function DashboardSuperAdmin() {
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [empleados, setEmpleados] = useState(0);
  const [sucursalFilter, setSucursalFilter] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [encomiendasData, pagosData, sucursalesData, usersData] =
        await Promise.all([
          getAllEncomiendas(),
          getAllPagos(),
          getAllSucursales(),
          getAllUsers(),
        ]);

      setEncomiendas(encomiendasData);
      setPagos(pagosData);
      setSucursales(sucursalesData);
      setEmpleados(usersData.filter((u) => u.role === "user").length);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar datos por sucursal si es necesario
  const filteredEncomiendas =
    sucursalFilter === "all"
      ? encomiendas
      : encomiendas.filter((e) => e.idSucursalOrigen === sucursalFilter);

  const filteredPagos =
    sucursalFilter === "all"
      ? pagos
      : pagos.filter((p) => {
          const encomienda = encomiendas.find(
            (e) => e.idEncomienda === p.idEncomienda,
          );
          return encomienda?.idSucursalOrigen === sucursalFilter;
        });

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const totalSucursales = sucursales.filter((s) => !s.eliminadoEn).length;
  const encomiendasEsteMes = filteredEncomiendas.filter(
    (e) => new Date(e.fechaEmision) >= inicioMes,
  ).length;
  const ingresosEsteMes = filteredPagos
    .filter((p) => p.estado === "COMPLETADO" && new Date(p.fecha) >= inicioMes)
    .reduce((sum, p) => sum + p.monto, 0);

  // Gráfico: Encomiendas por sucursal
  const sucursalData = groupBySucursal(filteredEncomiendas, sucursales);
  const barHorizontalData = {
    labels: sucursalData.map((d) => d.label),
    datasets: [
      {
        label: "Cantidad de Encomiendas",
        data: sucursalData.map((d) => d.count),
        backgroundColor: "#0d6efd",
        borderRadius: 8,
      },
    ],
  };

  // Gráfico: Métodos de pago
  const metodosData = groupByMetodoPago(filteredPagos);
  const doughnutData = {
    labels: Object.keys(metodosData).map((m) => m.replace("_", " ")),
    datasets: [
      {
        data: Object.values(metodosData),
        backgroundColor: [
          "#0d6efd",
          "#198754",
          "#ffc107",
          "#dc3545",
          "#0dcaf0",
          "#6f42c1",
          "#fd7e14",
          "#20c997",
          "#d63384",
        ],
        borderWidth: 0,
      },
    ],
  };

  // Gráfico: Tendencia mensual
  const tendenciaData = groupByMonth(filteredEncomiendas, 12);
  const lineData = {
    labels: tendenciaData.map((d) => d.label),
    datasets: [
      {
        label: "Encomiendas",
        data: tendenciaData.map((d) => d.count),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13, 110, 253, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Gráfico: Ingresos por sucursal
  const ingresosSucursalData = groupBySucursalIngresos(
    filteredPagos,
    filteredEncomiendas,
    sucursales,
  );
  const ingresosBarData = {
    labels: ingresosSucursalData.map((d) => d.label),
    datasets: [
      {
        label: "Ingresos (Bs.)",
        data: ingresosSucursalData.map((d) => d.total),
        backgroundColor: "#198754",
        borderRadius: 8,
      },
    ],
  };

  if (loading) {
    return <div className="text-center py-5">Cargando dashboard...</div>;
  }

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h2 mb-1">Dashboard Corporativo</h1>
            <p className="text-muted">Vista global de todas las sucursales</p>
          </div>
          <div className="w-25">
            <select
              className="form-select"
              value={sucursalFilter}
              onChange={(e) =>
                setSucursalFilter(
                  e.target.value === "all" ? "all" : parseInt(e.target.value),
                )
              }
            >
              <option value="all">Todas las sucursales</option>
              {sucursales.map((s) => (
                <option key={s.idSucursal} value={s.idSucursal}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <KPICard
            title="Sucursales Activas"
            value={totalSucursales}
            icon="🏢"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Encomiendas Este Mes"
            value={encomiendasEsteMes}
            icon="📦"
            color="info"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Ingresos Globales"
            value={`Bs. ${ingresosEsteMes.toFixed(2)}`}
            icon="💰"
            color="success"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Empleados Activos"
            value={empleados}
            icon="👥"
            color="warning"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <ChartCard title="Encomiendas por Sucursal">
            <Bar
              data={barHorizontalData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: "y",
                scales: { x: { beginAtZero: true } },
              }}
            />
          </ChartCard>
        </div>
        <div className="col-md-6">
          <ChartCard title="Ingresos por Sucursal">
            <Bar
              data={ingresosBarData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Monto (Bs.)" },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <ChartCard title="Métodos de Pago">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </ChartCard>
        </div>
        <div className="col-md-7">
          <ChartCard title="Tendencia Mensual (12 meses)">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: { display: true, text: "Cantidad" },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
