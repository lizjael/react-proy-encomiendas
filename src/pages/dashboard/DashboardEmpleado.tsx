import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KPICard } from "../../components/ui/KPICard";
import { DataTable } from "../../components/ui/DataTable";
import { getAllEncomiendas } from "../../api/endpoints/encomiendas.api";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import { useAuth } from "../../hooks/useAuth";
import type { Encomienda, Pago } from "../../types";
import { Package, Clock, CheckCircle, DollarSign } from "lucide-react";

export function DashboardEmpleado() {
  const { user } = useAuth();
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 19) return "¡Buenas tardes";
    return "¡Buenas noches";
  };

  const fechaActual = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

  const getEstadoColor = (estado: string) => {
    const colors = {
      PENDIENTE: { bg: "#D4A017", text: "#1A1A1A" },
      EN_TRANSITO: { bg: "#0284C7", text: "#FFFFFF" },
      ENTREGADO: { bg: "#16A34A", text: "#FFFFFF" },
      CANCELADO: { bg: "#6B7280", text: "#FFFFFF" },
    };
    return colors[estado as keyof typeof colors] || colors.PENDIENTE;
  };

  const columns = [
    {
      key: "nroGuia",
      label: "Nro. Guía",
      render: (row: Encomienda) => (
        <Link
          to={`/encomiendas/${row.idEncomienda}`}
          className="text-decoration-none fw-semibold"
          style={{ color: "#8B1A1A" }}
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
      mobileHidden: true,
    },
    {
      key: "estadoEntrega",
      label: "Estado",
      render: (row: Encomienda) => {
        const colors = getEstadoColor(row.estadoEntrega);
        return (
          <span
            className="badge px-3 py-1 rounded-pill"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              fontSize: "0.7rem",
              fontWeight: 500,
            }}
          >
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
      mobileHidden: true,
    },
  ];

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "#8B1A1A" }}
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3" style={{ color: "#6B7280" }}>
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Header con saludo personalizado */}
      <div className="mb-4">
        <div>
          <h1
            className="mb-1 fw-bold"
            style={{
              color: "#1A1A1A",
              fontSize: "1.75rem",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {getGreeting()}, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="mb-0" style={{ color: "#6B7280", fontSize: "0.85rem" }}>
            {fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)}
          </p>
          <p className="mt-1" style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>
            Resumen de tu actividad diaria
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Encomiendas Hoy"
            value={encomiendasHoy}
            icon={<Package size={24} />}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Pendientes de Entrega"
            value={pendientes}
            icon={<Clock size={24} />}
            color="warning"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Entregadas Este Mes"
            value={entregadasEsteMes}
            icon={<CheckCircle size={24} />}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Pagos Hoy"
            value={pagosHoy}
            icon={<DollarSign size={24} />}
            color="info"
          />
        </div>
      </div>

      {/* Mis Encomiendas Recientes */}
      <div
        className="rounded-3 overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "12px",
        }}
      >
        <div
          className="px-4 py-3 border-bottom"
          style={{ borderColor: "#E5E0D8" }}
        >
          <h6 className="mb-0 fw-semibold" style={{ color: "#1A1A1A" }}>
            📋 Mis Encomiendas Recientes
          </h6>
        </div>
        <div className="p-3">
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
