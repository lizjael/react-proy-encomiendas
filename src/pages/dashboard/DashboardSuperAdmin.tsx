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
import { Building2, Package, TrendingUp, Users, MapPin } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function DashboardSuperAdmin() {
  const { user } = useAuth();
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [empleados, setEmpleados] = useState(0);
  const [sucursalFilter, setSucursalFilter] = useState<number | "all">("all");
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

  // Datos para resumen por sucursales
  const sucursalStats = sucursales
    .filter((s) => !s.eliminadoEn)
    .map((sucursal) => {
      const sucursalEncomiendas = encomiendas.filter(
        (e) => e.idSucursalOrigen === sucursal.idSucursal,
      );
      const sucursalIngresos = pagos
        .filter((p) => {
          const encomienda = encomiendas.find(
            (e) => e.idEncomienda === p.idEncomienda,
          );
          return (
            encomienda?.idSucursalOrigen === sucursal.idSucursal &&
            p.estado === "COMPLETADO"
          );
        })
        .reduce((sum, p) => sum + p.monto, 0);
      return {
        ...sucursal,
        encomiendas: sucursalEncomiendas.length,
        ingresos: sucursalIngresos,
      };
    })
    .sort((a, b) => b.ingresos - a.ingresos);

  // Gráfico: Encomiendas por sucursal - colores actualizados
  const sucursalData = groupBySucursal(filteredEncomiendas, sucursales);
  const barHorizontalData = {
    labels: sucursalData.map((d) => d.label),
    datasets: [
      {
        label: "Cantidad de Encomiendas",
        data: sucursalData.map((d) => d.count),
        backgroundColor: "#8B1A1A",
        borderRadius: 8,
      },
    ],
  };

  // Gráfico: Métodos de pago - colores actualizados
  const metodosData = groupByMetodoPago(filteredPagos);
  const doughnutData = {
    labels: Object.keys(metodosData).map((m) => m.replace("_", " ")),
    datasets: [
      {
        data: Object.values(metodosData),
        backgroundColor: [
          "#8B1A1A",
          "#D4A017",
          "#1A1A1A",
          "#C0392B",
          "#F59E0B",
          "#6B7280",
          "#0284C7",
          "#16A34A",
          "#DC2626",
        ],
        borderWidth: 0,
      },
    ],
  };

  // Gráfico: Tendencia mensual - colores actualizados
  const tendenciaData = groupByMonth(filteredEncomiendas, 12);
  const lineData = {
    labels: tendenciaData.map((d) => d.label),
    datasets: [
      {
        label: "Encomiendas",
        data: tendenciaData.map((d) => d.count),
        borderColor: "#8B1A1A",
        backgroundColor: "rgba(139, 26, 26, 0.08)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#D4A017",
        pointBorderColor: "#FFFFFF",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Gráfico: Ingresos por sucursal - colores actualizados
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
        backgroundColor: "#D4A017",
        borderRadius: 8,
      },
    ],
  };

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
              Vista global de todas las sucursales
            </p>
          </div>
          <div style={{ minWidth: "200px" }}>
            <select
              className="form-select"
              value={sucursalFilter}
              onChange={(e) =>
                setSucursalFilter(
                  e.target.value === "all" ? "all" : parseInt(e.target.value),
                )
              }
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                fontSize: "0.85rem",
              }}
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

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Sucursales Activas"
            value={totalSucursales}
            icon={<Building2 size={24} />}
            color="primary"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Encomiendas Este Mes"
            value={encomiendasEsteMes}
            icon={<Package size={24} />}
            color="info"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Ingresos Globales"
            value={`Bs. ${ingresosEsteMes.toFixed(2)}`}
            icon={<TrendingUp size={24} />}
            color="success"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <KPICard
            title="Empleados Activos"
            value={empleados}
            icon={<Users size={24} />}
            color="warning"
          />
        </div>
      </div>

      {/* Resumen por Sucursales - Mini Cards */}
      <div className="mb-4">
        <h6
          className="mb-3 fw-semibold"
          style={{
            color: "#1A1A1A",
            fontSize: "0.85rem",
            letterSpacing: "0.3px",
          }}
        >
          RESUMEN POR SUCURSALES
        </h6>
        <div className="row g-3">
          {sucursalStats.slice(0, 4).map((sucursal) => (
            <div key={sucursal.idSucursal} className="col-sm-6 col-md-3">
              <div
                className="p-3 rounded-3 h-100"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E0D8",
                  borderRadius: "12px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <MapPin size={16} color="#8B1A1A" />
                  <h6
                    className="mb-0 fw-semibold"
                    style={{ color: "#1A1A1A", fontSize: "0.85rem" }}
                  >
                    {sucursal.nombre}
                  </h6>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <div>
                    <p
                      className="mb-0"
                      style={{ color: "#6B7280", fontSize: "0.7rem" }}
                    >
                      Encomiendas
                    </p>
                    <strong style={{ color: "#8B1A1A", fontSize: "1rem" }}>
                      {sucursal.encomiendas}
                    </strong>
                  </div>
                  <div className="text-end">
                    <p
                      className="mb-0"
                      style={{ color: "#6B7280", fontSize: "0.7rem" }}
                    >
                      Ingresos
                    </p>
                    <strong style={{ color: "#D4A017", fontSize: "0.9rem" }}>
                      Bs. {sucursal.ingresos.toFixed(0)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <ChartCard title="Encomiendas por Sucursal">
            <Bar
              data={barHorizontalData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: "y",
                scales: {
                  x: { beginAtZero: true, grid: { color: "#E5E0D8" } },
                  y: { grid: { display: false } },
                },
                plugins: {
                  legend: { display: false },
                },
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
                    title: {
                      display: true,
                      text: "Monto (Bs.)",
                      font: { size: 11 },
                    },
                    grid: { color: "#E5E0D8" },
                  },
                  x: { grid: { display: false } },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-5">
          <ChartCard title="Métodos de Pago">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { font: { size: 10 } },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
        <div className="col-md-7">
          <ChartCard
            title="Tendencia Mensual (12 meses)"
            subtitle="Evolución de encomiendas"
          >
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Cantidad",
                      font: { size: 11 },
                    },
                    grid: { color: "#E5E0D8" },
                  },
                  x: { grid: { display: false } },
                },
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
