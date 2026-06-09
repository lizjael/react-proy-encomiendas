// src/pages/dashboard/DashboardAdmin.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Doughnut, Bar } from "react-chartjs-2";
import { KPICard } from "../../components/ui/KPICard";
import { ChartCard } from "../../components/ui/ChartCard";
import { DataTable } from "../../components/ui/DataTable";
import { getAllEncomiendas } from "../../api/endpoints/encomiendas.api";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import { getAllUsers } from "../../api/endpoints/users.api";
import { useAuth } from "../../hooks/useAuth";
import {
  groupByEstadoEntrega,
  sumByMonth,
} from "../../utils/statsHelpers";
import type { Encomienda, Pago } from "../../types";

export function DashboardAdmin() {
  const { profile } = useAuth();
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [empleados, setEmpleados] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [encomiendasData, pagosData, usersData] = await Promise.all([
        getAllEncomiendas(),
        getAllPagos(),
        getAllUsers(),
      ]);

      // Filtrar por sucursal del admin
      const sucursalId = profile?.idSucursal;
      const filteredEncomiendas = sucursalId
        ? encomiendasData.filter(
            (e) =>
              e.idSucursalOrigen === sucursalId ||
              e.idSucursalDestino === sucursalId,
          )
        : encomiendasData;

      const empleadosCount = usersData.filter(
        (u) => u.role === "user" && u.idSucursal === sucursalId,
      ).length;

      setEncomiendas(filteredEncomiendas);
      setPagos(pagosData);
      setEmpleados(empleadosCount);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const encomiendasEsteMes = encomiendas.filter(
    (e) => new Date(e.fechaEmision) >= inicioMes,
  ).length;
  const ingresosEsteMes = pagos
    .filter((p) => p.estado === "COMPLETADO" && new Date(p.fecha) >= inicioMes)
    .reduce((sum, p) => sum + p.monto, 0);
  const pendientes = encomiendas.filter(
    (e) => e.estadoEntrega === "PENDIENTE",
  ).length;

  // Gráfico de estados
  const estadosData = groupByEstadoEntrega(encomiendas);
  const donutData = {
    labels: Object.keys(estadosData),
    datasets: [
      {
        data: Object.values(estadosData),
        backgroundColor: ["#ffc107", "#0dcaf0", "#198754", "#6c757d"],
        borderWidth: 0,
      },
    ],
  };

  // Gráfico de ingresos
  const ingresosMensuales = sumByMonth(
    pagos.filter((p) => p.estado === "COMPLETADO"),
    6,
  );
  const barData = {
    labels: ingresosMensuales.map((d) => d.label),
    datasets: [
      {
        label: "Ingresos (Bs.)",
        data: ingresosMensuales.map((d) => d.total),
        backgroundColor: "#0d6efd",
        borderRadius: 8,
      },
    ],
  };

  const ultimasEncomiendas = encomiendas.slice(0, 5);
  const columns = [
    {
      key: "nroGuia",
      label: "Nro. Guía",
      render: (row: Encomienda) => (
        <Link
          to={`/encomiendas/${row.idEncomienda}`}
          className="text-decoration-none"
        >
          {row.nroGuia}
        </Link>
      ),
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (row: Encomienda) => row.cliente?.nombreRazonSocial,
    },
    {
      key: "costoTotal",
      label: "Monto",
      render: (row: Encomienda) => `Bs. ${row.costoTotal.toFixed(2)}`,
    },
    {
      key: "fechaEmision",
      label: "Fecha",
      render: (row: Encomienda) =>
        new Date(row.fechaEmision).toLocaleDateString(),
    },
  ];

  if (loading) {
    return <div className="text-center py-5">Cargando dashboard...</div>;
  }

  return (
    <div className="container-fluid px-0">
      <div className="mb-4">
        <h1 className="h2 mb-1">Dashboard Administrativo</h1>
        <p className="text-muted">
          Resumen de gestión de{" "}
          {profile?.idSucursal
            ? `sucursal ${profile.idSucursal}`
            : "tu sucursal"}
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <KPICard
            title="Encomiendas Este Mes"
            value={encomiendasEsteMes}
            icon="📦"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Ingresos Este Mes"
            value={`Bs. ${ingresosEsteMes.toFixed(2)}`}
            icon="💰"
            color="success"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Encomiendas Pendientes"
            value={pendientes}
            icon="⏳"
            color="warning"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Empleados Activos"
            value={empleados}
            icon="👥"
            color="info"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <ChartCard title="Encomiendas por Estado">
            <Doughnut
              data={donutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </ChartCard>
        </div>
        <div className="col-md-7">
          <ChartCard title="Ingresos Últimos 6 Meses">
            <Bar
              data={barData}
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

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">📋 Últimas Encomiendas</h5>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={ultimasEncomiendas}
            loading={false}
            getId={(row) => row.idEncomienda}
          />
        </div>
      </div>
    </div>
  );
}
