// src/pages/reportes/ReportesPage.tsx
import { useState } from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { getAllEncomiendas } from "../../api/endpoints/encomiendas.api";
import { getAllPagos } from "../../api/endpoints/pagos.api";
import { getAllSucursales } from "../../api/endpoints/sucursales.api";
import {
  generarReporteEncomiendas,
  generarReportePagos,
} from "../../utils/pdfGenerator";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import type { Sucursal } from "../../types";

export function ReportesPage() {
  const { user } = useAuth();
  const [loadingEncomiendas, setLoadingEncomiendas] = useState(false);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [filtrosEncomiendas, setFiltrosEncomiendas] = useState({
    desde: "",
    hasta: "",
    estado: "TODOS",
    sucursal: "",
  });
  const [filtrosPagos, setFiltrosPagos] = useState({
    desde: "",
    hasta: "",
    metodo: "",
    estado: "TODOS",
  });
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  const generarReporteEncomiendasHandler = async () => {
    setLoadingEncomiendas(true);
    try {
      let encomiendas = await getAllEncomiendas();

      // Aplicar filtros
      if (filtrosEncomiendas.desde) {
        encomiendas = encomiendas.filter(
          (e) => new Date(e.fechaEmision) >= new Date(filtrosEncomiendas.desde),
        );
      }
      if (filtrosEncomiendas.hasta) {
        encomiendas = encomiendas.filter(
          (e) => new Date(e.fechaEmision) <= new Date(filtrosEncomiendas.hasta),
        );
      }
      if (filtrosEncomiendas.estado !== "TODOS") {
        encomiendas = encomiendas.filter(
          (e) => e.estadoEntrega === filtrosEncomiendas.estado,
        );
      }
      if (filtrosEncomiendas.sucursal && user?.role === "super_admin") {
        encomiendas = encomiendas.filter(
          (e) =>
            e.sucursalOrigen?.nombre === filtrosEncomiendas.sucursal ||
            e.sucursalDestino?.nombre === filtrosEncomiendas.sucursal,
        );
      }

      if (encomiendas.length === 0) {
        toast.warning("No hay encomiendas para el reporte");
        return;
      }

      generarReporteEncomiendas(encomiendas, filtrosEncomiendas);
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      toast.error("Error al generar el reporte");
    } finally {
      setLoadingEncomiendas(false);
    }
  };

  const generarReportePagosHandler = async () => {
    setLoadingPagos(true);
    try {
      let pagos = await getAllPagos();

      // Aplicar filtros
      if (filtrosPagos.desde) {
        pagos = pagos.filter(
          (p) => new Date(p.fecha) >= new Date(filtrosPagos.desde),
        );
      }
      if (filtrosPagos.hasta) {
        pagos = pagos.filter(
          (p) => new Date(p.fecha) <= new Date(filtrosPagos.hasta),
        );
      }
      if (filtrosPagos.metodo) {
        pagos = pagos.filter((p) => p.metodoPago === filtrosPagos.metodo);
      }
      if (filtrosPagos.estado !== "TODOS") {
        pagos = pagos.filter((p) => p.estado === filtrosPagos.estado);
      }

      if (pagos.length === 0) {
        toast.warning("No hay pagos para el reporte");
        return;
      }

      generarReportePagos(pagos, filtrosPagos);
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      toast.error("Error al generar el reporte");
    } finally {
      setLoadingPagos(false);
    }
  };

  const cargarSucursales = async () => {
    if (sucursales.length === 0 && user?.role === "super_admin") {
      const data = await getAllSucursales();
      setSucursales(data);
    }
  };

  return (
    <div className="container-fluid px-0">
      <PageHeader title="Reportes" subtitle="Generación de reportes en PDF" />

      <div className="row g-4">
        {/* Reporte de Encomiendas */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">📊 Reporte de Encomiendas</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Rango de Fechas</label>
                <div className="row g-2">
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Desde"
                      value={filtrosEncomiendas.desde}
                      onChange={(e) =>
                        setFiltrosEncomiendas({
                          ...filtrosEncomiendas,
                          desde: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Hasta"
                      value={filtrosEncomiendas.hasta}
                      onChange={(e) =>
                        setFiltrosEncomiendas({
                          ...filtrosEncomiendas,
                          hasta: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Estado de Entrega</label>
                <select
                  className="form-select"
                  value={filtrosEncomiendas.estado}
                  onChange={(e) =>
                    setFiltrosEncomiendas({
                      ...filtrosEncomiendas,
                      estado: e.target.value,
                    })
                  }
                >
                  <option value="TODOS">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_TRANSITO">En Tránsito</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              {user?.role === "super_admin" && (
                <div className="mb-3">
                  <label className="form-label">Sucursal</label>
                  <select
                    className="form-select"
                    value={filtrosEncomiendas.sucursal}
                    onChange={(e) =>
                      setFiltrosEncomiendas({
                        ...filtrosEncomiendas,
                        sucursal: e.target.value,
                      })
                    }
                    onFocus={cargarSucursales}
                  >
                    <option value="">Todas</option>
                    {sucursales.map((s) => (
                      <option key={s.idSucursal} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                className="btn btn-primary w-100"
                onClick={generarReporteEncomiendasHandler}
                disabled={loadingEncomiendas}
              >
                {loadingEncomiendas ? "Generando..." : "📄 Generar Reporte PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Reporte de Pagos */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">💰 Reporte de Pagos</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Rango de Fechas</label>
                <div className="row g-2">
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Desde"
                      value={filtrosPagos.desde}
                      onChange={(e) =>
                        setFiltrosPagos({
                          ...filtrosPagos,
                          desde: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col">
                    <input
                      type="date"
                      className="form-control"
                      placeholder="Hasta"
                      value={filtrosPagos.hasta}
                      onChange={(e) =>
                        setFiltrosPagos({
                          ...filtrosPagos,
                          hasta: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Método de Pago</label>
                <select
                  className="form-select"
                  value={filtrosPagos.metodo}
                  onChange={(e) =>
                    setFiltrosPagos({ ...filtrosPagos, metodo: e.target.value })
                  }
                >
                  <option value="">Todos</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="QR">QR</option>
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Estado del Pago</label>
                <select
                  className="form-select"
                  value={filtrosPagos.estado}
                  onChange={(e) =>
                    setFiltrosPagos({ ...filtrosPagos, estado: e.target.value })
                  }
                >
                  <option value="TODOS">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="COMPLETADO">Completado</option>
                  <option value="RECHAZADO">Rechazado</option>
                  <option value="ANULADO">Anulado</option>
                </select>
              </div>

              <button
                className="btn btn-success w-100"
                onClick={generarReportePagosHandler}
                disabled={loadingPagos}
              >
                {loadingPagos ? "Generando..." : "📄 Generar Reporte PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card bg-light mt-4">
        <div className="card-body">
          <h6 className="mb-2">ℹ️ Información</h6>
          <p className="mb-0 text-muted small">
            Los reportes se generan en formato PDF con los datos filtrados según
            los criterios seleccionados. Los archivos se descargarán
            automáticamente en tu computadora.
          </p>
        </div>
      </div>
    </div>
  );
}
