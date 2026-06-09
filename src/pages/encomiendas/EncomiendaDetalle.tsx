// src/pages/encomiendas/EncomiendaDetalle.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getEncomiendaById,
  updateEncomienda,
} from "../../api/endpoints/encomiendas.api";
import { PageHeader } from "../../components/ui/PageHeader";
import { Spinner } from "../../components/ui/Spinner";
import { usePermissions } from "../../hooks/usePermissions";
import type { Encomienda, EstadoEntrega } from "../../types";
import { generarFacturaEncomienda } from "../../utils/pdfGenerator";

const estadoEntregaColors = {
  PENDIENTE: "warning",
  EN_TRANSITO: "info",
  ENTREGADO: "success",
  CANCELADO: "secondary",
};

export function EncomiendaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [encomienda, setEncomienda] = useState<Encomienda | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoEntrega>("PENDIENTE");
  const { canEdit } = usePermissions();

  useEffect(() => {
    loadEncomienda();
  }, [id]);

  const loadEncomienda = async () => {
    try {
      const data = await getEncomiendaById(parseInt(id!));
      setEncomienda(data);
    } catch (error) {
      toast.error("Error al cargar la encomienda");
      navigate("/encomiendas");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async () => {
    if (!encomienda) return;
    try {
      await updateEncomienda(encomienda.idEncomienda, {
        estadoEntrega: nuevoEstado,
      });
      toast.success("Estado actualizado correctamente");
      loadEncomienda();
      setShowEstadoModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al actualizar estado",
      );
    }
  };

  const handleGeneratePDF = () => {
    if (encomienda) {
      generarFacturaEncomienda(encomienda);
      toast.success("Factura generada exitosamente");
    }
  };
  if (loading) return <Spinner fullPage />;

  if (!encomienda) return null;

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title={`Encomienda ${encomienda.nroGuia}`}
        subtitle={`Fecha de emisión: ${new Date(encomienda.fechaEmision).toLocaleDateString()}`}
        action={
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={handleGeneratePDF}>
              📄 Descargar Factura PDF
            </button>
            {canEdit("encomiendas") && (
              <button
                className="btn btn-primary"
                onClick={() => setShowEstadoModal(true)}
              >
                ✏️ Actualizar Estado
              </button>
            )}
          </div>
        }
      />

      <div className="row g-4">
        {/* Información principal */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">📋 Información General</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <small className="text-muted">Estado Entrega</small>
                  <div>
                    <span
                      className={`badge bg-${estadoEntregaColors[encomienda.estadoEntrega]} fs-6`}
                    >
                      {encomienda.estadoEntrega}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <small className="text-muted">Estado Pago</small>
                  <div>
                    <span
                      className={`badge bg-${encomienda.estadoPago === "COMPLETADO" ? "success" : "warning"} fs-6`}
                    >
                      {encomienda.estadoPago}
                    </span>
                  </div>
                </div>
              </div>
              <p>
                <strong>Costo Total:</strong> Bs.{" "}
                {encomienda.costoTotal.toFixed(2)}
              </p>
              <p>
                <strong>Fecha Límite:</strong>{" "}
                {new Date(encomienda.fechaLimiteEntrega).toLocaleDateString()}
              </p>
              {encomienda.observaciones && (
                <p>
                  <strong>Observaciones:</strong> {encomienda.observaciones}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cliente y Consignatario */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">👥 Partes Involucradas</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>Remitente (Cliente)</h6>
                <p className="mb-0">
                  <strong>{encomienda.cliente?.nombreRazonSocial}</strong>
                </p>
                <small className="text-muted">
                  {encomienda.cliente?.tipoCliente === "NATURAL"
                    ? `CI: ${encomienda.cliente?.ci}`
                    : `NIT: ${encomienda.cliente?.nit}`}
                </small>
              </div>
              <div>
                <h6>Destinatario (Consignatario)</h6>
                <p className="mb-0">
                  <strong>{encomienda.consignatario?.nombres}</strong>
                </p>
                <small className="text-muted">
                  Tel: {encomienda.consignatario?.telefono}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Ruta */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">🗺️ Ruta de Envío</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Origen:</strong> {encomienda.sucursalOrigen?.nombre} -{" "}
                {encomienda.sucursalOrigen?.ciudad}
              </p>
              <p>
                <strong>Destino:</strong> {encomienda.sucursalDestino?.nombre} -{" "}
                {encomienda.sucursalDestino?.ciudad}
              </p>
              <p>
                <strong>Dirección destino:</strong>{" "}
                {encomienda.sucursalDestino?.direccion}
              </p>
            </div>
          </div>
        </div>

        {/* Empleado que registró */}
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">👨‍💼 Registrado por</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>{encomienda.empleado?.name}</strong>
              </p>
              <small className="text-muted">{encomienda.empleado?.email}</small>
            </div>
          </div>
        </div>

        {/* Detalles de Ítems */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">📦 Ítems de la Encomienda</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Descripción</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-center">Peso (kg)</th>
                      <th className="text-end">Costo Flete</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {encomienda.detalles?.map((detalle) => (
                      <tr key={detalle.idDetalle}>
                        <td>{detalle.descripcion}</td>
                        <td className="text-center">{detalle.cantidad}</td>
                        <td className="text-center">
                          {detalle.pesoKg.toFixed(2)}
                        </td>
                        <td className="text-end">
                          Bs. {detalle.costoFlete.toFixed(2)}
                        </td>
                        <td className="text-end">
                          Bs.{" "}
                          {(detalle.cantidad * detalle.costoFlete).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan={4} className="text-end fw-bold">
                        Total:
                      </td>
                      <td className="text-end fw-bold">
                        Bs. {encomienda.costoTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Pagos */}
        {encomienda.pagos && encomienda.pagos.length > 0 && (
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">💰 Historial de Pagos</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Referencia</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {encomienda.pagos.map((pago) => (
                        <tr key={pago.idPago}>
                          <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                          <td>Bs. {pago.monto.toFixed(2)}</td>
                          <td>{pago.metodoPago.replace("_", " ")}</td>
                          <td>{pago.referencia || "-"}</td>
                          <td>
                            <span
                              className={`badge bg-${pago.estado === "COMPLETADO" ? "success" : "warning"}`}
                            >
                              {pago.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Actualizar Estado */}
      {showEstadoModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Actualizar Estado de Entrega</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEstadoModal(false)}
                />
              </div>
              <div className="modal-body">
                <label className="form-label fw-bold">Nuevo Estado</label>
                <select
                  className="form-select"
                  value={nuevoEstado}
                  onChange={(e) =>
                    setNuevoEstado(e.target.value as EstadoEntrega)
                  }
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_TRANSITO">En Tránsito</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEstadoModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateEstado}
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
