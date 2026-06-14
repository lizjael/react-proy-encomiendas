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
import { groupByEstadoEntrega, sumByMonth } from "../../utils/statsHelpers";
import type { Encomienda, Pago } from "../../types";
import {
  Package,
  TrendingUp,
  Clock,
  Users,
  PlusCircle,
  CreditCard,
  UserCheck,
} from "lucide-react";

export function DashboardAdmin() {
  const { profile, user } = useAuth();
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [empleados, setEmpleados] = useState(0);
  const [loading, setLoading] = useState(true);

  // Obtener saludo según hora
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
      const [encomiendasData, pagosData, usersData] = await Promise.all([
        getAllEncomiendas(),
        getAllPagos(),
        getAllUsers(),
      ]);

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

  // Gráfico de estados - colores actualizados
  const estadosData = groupByEstadoEntrega(encomiendas);
  const donutData = {
    labels: Object.keys(estadosData),
    datasets: [
      {
        data: Object.values(estadosData),
        backgroundColor: ["#D4A017", "#0284C7", "#16A34A", "#6B7280"],
        borderWidth: 0,
      },
    ],
  };

  // Gráfico de ingresos - colores actualizados
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
        backgroundColor: "#8B1A1A",
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
      key: "costoTotal",
      label: "Monto",
      render: (row: Encomienda) => `Bs. ${Number(row.costoTotal).toFixed(2)}`,
    },
    {
      key: "fechaEmision",
      label: "Fecha",
      render: (row: Encomienda) =>
        new Date(row.fechaEmision).toLocaleDateString(),
      mobileHidden: true,
    },
  ];

  const accionesRapidas = [
    {
      title: "Nueva Encomienda",
      icon: <PlusCircle size={24} />,
      link: "/encomiendas/nueva",
      color: "#8B1A1A",
    },
    {
      title: "Ver Pagos",
      icon: <CreditCard size={24} />,
      link: "/pagos",
      color: "#D4A017",
    },
    {
      title: "Ver Clientes",
      icon: <UserCheck size={24} />,
      link: "/clientes",
      color: "#1A1A1A",
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
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
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
            <p
              className="mb-0"
              style={{ color: "#6B7280", fontSize: "0.85rem" }}
            >
              {fechaActual.charAt(0).toUpperCase() + fechaActual.slice(1)}
            </p>
            <p
              className="mt-1"
              style={{ color: "#9CA3AF", fontSize: "0.8rem" }}
            >
              Resumen de gestión de{" "}
              {profile?.idSucursal
                ? `sucursal ${profile.idSucursal}`
                : "tu sucursal"}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Encomiendas Este Mes"
            value={encomiendasEsteMes}
            icon={<Package size={24} />}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Ingresos Este Mes"
            value={`Bs. ${ingresosEsteMes.toFixed(2)}`}
            icon={<TrendingUp size={24} />}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Encomiendas Pendientes"
            value={pendientes}
            icon={<Clock size={24} />}
            color="warning"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Empleados Activos"
            value={empleados}
            icon={<Users size={24} />}
            color="info"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-4 mb-4">
        <div className="col-md-5">
          <ChartCard title="Encomiendas por Estado">
            <Doughnut
              data={donutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { font: { size: 11 } },
                  },
                },
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
                    title: {
                      display: true,
                      text: "Monto (Bs.)",
                      font: { size: 11 },
                    },
                    grid: { color: "#E5E0D8" },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="mb-4">
        <h6
          className="mb-3 fw-semibold"
          style={{
            color: "#1A1A1A",
            fontSize: "0.85rem",
            letterSpacing: "0.3px",
          }}
        >
          ACCIONES RÁPIDAS
        </h6>
        <div className="row g-3">
          {accionesRapidas.map((accion, index) => (
            <div key={index} className="col-sm-6 col-md-4">
              <Link
                to={accion.link}
                className="text-decoration-none d-block"
                style={{ transition: "all 0.2s ease" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  className="d-flex align-items-center gap-3 p-3 rounded-3"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E0D8",
                    borderRadius: "12px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      backgroundColor: `${accion.color}10`,
                      width: "48px",
                      height: "48px",
                    }}
                  >
                    <span style={{ color: accion.color }}>{accion.icon}</span>
                  </div>
                  <div>
                    <h6
                      className="mb-0 fw-semibold"
                      style={{ color: "#1A1A1A" }}
                    >
                      {accion.title}
                    </h6>
                    <small style={{ color: "#9CA3AF" }}>
                      Haz clic para acceder
                    </small>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Últimas Encomiendas */}
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
            📋 Últimas Encomiendas
          </h6>
        </div>
        <div className="p-3">
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
