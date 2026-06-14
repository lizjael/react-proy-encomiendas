import { useState, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import { ClienteSearchInput } from "../../components/forms/ClienteSearchInput";
import { ConsignatarioSearchInput } from "../../components/forms/ConsignatarioSearchInput";
import { ClienteFormModal } from "../../components/forms/ClienteFormModal";
import { ConsignatarioFormModal } from "../../components/forms/ConsignatarioFormModal";
import { createEncomienda } from "../../api/endpoints/encomiendas.api";
import { createDetalle } from "../../api/endpoints/detalles.api";
import { createPago, METODOS_PAGO } from "../../api/endpoints/pagos.api";
import { getAllSucursales } from "../../api/endpoints/sucursales.api";
import { extractErrorMessage } from "../../utils/errorHandler";
import type {
  Cliente,
  Consignatario,
  Sucursal,
  DetalleEncomienda,
  MetodoPago,
} from "../../types";
import {
  User,
  Package,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Plus,
  Trash2,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";

interface WizardState {
  step: number;
  cliente: Cliente | null;
  consignatario: Consignatario | null;
  sucursalDestino: Sucursal | null;
  detalles: DetalleEncomienda[];
  observaciones: string;
  fechaLimiteEntrega: string;
  modalidadPago: "ORIGEN" | "DESTINO";
  pagoMonto: number;
  pagoMetodo: MetodoPago | "";
  pagoReferencia: string;
  pagoFecha: string;
}

type WizardAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_CLIENTE"; payload: Cliente }
  | { type: "SET_CONSIGNATARIO"; payload: Consignatario }
  | { type: "SET_SUCURSAL_DESTINO"; payload: Sucursal }
  | { type: "ADD_DETALLE"; payload: DetalleEncomienda }
  | {
      type: "UPDATE_DETALLE";
      payload: { index: number; detalle: Partial<DetalleEncomienda> };
    }
  | { type: "REMOVE_DETALLE"; payload: number }
  | { type: "SET_OBSERVACIONES"; payload: string }
  | { type: "SET_FECHA_LIMITE"; payload: string }
  | { type: "SET_MODALIDAD_PAGO"; payload: "ORIGEN" | "DESTINO" }
  | { type: "SET_PAGO_MONTO"; payload: number }
  | { type: "SET_PAGO_METODO"; payload: MetodoPago }
  | { type: "SET_PAGO_REFERENCIA"; payload: string }
  | { type: "SET_PAGO_FECHA"; payload: string };

const initialState: WizardState = {
  step: 1,
  cliente: null,
  consignatario: null,
  sucursalDestino: null,
  detalles: [],
  observaciones: "",
  fechaLimiteEntrega: new Date().toISOString().split("T")[0],
  modalidadPago: "ORIGEN",
  pagoMonto: 0,
  pagoMetodo: "",
  pagoReferencia: "",
  pagoFecha: new Date().toISOString().split("T")[0],
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };
    case "SET_CLIENTE":
      return { ...state, cliente: action.payload };
    case "SET_CONSIGNATARIO":
      return { ...state, consignatario: action.payload };
    case "SET_SUCURSAL_DESTINO":
      return { ...state, sucursalDestino: action.payload };
    case "ADD_DETALLE":
      return { ...state, detalles: [...state.detalles, action.payload] };
    case "UPDATE_DETALLE": {
      const updated = [...state.detalles];
      updated[action.payload.index] = {
        ...updated[action.payload.index],
        ...action.payload.detalle,
      };
      return { ...state, detalles: updated };
    }
    case "REMOVE_DETALLE":
      return {
        ...state,
        detalles: state.detalles.filter((_, i) => i !== action.payload),
      };
    case "SET_OBSERVACIONES":
      return { ...state, observaciones: action.payload };
    case "SET_FECHA_LIMITE":
      return { ...state, fechaLimiteEntrega: action.payload };
    case "SET_MODALIDAD_PAGO":
      return { ...state, modalidadPago: action.payload };
    case "SET_PAGO_MONTO":
      return { ...state, pagoMonto: action.payload };
    case "SET_PAGO_METODO":
      return { ...state, pagoMetodo: action.payload };
    case "SET_PAGO_REFERENCIA":
      return { ...state, pagoReferencia: action.payload };
    case "SET_PAGO_FECHA":
      return { ...state, pagoFecha: action.payload };
    default:
      return state;
  }
}

const steps = [
  { number: 1, title: "Cliente", icon: User },
  { number: 2, title: "Destinatario", icon: MapPin },
  { number: 3, title: "Paquetes", icon: Package },
  { number: 4, title: "Pago", icon: CreditCard },
];

export function NuevaEncomiendaWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showConsignatarioModal, setShowConsignatarioModal] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoadingSucursales(true);
    getAllSucursales()
      .then(setSucursales)
      .catch(() => toast.error("Error al cargar sucursales"))
      .finally(() => setLoadingSucursales(false));
  }, []);

  const costoTotal = state.detalles.reduce(
    (sum, det) => sum + det.cantidad * det.costoFlete,
    0,
  );

  const canNext = () => {
    switch (state.step) {
      case 1:
        return state.cliente !== null;
      case 2:
        return state.consignatario !== null && state.sucursalDestino !== null;
      case 3:
        return (
          state.detalles.length > 0 &&
          state.detalles.every(
            (d) =>
              d.descripcion &&
              d.cantidad > 0 &&
              d.pesoKg > 0 &&
              d.costoFlete > 0,
          )
        );
      case 4:
        if (state.modalidadPago === "ORIGEN") {
          return state.pagoMonto > 0 && state.pagoMetodo !== "";
        }
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;

    if (!profile.id) {
      toast.error(
        "No se pudo obtener el ID del empleado. Volvé a iniciar sesión.",
      );
      return;
    }
    if (!profile.idSucursal) {
      toast.error(
        "Tu cuenta no tiene una sucursal asignada. Contactá al administrador.",
      );
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
      const randomPart = Math.floor(10000 + Math.random() * 90000);
      const nroGuia = `GUI-${datePart}-${randomPart}`;

      const fechaEmision = now.toISOString();
      const [year, month, day] = state.fechaLimiteEntrega
        .split("-")
        .map(Number);
      const fechaLimiteEntrega = new Date(
        Date.UTC(year, month - 1, day, 12, 0, 0),
      ).toISOString();

      const [py, pm, pd] = state.pagoFecha.split("-").map(Number);
      const fechaPagoISO = new Date(
        Date.UTC(py, pm - 1, pd, 12, 0, 0),
      ).toISOString();

      const encomienda = await createEncomienda({
        nroGuia,
        fechaEmision,
        fechaLimiteEntrega,
        observaciones: state.observaciones,
        costoTotal,
        idCliente: state.cliente!.idCliente,
        idConsignatario: state.consignatario!.idConsignatario,
        idEmpleado: profile.id,
        idSucursalOrigen: profile.idSucursal,
        idSucursalDestino: state.sucursalDestino!.idSucursal,
      });

      for (const detalle of state.detalles) {
        await createDetalle({
          descripcion: detalle.descripcion,
          cantidad: detalle.cantidad,
          pesoKg: detalle.pesoKg,
          costoFlete: detalle.costoFlete,
          idEncomienda: encomienda.idEncomienda,
        });
      }

      if (state.modalidadPago === "ORIGEN") {
        await createPago({
          monto: state.pagoMonto,
          fecha: fechaPagoISO,
          referencia: state.pagoReferencia || undefined,
          metodoPago: state.pagoMetodo as MetodoPago,
          idEncomienda: encomienda.idEncomienda,
        });
      }

      toast.success("Encomienda registrada exitosamente");
      navigate(`/encomiendas/${encomienda.idEncomienda}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const addDetalle = () => {
    dispatch({
      type: "ADD_DETALLE",
      payload: {
        idDetalle: Date.now(),
        descripcion: "",
        cantidad: 1,
        pesoKg: 0,
        costoFlete: 0,
        idEncomienda: 0,
      },
    });
  };

  const sucursalesDestino = sucursales.filter(
    (s) => !s.eliminadoEn && s.idSucursal !== profile?.idSucursal,
  );

  const StepIndicator = () => (
    <div className="mb-5">
      <div className="d-flex align-items-center justify-content-between position-relative">
        {/* Línea conectora */}
        <div
          className="position-absolute"
          style={{
            top: "20px",
            left: "calc(12.5% + 10px)",
            right: "calc(12.5% + 10px)",
            height: "2px",
            backgroundColor: "#E5E0D8",
            zIndex: 0,
          }}
        />
        {steps.map((step) => {
          const isCompleted = state.step > step.number;
          const isActive = state.step === step.number;
          const StepIcon = step.icon;

          return (
            <div
              key={step.number}
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: isCompleted
                    ? "#16A34A"
                    : isActive
                      ? "#8B1A1A"
                      : "#FFFFFF",
                  border: `2px solid ${
                    isCompleted ? "#16A34A" : isActive ? "#8B1A1A" : "#E5E0D8"
                  }`,
                  transition: "all 0.3s ease",
                }}
              >
                {isCompleted ? (
                  <CheckCircle size={20} color="#FFFFFF" />
                ) : (
                  <StepIcon
                    size={18}
                    color={isActive ? "#FFFFFF" : "#9CA3AF"}
                  />
                )}
              </div>
              <span
                className="mt-2 small fw-semibold"
                style={{
                  color: isActive
                    ? "#8B1A1A"
                    : isCompleted
                      ? "#16A34A"
                      : "#9CA3AF",
                  fontSize: "0.7rem",
                }}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      <div
        className="rounded-4 overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E0D8",
          borderRadius: "16px",
        }}
      >
        <div className="p-4 p-md-5">
          <StepIndicator />

          {/* Paso 1: Cliente */}
          {state.step === 1 && (
            <div className="animate__animated animate__fadeIn">
              <h4
                className="mb-4 fw-bold"
                style={{ color: "#1A1A1A", fontSize: "1.25rem" }}
              >
                Datos del Remitente
              </h4>
              <ClienteSearchInput
                onSelect={(cliente) =>
                  dispatch({ type: "SET_CLIENTE", payload: cliente })
                }
              />
              <button
                className="btn btn-link mt-2 p-0 d-flex align-items-center gap-1"
                onClick={() => setShowClienteModal(true)}
                style={{ color: "#8B1A1A", fontSize: "0.85rem" }}
              >
                <Plus size={14} />
                Crear nuevo cliente
              </button>
              {state.cliente && (
                <div
                  className="mt-3 p-3 rounded-3"
                  style={{
                    backgroundColor: "rgba(139, 26, 26, 0.04)",
                    border: "1px solid rgba(139, 26, 26, 0.1)",
                    borderRadius: "10px",
                  }}
                >
                  <p className="mb-0 fw-semibold">
                    {state.cliente.nombreRazonSocial}
                  </p>
                  <small className="text-muted">
                    {state.cliente.tipoCliente === "NATURAL"
                      ? `CI: ${state.cliente.ci}`
                      : `NIT: ${state.cliente.nit}`}{" "}
                    | Tel: {state.cliente.telefono}
                  </small>
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Consignatario y Ruta */}
          {state.step === 2 && (
            <div>
              <h4
                className="mb-4 fw-bold"
                style={{ color: "#1A1A1A", fontSize: "1.25rem" }}
              >
                Destinatario y Ruta
              </h4>

              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">
                  Consignatario *
                </label>
                <ConsignatarioSearchInput
                  onSelect={(consignatario) =>
                    dispatch({
                      type: "SET_CONSIGNATARIO",
                      payload: consignatario,
                    })
                  }
                />
                <button
                  className="btn btn-link mt-2 p-0 d-flex align-items-center gap-1"
                  onClick={() => setShowConsignatarioModal(true)}
                  style={{ color: "#8B1A1A", fontSize: "0.85rem" }}
                >
                  <Plus size={14} />
                  Crear nuevo consignatario
                </button>
                {state.consignatario && (
                  <div
                    className="mt-2 p-3 rounded-3"
                    style={{
                      backgroundColor: "rgba(139, 26, 26, 0.04)",
                      border: "1px solid rgba(139, 26, 26, 0.1)",
                    }}
                  >
                    <p className="mb-0 fw-semibold">
                      {state.consignatario.nombres}
                    </p>
                    <small className="text-muted">
                      Tel: {state.consignatario.telefono}
                    </small>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">
                  Sucursal de Origen
                </label>
                <div
                  className="p-3 rounded-3 d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: "#F8F5F0",
                    border: "1px solid #E5E0D8",
                  }}
                >
                  <Building2 size={18} color="#8B1A1A" />
                  <span>
                    {profile?.sucursal?.nombre
                      ? profile.sucursal.nombre
                      : "No asignada"}
                  </span>
                </div>
                <small className="text-muted">
                  Sucursal asignada a tu cuenta
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">
                  Sucursal Destino *
                </label>
                {loadingSucursales ? (
                  <div className="text-muted">Cargando sucursales...</div>
                ) : (
                  <select
                    className="form-select"
                    value={state.sucursalDestino?.idSucursal || ""}
                    onChange={(e) => {
                      const id = parseInt(e.target.value);
                      const sucursal = sucursales.find(
                        (s) => s.idSucursal === id,
                      );
                      if (sucursal)
                        dispatch({
                          type: "SET_SUCURSAL_DESTINO",
                          payload: sucursal,
                        });
                    }}
                    style={{
                      borderRadius: "10px",
                      borderColor: "#E5E0D8",
                      height: "45px",
                    }}
                  >
                    <option value="">Seleccionar sucursal destino...</option>
                    {sucursalesDestino.map((s) => (
                      <option key={s.idSucursal} value={s.idSucursal}>
                        {s.nombre}
                        {s.ciudad ? ` — ${s.ciudad}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Ítems */}
          {state.step === 3 && (
            <div>
              <h4
                className="mb-4 fw-bold"
                style={{ color: "#1A1A1A", fontSize: "1.25rem" }}
              >
                Ítems del Paquete
              </h4>

              <div className="table-responsive mb-4">
                <table className="table">
                  <thead style={{ backgroundColor: "#F8F5F0" }}>
                    <tr>
                      <th>Descripción</th>
                      <th style={{ width: "90px" }} className="text-center">
                        Cant.
                      </th>
                      <th style={{ width: "100px" }} className="text-center">
                        Peso (kg)
                      </th>
                      <th style={{ width: "120px" }} className="text-end">
                        Costo Flete
                      </th>
                      <th style={{ width: "100px" }} className="text-end">
                        Subtotal
                      </th>
                      <th style={{ width: "50px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.detalles.map((detalle, index) => (
                      <tr key={detalle.idDetalle}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Descripción"
                            value={detalle.descripcion}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_DETALLE",
                                payload: {
                                  index,
                                  detalle: { descripcion: e.target.value },
                                },
                              })
                            }
                            style={{
                              borderRadius: "8px",
                              borderColor: "#E5E0D8",
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            min="1"
                            value={detalle.cantidad}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_DETALLE",
                                payload: {
                                  index,
                                  detalle: {
                                    cantidad: parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            style={{
                              borderRadius: "8px",
                              borderColor: "#E5E0D8",
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            step="0.1"
                            min="0"
                            value={detalle.pesoKg}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_DETALLE",
                                payload: {
                                  index,
                                  detalle: {
                                    pesoKg: parseFloat(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            style={{
                              borderRadius: "8px",
                              borderColor: "#E5E0D8",
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm text-end"
                            step="0.01"
                            min="0"
                            value={detalle.costoFlete}
                            onChange={(e) =>
                              dispatch({
                                type: "UPDATE_DETALLE",
                                payload: {
                                  index,
                                  detalle: {
                                    costoFlete: parseFloat(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            style={{
                              borderRadius: "8px",
                              borderColor: "#E5E0D8",
                            }}
                          />
                        </td>
                        <td className="text-end fw-semibold">
                          Bs.{" "}
                          {(detalle.cantidad * detalle.costoFlete).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn p-0"
                            onClick={() =>
                              dispatch({
                                type: "REMOVE_DETALLE",
                                payload: index,
                              })
                            }
                            style={{ color: "#DC2626" }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="btn mb-4 d-flex align-items-center gap-2"
                onClick={addDetalle}
                style={{
                  backgroundColor: "transparent",
                  border: "1px dashed #8B1A1A",
                  borderRadius: "10px",
                  color: "#8B1A1A",
                  padding: "0.5rem 1rem",
                }}
              >
                <Plus size={16} />
                Agregar Ítem
              </button>

              <div className="mb-4">
                <label className="form-label fw-semibold mb-2 d-flex align-items-center gap-2">
                  <Calendar size={16} />
                  Fecha Límite de Entrega *
                </label>
                <input
                  type="date"
                  className="form-control"
                  min={new Date().toISOString().split("T")[0]}
                  value={state.fechaLimiteEntrega}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_FECHA_LIMITE",
                      payload: e.target.value,
                    })
                  }
                  style={{
                    borderRadius: "10px",
                    borderColor: "#E5E0D8",
                    maxWidth: "250px",
                  }}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold mb-2">
                  Observaciones
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  maxLength={500}
                  placeholder="Información adicional sobre el envío..."
                  value={state.observaciones}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_OBSERVACIONES",
                      payload: e.target.value,
                    })
                  }
                  style={{ borderRadius: "10px", borderColor: "#E5E0D8" }}
                />
                <small className="text-muted">
                  {state.observaciones.length}/500 caracteres
                </small>
              </div>

              <div
                className="p-3 rounded-3"
                style={{
                  backgroundColor: "rgba(212, 160, 23, 0.08)",
                  border: "1px solid rgba(212, 160, 23, 0.2)",
                }}
              >
                <h6 className="fw-semibold mb-2" style={{ color: "#D4A017" }}>
                  Resumen del envío
                </h6>
                <p className="mb-0">
                  Peso total:{" "}
                  {state.detalles
                    .reduce((sum, d) => sum + d.pesoKg, 0)
                    .toFixed(2)}{" "}
                  kg
                  <br />
                  Costo total: <strong>Bs. {costoTotal.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Paso 4: Pago */}
          {state.step === 4 && (
            <div>
              <h4
                className="mb-4 fw-bold"
                style={{ color: "#1A1A1A", fontSize: "1.25rem" }}
              >
                Modalidad de Pago
              </h4>

              <div className="mb-4">
                <div className="d-flex gap-3">
                  <button
                    className={`btn flex-1 d-flex align-items-center justify-content-center gap-2 ${
                      state.modalidadPago === "ORIGEN"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() =>
                      dispatch({
                        type: "SET_MODALIDAD_PAGO",
                        payload: "ORIGEN",
                      })
                    }
                    style={{
                      backgroundColor:
                        state.modalidadPago === "ORIGEN"
                          ? "#8B1A1A"
                          : "transparent",
                      borderColor:
                        state.modalidadPago === "ORIGEN"
                          ? "#8B1A1A"
                          : "#E5E0D8",
                      color:
                        state.modalidadPago === "ORIGEN"
                          ? "#FFFFFF"
                          : "#6B7280",
                      borderRadius: "10px",
                      padding: "0.75rem",
                      flex: 1,
                    }}
                  >
                    💰 Pago en origen
                  </button>
                  <button
                    className={`btn flex-1 d-flex align-items-center justify-content-center gap-2 ${
                      state.modalidadPago === "DESTINO"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() =>
                      dispatch({
                        type: "SET_MODALIDAD_PAGO",
                        payload: "DESTINO",
                      })
                    }
                    style={{
                      backgroundColor:
                        state.modalidadPago === "DESTINO"
                          ? "#8B1A1A"
                          : "transparent",
                      borderColor:
                        state.modalidadPago === "DESTINO"
                          ? "#8B1A1A"
                          : "#E5E0D8",
                      color:
                        state.modalidadPago === "DESTINO"
                          ? "#FFFFFF"
                          : "#6B7280",
                      borderRadius: "10px",
                      padding: "0.75rem",
                      flex: 1,
                    }}
                  >
                    🎯 Pago en destino
                  </button>
                </div>
              </div>

              {state.modalidadPago === "ORIGEN" && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-3">
                    <label className="form-label fw-semibold mb-2">
                      Monto *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      step="0.01"
                      min="0"
                      value={state.pagoMonto}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PAGO_MONTO",
                          payload: parseFloat(e.target.value) || 0,
                        })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "45px",
                      }}
                    />
                    <small className="text-muted">
                      Costo total de la encomienda: Bs. {costoTotal.toFixed(2)}
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold mb-2">
                      Método de Pago *
                    </label>
                    <select
                      className="form-select"
                      value={state.pagoMetodo}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PAGO_METODO",
                          payload: e.target.value as MetodoPago,
                        })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "45px",
                      }}
                    >
                      <option value="">Seleccionar método...</option>
                      {METODOS_PAGO.map((m) => (
                        <option key={m} value={m}>
                          {m.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold mb-2">
                      Referencia (opcional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Número de operación, voucher, etc."
                      value={state.pagoReferencia}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PAGO_REFERENCIA",
                          payload: e.target.value,
                        })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        height: "45px",
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold mb-2">
                      Fecha de Pago
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={state.pagoFecha}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PAGO_FECHA",
                          payload: e.target.value,
                        })
                      }
                      style={{
                        borderRadius: "10px",
                        borderColor: "#E5E0D8",
                        maxWidth: "200px",
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                className="p-3 rounded-3 mt-4"
                style={{
                  backgroundColor: "rgba(22, 163, 74, 0.08)",
                  border: "1px solid rgba(22, 163, 74, 0.2)",
                }}
              >
                <h6 className="fw-semibold mb-2" style={{ color: "#16A34A" }}>
                  Resumen final
                </h6>
                <p className="mb-1">
                  <strong>Cliente:</strong> {state.cliente?.nombreRazonSocial}
                </p>
                <p className="mb-1">
                  <strong>Consignatario:</strong> {state.consignatario?.nombres}
                </p>
                <p className="mb-1">
                  <strong>Ruta:</strong> {profile?.sucursal?.nombre || "Origen"}{" "}
                  → {state.sucursalDestino?.nombre}
                </p>
                <p className="mb-1">
                  <strong>Costo total:</strong> Bs. {costoTotal.toFixed(2)}
                </p>
                <p className="mb-0">
                  <strong>Modalidad:</strong>{" "}
                  {state.modalidadPago === "ORIGEN"
                    ? "Pago en origen"
                    : "Pago en destino"}
                </p>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="d-flex justify-content-between mt-5 pt-3">
            <button
              className="btn d-flex align-items-center gap-2"
              onClick={() =>
                dispatch({ type: "SET_STEP", payload: state.step - 1 })
              }
              disabled={state.step === 1}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #E5E0D8",
                borderRadius: "10px",
                padding: "0.5rem 1.25rem",
                color: "#6B7280",
                opacity: state.step === 1 ? 0.5 : 1,
              }}
            >
              ← Anterior
            </button>
            {state.step < 4 ? (
              <button
                className="btn d-flex align-items-center gap-2"
                onClick={() =>
                  dispatch({ type: "SET_STEP", payload: state.step + 1 })
                }
                disabled={!canNext()}
                style={{
                  backgroundColor: "#8B1A1A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.5rem 1.25rem",
                  color: "#FFFFFF",
                  opacity: canNext() ? 1 : 0.5,
                }}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="btn d-flex align-items-center gap-2"
                onClick={handleSubmit}
                disabled={!canNext() || loading}
                style={{
                  backgroundColor: "#16A34A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.5rem 1.25rem",
                  color: "#FFFFFF",
                  opacity: canNext() && !loading ? 1 : 0.5,
                }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirmar y Registrar
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <ClienteFormModal
        show={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSaved={() => {
          setShowClienteModal(false);
          toast.success("Cliente creado, ya puedes buscarlo");
        }}
      />

      <ConsignatarioFormModal
        show={showConsignatarioModal}
        onClose={() => setShowConsignatarioModal(false)}
        onSaved={() => {
          setShowConsignatarioModal(false);
          toast.success("Consignatario creado, ya puedes buscarlo");
        }}
      />
    </div>
  );
}
