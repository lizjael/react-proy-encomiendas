// src/pages/dashboard/DashboardEmpleado.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KPICard } from "../../components/ui/KPICard";
import { DataTable } from "../../components/ui/DataTable";
import { getAllEncomiendas } from "../../api/endpoints/encomiendas.api";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import { useAuth } from "../../hooks/useAuth";
import type { Encomienda, Pago } from "../../types";

export function DashboardEmpleado() {
  const { user } = useAuth();
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [encomiendasData, pagosData] = await Promise.all([
        getAllEncomiendas(),
        getAllPagos(),
      ]);
      setEncomiendas(encomiendasData);
      setPagos(pagosData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const hoy = new Date().toISOString().split("T")[0];
  const encomiendasHoy = encomiendas.filter(
    (e) => e.fechaEmision.split("T")[0] === hoy,
  ).length;
  const pendientes = encomiendas.filter(
    (e) => e.estadoEntrega === "PENDIENTE",
  ).length;
  const entregadasEsteMes = encomiendas.filter((e) => {
    const fecha = new Date(e.fechaEmision);
    const ahora = new Date();
    return (
      e.estadoEntrega === "ENTREGADO" &&
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  }).length;
  const pagosHoy = pagos.filter((p) => p.fecha.split("T")[0] === hoy).length;

  const misEncomiendas = encomiendas
    .filter((e) => e.idEmpleado === user?.id)
    .slice(0, 10);

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
      key: "consignatario",
      label: "Destino",
      render: (row: Encomienda) => row.consignatario?.nombres,
    },
    {
      key: "estadoEntrega",
      label: "Estado",
      render: (row: Encomienda) => {
        const colors = {
          PENDIENTE: "warning",
          EN_TRANSITO: "info",
          ENTREGADO: "success",
          CANCELADO: "secondary",
        };
        return (
          <span className={`badge bg-${colors[row.estadoEntrega]}`}>
            {row.estadoEntrega}
          </span>
        );
      },
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
        <h1 className="h2 mb-1">Bienvenido, {user?.name}</h1>
        <p className="text-muted">Resumen de tu actividad diaria</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <KPICard
            title="Encomiendas Hoy"
            value={encomiendasHoy}
            icon="📦"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Pendientes de Entrega"
            value={pendientes}
            icon="⏳"
            color="warning"
          />
        </div>
        <div className="col-md-3">
          <KPICard
            title="Entregadas Este Mes"
            value={entregadasEsteMes}
            icon="✅"
            color="success"
          />
        </div>
        <div className="col-md-3">
          <KPICard title="Pagos Hoy" value={pagosHoy} icon="💰" color="info" />
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">📋 Mis Encomiendas Recientes</h5>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={misEncomiendas}
            loading={false}
            getId={(row) => row.idEncomienda}
          />
        </div>
      </div>
    </div>
  );
}
