import { useEffect, useState, useMemo } from "react";
import { Doughnut, Bar, Pie } from "react-chartjs-2";
import { PageHeader } from "../../components/ui/PageHeader";
import { ChartCard } from "../../components/ui/ChartCard";
import { getAllEncomiendas } from "../../api/endpoints/encomiendas.api";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import { getAllSucursales } from "../../api/endpoints/sucursales.api";
import { useAuth } from "../../hooks/useAuth";
import {
  groupByEstadoEntrega,
  sumByMonth,
  groupBySucursal,
  groupByMetodoPago,
  filterEncomiendasByDate,
  filterPagosByDate,
} from "../../utils/statsHelpers";
import type { Encomienda, Pago, Sucursal } from "../../types";
import {
  BarChart2,
  Calendar,
  Download,
  TrendingUp,
  PieChart,
  Filter,
  X,
  Building2,
} from "lucide-react";

// Paleta de colores de la marca
const brandColors = {
  primary: "#8B1A1A",
  accent: "#D4A017",
  primaryLight: "#C0392B",
  dark: "#1A1A1A",
  orange: "#F59E0B",
  brown: "#92400E",
  green: "#16A34A",
  blue: "#0284C7",
  gray: "#6B7280",
};

const chartColors = [
  brandColors.primary,
  brandColors.accent,
  brandColors.primaryLight,
  brandColors.dark,
  brandColors.orange,
  brandColors.brown,
  brandColors.green,
  brandColors.blue,
  brandColors.gray,
];

// Mapeo de estados a colores para el gráfico de donut
const estadoColors: Record<string, string> = {
  PENDIENTE: brandColors.accent,
  EN_TRANSITO: brandColors.blue,
  ENTREGADO: brandColors.green,
  CANCELADO: brandColors.gray,
};

export function EstadisticasPage() {
  const { user } = useAuth();
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [fechas, setFechas] = useState({ desde: "", hasta: "" });
  const [sucursalFilter, setSucursalFilter] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);

  // Obtener fecha actual para preseleccionar el mes actual
  useEffect(() => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    setFechas({
      desde: primerDiaMes.toISOString().split("T")[0],
      hasta: ultimoDiaMes.toISOString().split("T")[0],
    });
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [encomiendasData, pagosData, sucursalesData] = await Promise.all([
        getAllEncomiendas(),
        getAllPagos(),
        getAllSucursales(),
      ]);
      setEncomiendas(encomiendasData);
      setPagos(pagosData);
      setSucursales(sucursalesData);
    } catch (error) {
      console.error("Error loading stats data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  let filteredEncomiendas = filterEncomiendasByDate(
    encomiendas,
    fechas.desde,
    fechas.hasta,
  );
  let filteredPagos = filterPagosByDate(pagos, fechas.desde, fechas.hasta);

  if (sucursalFilter !== "all") {
    filteredEncomiendas = filteredEncomiendas.filter(
      (e) => e.idSucursalOrigen === sucursalFilter,
    );
    filteredPagos = filteredPagos.filter((p) => {
      const encomienda = encomiendas.find(
        (e) => e.idEncomienda === p.idEncomienda,
      );
      return encomienda?.idSucursalOrigen === sucursalFilter;
    });
  }

  // Datos para gráficos con colores de marca
  const estadosData = groupByEstadoEntrega(filteredEncomiendas);
  const ingresosMensuales = sumByMonth(
    filteredPagos.filter((p) => p.estado === "COMPLETADO"),
    6,
  );
  const sucursalData = groupBySucursal(filteredEncomiendas, sucursales);
  const metodosData = groupByMetodoPago(filteredPagos);

  // Gráfico de Donut - Estados de Encomiendas
  const donutData = {
    labels: Object.keys(estadosData).map((key) => {
      const labels: Record<string, string> = {
        PENDIENTE: "Pendiente",
        EN_TRANSITO: "En Tránsito",
        ENTREGADO: "Entregado",
        CANCELADO: "Cancelado",
      };
      return labels[key] || key;
    }),
    datasets: [
      {
        data: Object.values(estadosData),
        backgroundColor: Object.keys(estadosData).map(
          (key) => estadoColors[key] || brandColors.gray,
        ),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  // Gráfico de Barras - Ingresos Mensuales
  const ingresosData = {
    labels: ingresosMensuales.map((d) => d.label),
    datasets: [
      {
        label: "Ingresos (Bs.)",
        data: ingresosMensuales.map((d) => d.total),
        backgroundColor: brandColors.primary,
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Gráfico de Barras - Encomiendas por Sucursal
  const sucursalesBarData = {
    labels: sucursalData.map((d) => d.label),
    datasets: [
      {
        label: "Encomiendas",
        data: sucursalData.map((d) => d.count),
        backgroundColor: brandColors.accent,
        borderRadius: 8,
        barPercentage: 0.7,
      },
    ],
  };

  // Gráfico de Pie - Métodos de Pago
  const metodosPieData = {
    labels: Object.keys(metodosData).map((m) => {
      const labels: Record<string, string> = {
        EFECTIVO: "Efectivo",
        TARJETA_CREDITO: "Tarjeta Crédito",
        TARJETA_DEBITO: "Tarjeta Débito",
        TRANSFERENCIA: "Transferencia",
        QR: "QR",
        DEPOSITO_BANCARIO: "Depósito Bancario",
        MERCADO_PAGO: "Mercado Pago",
        YAPE: "Yape",
        PLIN: "Plin",
      };
      return labels[m] || m.replace("_", " ");
    }),
    datasets: [
      {
        data: Object.values(metodosData),
        backgroundColor: chartColors.slice(0, Object.keys(metodosData).length),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  // Calcular resumen de datos
  const resumen = useMemo(() => {
    const totalEncomiendas = filteredEncomiendas.length;
    const totalIngresos = filteredPagos
      .filter((p) => p.estado === "COMPLETADO")
      .reduce((sum, p) => sum + p.monto, 0);
    const entregadas = filteredEncomiendas.filter(
      (e) => e.estadoEntrega === "ENTREGADO",
    ).length;
    const pendientes = filteredEncomiendas.filter(
      (e) => e.estadoEntrega === "PENDIENTE",
    ).length;
    const tasaEntrega =
      totalEncomiendas > 0 ? (entregadas / totalEncomiendas) * 100 : 0;

    return {
      totalEncomiendas,
      totalIngresos,
      entregadas,
      pendientes,
      tasaEntrega,
    };
  }, [filteredEncomiendas, filteredPagos]);

  const limpiarFiltros = () => {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    setFechas({
      desde: primerDiaMes.toISOString().split("T")[0],
      hasta: ultimoDiaMes.toISOString().split("T")[0],
    });
    setSucursalFilter("all");
  };

  const exportarDatos = () => {
    // Crear CSV con los datos actuales
    const headers = ["Métrica", "Valor"];
    const rows = [
      ["Total Encomiendas", resumen.totalEncomiendas],
      ["Total Ingresos", `Bs. ${resumen.totalIngresos.toFixed(2)}`],
      ["Encomiendas Entregadas", resumen.entregadas],
      ["Encomiendas Pendientes", resumen.pendientes],
      ["Tasa de Entrega", `${resumen.tasaEntrega.toFixed(1)}%`],
      [
        "Período",
        `${fechas.desde || "Inicio"} - ${fechas.hasta || "Actualidad"}`,
      ],
    ];

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `estadisticas_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Cargando estadísticas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Estadísticas"
        subtitle="Análisis detallado de operaciones"
        icon={<BarChart2 size={24} />}
        action={
          <button
            className="btn d-flex align-items-center gap-2"
            onClick={exportarDatos}
            style={{
              backgroundColor: "#F8F5F0",
              border: "1px solid #E5E0D8",
              borderRadius: "10px",
              padding: "0.5rem 1.25rem",
              color: "#1A1A1A",
              fontWeight: 500,
              fontSize: "0.85rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E5E0D8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F8F5F0";
            }}
          >
            <Download size={18} />
            Exportar
          </button>
        }
      />

      {/* Filtros */}
      <div
        className="rounded-3 mb-4 p-4"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "12px",
        }}
      >
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Calendar size={14} className="me-1" />
              Fecha Desde
            </label>
            <input
              type="date"
              className="form-control"
              value={fechas.desde}
              onChange={(e) => setFechas({ ...fechas, desde: e.target.value })}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            />
          </div>
          <div className="col-md-3">
            <label
              className="form-label fw-semibold mb-2"
              style={{ color: "#374151", fontSize: "0.75rem" }}
            >
              <Calendar size={14} className="me-1" />
              Fecha Hasta
            </label>
            <input
              type="date"
              className="form-control"
              value={fechas.hasta}
              onChange={(e) => setFechas({ ...fechas, hasta: e.target.value })}
              style={{
                borderRadius: "10px",
                borderColor: "#E5E0D8",
                height: "42px",
                fontSize: "0.85rem",
              }}
            />
          </div>
          {user?.role === "super_admin" && (
            <div className="col-md-3">
              <label
                className="form-label fw-semibold mb-2"
                style={{ color: "#374151", fontSize: "0.75rem" }}
              >
                <Building2 size={14} className="me-1" />
                Sucursal
              </label>
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
                  height: "42px",
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
          )}
          <div className="col-md-3">
            <button
              className="btn w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={limpiarFiltros}
              style={{
                backgroundColor: "#F8F5F0",
                border: "1px solid #E5E0D8",
                borderRadius: "10px",
                height: "42px",
                color: "#6B7280",
                fontSize: "0.85rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#E5E0D8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F8F5F0";
              }}
            >
              <X size={16} />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resumen en cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-3"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
              borderTop: `3px solid ${brandColors.primary}`,
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Total Encomiendas</span>
              <TrendingUp size={18} color={brandColors.primary} />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: "#1A1A1A" }}>
              {resumen.totalEncomiendas}
            </h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-3"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
              borderTop: `3px solid ${brandColors.accent}`,
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Total Ingresos</span>
              <BarChart2 size={18} color={brandColors.accent} />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: "#1A1A1A" }}>
              Bs. {resumen.totalIngresos.toFixed(2)}
            </h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-3"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
              borderTop: `3px solid ${brandColors.green}`,
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Tasa de Entrega</span>
              <PieChart size={18} color={brandColors.green} />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: "#1A1A1A" }}>
              {resumen.tasaEntrega.toFixed(1)}%
            </h3>
          </div>
        </div>
        <div className="col-sm-6 col-lg-3">
          <div
            className="p-3 rounded-3"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
              borderTop: `3px solid ${brandColors.orange}`,
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted small">Pendientes</span>
              <Filter size={18} color={brandColors.orange} />
            </div>
            <h3 className="fw-bold mb-0" style={{ color: "#1A1A1A" }}>
              {resumen.pendientes}
            </h3>
          </div>
        </div>
      </div>

      {/* Gráficos - 2 columnas en desktop, 1 en mobile */}
      <div className="row g-4">
        <div className="col-lg-7">
          <ChartCard title="Ingresos por Mes" subtitle="Últimos 6 meses">
            <Bar
              data={ingresosData}
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
                    ticks: { callback: (value) => `Bs. ${value}` },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } },
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed?.y;
                        if (value === null || value === undefined)
                          return "Bs. 0.00";
                        return `Bs. ${value.toFixed(2)}`;
                      },
                    },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
        <div className="col-lg-5">
          <ChartCard title="Encomiendas por Estado">
            <Doughnut
              data={donutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { font: { size: 11 }, usePointStyle: true },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0,
                        );
                        const value = context.raw as number;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>

      <div className="row g-4 mt-2">
        {user?.role === "super_admin" && sucursalData.length > 0 && (
          <div className="col-lg-6">
            <ChartCard title="Encomiendas por Sucursal">
              <Bar
                data={sucursalesBarData}
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
                    x: {
                      grid: { display: false },
                      ticks: { font: { size: 10 } },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.parsed?.y;
                          if (value === null || value === undefined) return "0";
                          return `${value} encomienda${value !== 1 ? "s" : ""}`;
                        },
                      },
                    },
                  },
                }}
              />
            </ChartCard>
          </div>
        )}
        <div
          className={user?.role === "super_admin" ? "col-lg-6" : "col-lg-12"}
        >
          <ChartCard title="Métodos de Pago" subtitle="Distribución por monto">
            <Pie
              data={metodosPieData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { font: { size: 10 }, usePointStyle: true },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0,
                        );
                        const value = context.raw as number;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `Bs. ${value.toFixed(2)} (${percentage}%)`;
                      },
                    },
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
