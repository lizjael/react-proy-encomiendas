// src/pages/estadisticas/EstadisticasPage.tsx
import { useEffect, useState } from "react";
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

export function EstadisticasPage() {
  const { user } = useAuth();
  const [encomiendas, setEncomiendas] = useState<Encomienda[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [fechas, setFechas] = useState({ desde: "", hasta: "" });
  const [sucursalFilter, setSucursalFilter] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);

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

  // Datos para gráficos
  const estadosData = groupByEstadoEntrega(filteredEncomiendas);
  const ingresosMensuales = sumByMonth(
    filteredPagos.filter((p) => p.estado === "COMPLETADO"),
    6,
  );
  const sucursalData = groupBySucursal(filteredEncomiendas, sucursales);
  const metodosData = groupByMetodoPago(filteredPagos);

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

  const ingresosData = {
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

  const sucursalesBarData = {
    labels: sucursalData.map((d) => d.label),
    datasets: [
      {
        label: "Encomiendas",
        data: sucursalData.map((d) => d.count),
        backgroundColor: "#198754",
        borderRadius: 8,
      },
    ],
  };

  const metodosPieData = {
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

  if (loading) {
    return <div className="text-center py-5">Cargando estadísticas...</div>;
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Estadísticas"
        subtitle="Análisis detallado de operaciones"
      />

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Desde</label>
              <input
                type="date"
                className="form-control"
                value={fechas.desde}
                onChange={(e) =>
                  setFechas({ ...fechas, desde: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Hasta</label>
              <input
                type="date"
                className="form-control"
                value={fechas.hasta}
                onChange={(e) =>
                  setFechas({ ...fechas, hasta: e.target.value })
                }
              />
            </div>
            {user?.role === "super_admin" && (
              <div className="col-md-3">
                <label className="form-label">Sucursal</label>
                <select
                  className="form-select"
                  value={sucursalFilter}
                  onChange={(e) =>
                    setSucursalFilter(
                      e.target.value === "all"
                        ? "all"
                        : parseInt(e.target.value),
                    )
                  }
                >
                  <option value="all">Todas</option>
                  {sucursales.map((s) => (
                    <option key={s.idSucursal} value={s.idSucursal}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() => setFechas({ desde: "", hasta: "" })}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
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
        <div className="col-md-6">
          <ChartCard title="Ingresos por Mes">
            <Bar
              data={ingresosData}
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

      <div className="row g-4 mt-2">
        {user?.role === "super_admin" && (
          <div className="col-md-6">
            <ChartCard title="Encomiendas por Sucursal">
              <Bar
                data={sucursalesBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </ChartCard>
          </div>
        )}
        <div
          className={user?.role === "super_admin" ? "col-md-6" : "col-md-12"}
        >
          <ChartCard title="Métodos de Pago">
            <Pie
              data={metodosPieData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
