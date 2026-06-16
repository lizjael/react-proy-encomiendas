import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getEncomiendaById,
  updateEncomienda,
} from "../../api/endpoints/encomiendas.api";
import {
  getDetallesByEncomienda,
  createDetalle,
  updateDetalle,
  deleteDetalle,
} from "../../api/endpoints/detalles.api";
import { Spinner } from "../../components/ui/Spinner";
import { usePermissions } from "../../hooks/usePermissions";
import type {
  Encomienda,
  EstadoEntrega,
  DetalleEncomienda,
  CreateDetalleEncomiendaDto,
} from "../../types";
import { generarFacturaEncomienda } from "../../utils/pdfGenerator";
import {
  Package,
  User,
  MapPin,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  FileText,
  Edit,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const estadoEntregaConfig = {
  PENDIENTE: {
    label: "Pendiente",
    color: "#D4A017",
    bg: "rgba(212, 160, 23, 0.1)",
    icon: Clock,
  },
  EN_TRANSITO: {
    label: "En Tránsito",
    color: "#0284C7",
    bg: "rgba(2, 132, 199, 0.1)",
    icon: Truck,
  },
  ENTREGADO: {
    label: "Entregado",
    color: "#16A34A",
    bg: "rgba(22, 163, 74, 0.1)",
    icon: CheckCircle,
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
    icon: AlertCircle,
  },
};

const timelineSteps = [
  {
    key: "PENDIENTE",
    label: "Registrada",
    description: "Encomienda creada en el sistema",
  },
  {
    key: "EN_TRANSITO",
    label: "En Tránsito",
    description: "Encomienda en camino",
  },
  {
    key: "ENTREGADO",
    label: "Entregada",
    description: "Entregada al destinatario",
  },
];

const detalleVacio: Omit<CreateDetalleEncomiendaDto, "idEncomienda"> = {
  descripcion: "",
  cantidad: 1,
  pesoKg: 0,
  costoFlete: 0,
};

export function EncomiendaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [encomienda, setEncomienda] = useState<Encomienda | null>(null);
  const [detalles, setDetalles] = useState<DetalleEncomienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoEntrega>("PENDIENTE");
  const { canEdit } = usePermissions();

  // ── Estado modal de detalles ──
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleEditando, setDetalleEditando] =
    useState<DetalleEncomienda | null>(null);
  const [formDetalle, setFormDetalle] =
    useState<Omit<CreateDetalleEncomiendaDto, "idEncomienda">>(detalleVacio);
  const [savingDetalle, setSavingDetalle] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadAll();
  }, [id]);

  // ✅ Carga encomienda Y detalles por separado para garantizar que lleguen
  const loadAll = async () => {
    setLoading(true);
    try {
      const idNum = parseInt(id!);
      const [enc, dets] = await Promise.all([
        getEncomiendaById(idNum),
        getDetallesByEncomienda(idNum),
      ]);
      setEncomienda(enc);
      // Preferir los detalles del endpoint dedicado; si está vacío, usar los
      // que vengan embebidos en la encomienda como fallback
      setDetalles(dets.length > 0 ? dets : (enc.detalles ?? []));
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
      loadAll();
      setShowEstadoModal(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al actualizar estado",
      );
    }
  };

  // ✅ PDF se genera con los detalles que ya cargamos explícitamente
  const handleGeneratePDF = () => {
    if (encomienda) {
      const encomiendaConDetalles: Encomienda = {
        ...encomienda,
        detalles,
      };
      generarFacturaEncomienda(encomiendaConDetalles);
      toast.success("Factura generada exitosamente");
    }
  };

  // ── Handlers del modal de detalles ──
  const abrirNuevoDetalle = () => {
    setDetalleEditando(null);
    setFormDetalle(detalleVacio);
    setShowDetalleModal(true);
  };

  const abrirEditarDetalle = (det: DetalleEncomienda) => {
    setDetalleEditando(det);
    setFormDetalle({
      descripcion: det.descripcion,
      cantidad: det.cantidad,
      pesoKg: det.pesoKg,
      costoFlete: det.costoFlete,
    });
    setShowDetalleModal(true);
  };

  const cerrarDetalleModal = () => {
    setShowDetalleModal(false);
    setDetalleEditando(null);
    setFormDetalle(detalleVacio);
  };

  const handleSaveDetalle = async () => {
    if (!encomienda) return;
    if (!formDetalle.descripcion.trim()) {
      toast.error("La descripción es obligatoria");
      return;
    }
    if (formDetalle.cantidad <= 0) {
      toast.error("La cantidad debe ser mayor a 0");
      return;
    }
    setSavingDetalle(true);
    try {
      if (detalleEditando) {
        await updateDetalle(detalleEditando.idDetalle, formDetalle);
        toast.success("Detalle actualizado correctamente");
      } else {
        await createDetalle({
          ...formDetalle,
          idEncomienda: encomienda.idEncomienda,
        });
        toast.success("Detalle agregado correctamente");
      }
      cerrarDetalleModal();
      // Recargar solo los detalles para no perder el estado del resto
      const dets = await getDetallesByEncomienda(encomienda.idEncomienda);
      setDetalles(dets);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al guardar el detalle",
      );
    } finally {
      setSavingDetalle(false);
    }
  };

  const handleDeleteDetalle = async (idDetalle: number) => {
    if (!window.confirm("¿Eliminar este detalle?")) return;
    setDeletingId(idDetalle);
    try {
      await deleteDetalle(idDetalle);
      toast.success("Detalle eliminado");
      setDetalles((prev) => prev.filter((d) => d.idDetalle !== idDetalle));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al eliminar el detalle",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getCurrentStepIndex = () => {
    if (!encomienda) return 0;
    if (encomienda.estadoEntrega === "CANCELADO") return -1;
    const index = timelineSteps.findIndex(
      (s) => s.key === encomienda.estadoEntrega,
    );
    return index >= 0 ? index : 0;
  };

  if (loading) return <Spinner fullPage />;
  if (!encomienda) return null;

  const estadoConfig = estadoEntregaConfig[encomienda.estadoEntrega];
  const EstadoIcon = estadoConfig.icon;
  const currentStep = getCurrentStepIndex();

  const subtotal = detalles.reduce(
    (acc, d) => acc + d.cantidad * d.costoFlete,
    0,
  );

  return (
    <div className="container-fluid px-0">
      {/* Botón volver */}
      <button
        onClick={() => navigate("/encomiendas")}
        className="btn d-flex align-items-center gap-2 mb-4"
        style={{
          backgroundColor: "transparent",
          border: "none",
          color: "#6B7280",
          padding: "0",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#8B1A1A";
          e.currentTarget.style.transform = "translateX(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#6B7280";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        <ArrowLeft size={18} />
        Volver a Encomiendas
      </button>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <h1
              className="fw-bold mb-0"
              style={{
                color: "#1A1A1A",
                fontSize: "1.75rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Encomienda {encomienda.nroGuia}
            </h1>
            <span
              className="badge rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              style={{
                backgroundColor: estadoConfig.bg,
                color: estadoConfig.color,
                fontSize: "0.75rem",
              }}
            >
              <EstadoIcon size={14} />
              {estadoConfig.label}
            </span>
          </div>
          <p style={{ color: "#6B7280", fontSize: "0.85rem" }}>
            Fecha de emisión:{" "}
            {new Date(encomienda.fechaEmision).toLocaleDateString()}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn d-flex align-items-center gap-2"
            onClick={handleGeneratePDF}
            style={{
              backgroundColor: "#F8F5F0",
              border: "1px solid #E5E0D8",
              borderRadius: "10px",
              padding: "0.5rem 1rem",
              color: "#1A1A1A",
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
            <FileText size={16} />
            Descargar Factura
          </button>
          {canEdit("encomiendas") && (
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={() => setShowEstadoModal(true)}
              style={{
                backgroundColor: "#8B1A1A",
                border: "none",
                borderRadius: "10px",
                padding: "0.5rem 1rem",
                color: "#FFFFFF",
                fontSize: "0.85rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#5C0E0E";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#8B1A1A";
              }}
            >
              <Edit size={16} />
              Actualizar Estado
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Columna izquierda */}
        <div className="col-lg-7">
          {/* Remitente */}
          <div
            className="rounded-3 p-4 mb-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <User size={18} color="#8B1A1A" />
              <h6 className="mb-0 fw-semibold" style={{ color: "#1A1A1A" }}>
                Datos del Remitente
              </h6>
            </div>
            <p className="mb-1 fw-semibold">
              {encomienda.cliente?.nombreRazonSocial}
            </p>
            <p className="mb-0 text-muted small">
              {encomienda.cliente?.tipoCliente === "NATURAL"
                ? `CI: ${encomienda.cliente?.ci}`
                : `NIT: ${encomienda.cliente?.nit}`}{" "}
              | Tel: {encomienda.cliente?.telefono}
            </p>
          </div>

          {/* Destinatario */}
          <div
            className="rounded-3 p-4 mb-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <User size={18} color="#D4A017" />
              <h6 className="mb-0 fw-semibold" style={{ color: "#1A1A1A" }}>
                Datos del Destinatario
              </h6>
            </div>
            <p className="mb-1 fw-semibold">
              {encomienda.consignatario?.nombres}
            </p>
            <p className="mb-0 text-muted small">
              Tel: {encomienda.consignatario?.telefono}
            </p>
          </div>

          {/* Ruta */}
          <div
            className="rounded-3 p-4 mb-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-3">
              <MapPin size={18} color="#8B1A1A" />
              <h6 className="mb-0 fw-semibold" style={{ color: "#1A1A1A" }}>
                Ruta de Envío
              </h6>
            </div>
            <div className="d-flex align-items-center justify-content-between gap-3">
              <div>
                <p className="mb-0 small text-muted">Origen</p>
                <p className="mb-0 fw-semibold">
                  {encomienda.sucursalOrigen?.nombre}
                </p>
                <small className="text-muted">
                  {encomienda.sucursalOrigen?.ciudad}
                </small>
              </div>
              <Truck size={20} color="#D4A017" />
              <div className="text-end">
                <p className="mb-0 small text-muted">Destino</p>
                <p className="mb-0 fw-semibold">
                  {encomienda.sucursalDestino?.nombre}
                </p>
                <small className="text-muted">
                  {encomienda.sucursalDestino?.ciudad}
                </small>
              </div>
            </div>
          </div>

          {/* ✅ Detalle del paquete con CRUD */}
          <div
            className="rounded-3 overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
            }}
          >
            <div
              className="p-4 border-bottom d-flex justify-content-between align-items-center"
              style={{ borderColor: "#E5E0D8" }}
            >
              <div className="d-flex align-items-center gap-2">
                <Package size={18} color="#8B1A1A" />
                <h6 className="mb-0 fw-semibold" style={{ color: "#1A1A1A" }}>
                  Detalle del Paquete
                </h6>
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: "rgba(139, 26, 26, 0.1)",
                    color: "#8B1A1A",
                    fontSize: "0.7rem",
                  }}
                >
                  {detalles.length} ítem{detalles.length !== 1 ? "s" : ""}
                </span>
              </div>
              {canEdit("encomiendas") && (
                <button
                  className="btn btn-sm d-flex align-items-center gap-1"
                  onClick={abrirNuevoDetalle}
                  style={{
                    backgroundColor: "#8B1A1A",
                    border: "none",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "0.78rem",
                    padding: "0.3rem 0.75rem",
                  }}
                >
                  <Plus size={14} />
                  Agregar ítem
                </button>
              )}
            </div>
            <div className="p-0">
              {detalles.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Package size={36} color="#E5E0D8" className="mb-2" />
                  <p className="mb-0 small">No hay ítems registrados.</p>
                  {canEdit("encomiendas") && (
                    <p className="mb-0 small">
                      Haz clic en "Agregar ítem" para comenzar.
                    </p>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead style={{ backgroundColor: "#F8F5F0" }}>
                      <tr>
                        <th className="ps-4">Descripción</th>
                        <th className="text-center">Cantidad</th>
                        <th className="text-center">Peso (kg)</th>
                        <th className="text-end">Costo Flete</th>
                        <th className="text-end">Subtotal</th>
                        {canEdit("encomiendas") && (
                          <th className="text-center pe-4">Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((detalle) => (
                        <tr key={detalle.idDetalle}>
                          <td className="ps-4">{detalle.descripcion}</td>
                          <td className="text-center">{detalle.cantidad}</td>
                          <td className="text-center">
                            {Number(detalle.pesoKg).toFixed(2)}
                          </td>
                          <td className="text-end">
                            Bs. {Number(detalle.costoFlete).toFixed(2)}
                          </td>
                          <td className="text-end fw-semibold">
                            Bs.{" "}
                            {(detalle.cantidad * detalle.costoFlete).toFixed(2)}
                          </td>
                          {canEdit("encomiendas") && (
                            <td className="text-center pe-4">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  className="btn btn-sm"
                                  title="Editar"
                                  onClick={() => abrirEditarDetalle(detalle)}
                                  style={{
                                    padding: "0.2rem 0.5rem",
                                    backgroundColor: "rgba(2,132,199,0.1)",
                                    border: "none",
                                    borderRadius: "6px",
                                    color: "#0284C7",
                                  }}
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  className="btn btn-sm"
                                  title="Eliminar"
                                  disabled={deletingId === detalle.idDetalle}
                                  onClick={() =>
                                    handleDeleteDetalle(detalle.idDetalle)
                                  }
                                  style={{
                                    padding: "0.2rem 0.5rem",
                                    backgroundColor: "rgba(220,38,38,0.1)",
                                    border: "none",
                                    borderRadius: "6px",
                                    color: "#DC2626",
                                  }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot
                      style={{
                        backgroundColor: "#F8F5F0",
                        borderTop: "1px solid #E5E0D8",
                      }}
                    >
                      <tr>
                        <td
                          colSpan={canEdit("encomiendas") ? 5 : 4}
                          className="text-end fw-bold ps-4"
                        >
                          Total:
                        </td>
                        <td
                          className="text-end fw-bold pe-4"
                          style={{ color: "#8B1A1A" }}
                        >
                          Bs. {subtotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha - Timeline y Pagos */}
        <div className="col-lg-5">
          {/* Timeline */}
          <div
            className="rounded-3 p-4 mb-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
            }}
          >
            <h6 className="fw-semibold mb-4" style={{ color: "#1A1A1A" }}>
              Estado de la Encomienda
            </h6>
            {currentStep === -1 ? (
              <div className="text-center py-4">
                <AlertCircle size={48} color="#DC2626" />
                <p className="mt-2 fw-semibold" style={{ color: "#DC2626" }}>
                  Encomienda Cancelada
                </p>
              </div>
            ) : (
              <div className="position-relative">
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isActive = index === currentStep;
                  const StepIcon =
                    step.key === "PENDIENTE"
                      ? Clock
                      : step.key === "EN_TRANSITO"
                        ? Truck
                        : CheckCircle;

                  return (
                    <div
                      key={step.key}
                      className="position-relative"
                      style={{ paddingLeft: "32px" }}
                    >
                      {index < timelineSteps.length - 1 && (
                        <div
                          style={{
                            position: "absolute",
                            left: "11px",
                            top: "28px",
                            width: "2px",
                            height: "calc(100% - 8px)",
                            backgroundColor: isCompleted
                              ? "#8B1A1A"
                              : "#E5E0D8",
                            transition: "background-color 0.3s ease",
                          }}
                        />
                      )}
                      <div
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{
                          left: "0",
                          top: "4px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: isCompleted ? "#8B1A1A" : "#F8F5F0",
                          border: `2px solid ${isCompleted ? "#8B1A1A" : "#E5E0D8"}`,
                          transition: "all 0.3s ease",
                        }}
                      >
                        <StepIcon
                          size={12}
                          color={isCompleted ? "#FFFFFF" : "#9CA3AF"}
                        />
                      </div>
                      <div className="mb-4">
                        <p
                          className="mb-0 fw-semibold"
                          style={{
                            color: isActive
                              ? "#8B1A1A"
                              : isCompleted
                                ? "#1A1A1A"
                                : "#9CA3AF",
                            fontSize: "0.85rem",
                          }}
                        >
                          {step.label}
                        </p>
                        <p
                          className="mb-0 small"
                          style={{ color: isCompleted ? "#6B7280" : "#D1D5DB" }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div
            className="rounded-3 p-4 mb-4"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E0D8",
              borderRadius: "12px",
            }}
          >
            <h6 className="fw-semibold mb-3" style={{ color: "#1A1A1A" }}>
              Información Adicional
            </h6>
            <div className="mb-3">
              <p className="mb-0 small text-muted">Fecha límite de entrega</p>
              <p className="mb-0">
                {new Date(encomienda.fechaLimiteEntrega).toLocaleDateString()}
              </p>
            </div>
            {encomienda.observaciones && (
              <div>
                <p className="mb-0 small text-muted">Observaciones</p>
                <p className="mb-0">{encomienda.observaciones}</p>
              </div>
            )}
          </div>

          {/* Pagos */}
          {encomienda.pagos && encomienda.pagos.length > 0 && (
            <div
              className="rounded-3 p-4"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E0D8",
                borderRadius: "12px",
              }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <CreditCard size={18} color="#8B1A1A" />
                <h6 className="mb-0 fw-semibold" style={{ color: "#1A1A1A" }}>
                  Historial de Pagos
                </h6>
              </div>
              {encomienda.pagos.map((pago) => (
                <div
                  key={pago.idPago}
                  className="mb-3 pb-3 border-bottom"
                  style={{ borderColor: "#E5E0D8" }}
                >
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold">
                      Bs. {pago.monto.toFixed(2)}
                    </span>
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor:
                          pago.estado === "COMPLETADO"
                            ? "rgba(22, 163, 74, 0.1)"
                            : "rgba(212, 160, 23, 0.1)",
                        color:
                          pago.estado === "COMPLETADO" ? "#16A34A" : "#D4A017",
                      }}
                    >
                      {pago.estado}
                    </span>
                  </div>
                  <p className="mb-0 small text-muted">
                    {new Date(pago.fecha).toLocaleDateString()} •{" "}
                    {pago.metodoPago.replace("_", " ")}
                  </p>
                  {pago.referencia && (
                    <p className="mb-0 small text-muted">
                      Ref: {pago.referencia}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Actualizar Estado ── */}
      {showEstadoModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ borderRadius: "16px", overflow: "hidden" }}
            >
              <div className="modal-header border-0 pt-4 px-4">
                <h5 className="modal-title fw-semibold">
                  Actualizar Estado de Entrega
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEstadoModal(false)}
                />
              </div>
              <div className="modal-body px-4">
                <label className="form-label fw-semibold mb-2">
                  Nuevo Estado
                </label>
                <select
                  className="form-select"
                  value={nuevoEstado}
                  onChange={(e) =>
                    setNuevoEstado(e.target.value as EstadoEntrega)
                  }
                  style={{ borderRadius: "10px", borderColor: "#E5E0D8" }}
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_TRANSITO">En Tránsito</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div className="modal-footer border-0 pb-4 px-4">
                <button
                  className="btn"
                  onClick={() => setShowEstadoModal(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #E5E0D8",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn"
                  onClick={handleUpdateEstado}
                  style={{
                    backgroundColor: "#8B1A1A",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                    color: "#FFFFFF",
                  }}
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Agregar / Editar Detalle ── */}
      {showDetalleModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content"
              style={{ borderRadius: "16px", overflow: "hidden" }}
            >
              <div className="modal-header border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-semibold mb-0">
                  {detalleEditando ? "Editar Ítem" : "Agregar Ítem"}
                </h5>
                <button
                  type="button"
                  className="btn p-0"
                  onClick={cerrarDetalleModal}
                  style={{ color: "#6B7280" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body px-4 pb-2">
                {/* Descripción */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">
                    Descripción <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: Ropa, electrónico, alimentos…"
                    value={formDetalle.descripcion}
                    onChange={(e) =>
                      setFormDetalle((f) => ({
                        ...f,
                        descripcion: e.target.value,
                      }))
                    }
                    style={{ borderRadius: "10px", borderColor: "#E5E0D8" }}
                  />
                </div>

                <div className="row g-3">
                  {/* Cantidad */}
                  <div className="col-6">
                    <label className="form-label fw-semibold small">
                      Cantidad <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="form-control"
                      value={formDetalle.cantidad}
                      onChange={(e) =>
                        setFormDetalle((f) => ({
                          ...f,
                          cantidad: parseInt(e.target.value) || 1,
                        }))
                      }
                      style={{ borderRadius: "10px", borderColor: "#E5E0D8" }}
                    />
                  </div>

                  {/* Peso */}
                  <div className="col-6">
                    <label className="form-label fw-semibold small">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="form-control"
                      value={formDetalle.pesoKg}
                      onChange={(e) =>
                        setFormDetalle((f) => ({
                          ...f,
                          pesoKg: parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={{ borderRadius: "10px", borderColor: "#E5E0D8" }}
                    />
                  </div>

                  {/* Costo Flete */}
                  <div className="col-12">
                    <label className="form-label fw-semibold small">
                      Costo Flete (Bs.)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      className="form-control"
                      value={formDetalle.costoFlete}
                      onChange={(e) =>
                        setFormDetalle((f) => ({
                          ...f,
                          costoFlete: parseFloat(e.target.value) || 0,
                        }))
                      }
                      style={{ borderRadius: "10px", borderColor: "#E5E0D8" }}
                    />
                  </div>
                </div>

                {/* Preview subtotal */}
                {formDetalle.cantidad > 0 && formDetalle.costoFlete > 0 && (
                  <div
                    className="mt-3 p-3 rounded-3"
                    style={{ backgroundColor: "#F8F5F0" }}
                  >
                    <small className="text-muted">Subtotal estimado:</small>
                    <p
                      className="mb-0 fw-bold"
                      style={{ color: "#8B1A1A", fontSize: "1rem" }}
                    >
                      Bs.{" "}
                      {(formDetalle.cantidad * formDetalle.costoFlete).toFixed(
                        2,
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 pb-4 px-4 gap-2">
                <button
                  className="btn"
                  onClick={cerrarDetalleModal}
                  disabled={savingDetalle}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #E5E0D8",
                    borderRadius: "8px",
                    padding: "0.5rem 1.25rem",
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn d-flex align-items-center gap-2"
                  onClick={handleSaveDetalle}
                  disabled={savingDetalle}
                  style={{
                    backgroundColor: "#8B1A1A",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1.25rem",
                    color: "#FFFFFF",
                  }}
                >
                  {savingDetalle ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                      />
                      Guardando…
                    </>
                  ) : detalleEditando ? (
                    "Guardar cambios"
                  ) : (
                    "Agregar ítem"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
