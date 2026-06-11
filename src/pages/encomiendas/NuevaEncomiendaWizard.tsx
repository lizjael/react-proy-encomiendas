// src/pages/encomiendas/NuevaEncomiendaWizard.tsx
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

export function NuevaEncomiendaWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showConsignatarioModal, setShowConsignatarioModal] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Cargar sucursales al montar
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
    setLoading(true);
    try {
      // 1. Crear encomienda — idEmpleado lo inyecta el backend desde @ActiveUser()
      const encomienda = await createEncomienda({
        fechaLimiteEntrega: state.fechaLimiteEntrega,
        observaciones: state.observaciones,
        costoTotal,
        idCliente: state.cliente!.idCliente,
        idConsignatario: state.consignatario!.idConsignatario,
        idSucursalDestino: state.sucursalDestino!.idSucursal,
      });

      // 2. Crear detalles
      for (const detalle of state.detalles) {
        await createDetalle({
          descripcion: detalle.descripcion,
          cantidad: detalle.cantidad,
          pesoKg: detalle.pesoKg,
          costoFlete: detalle.costoFlete,
          idEncomienda: encomienda.idEncomienda,
        });
      }

      // 3. Pago solo si es en origen
      if (state.modalidadPago === "ORIGEN") {
        await createPago({
          monto: state.pagoMonto,
          fecha: state.pagoFecha,
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

  // Sucursales disponibles como destino (excluir la del empleado si está asignada)
  const sucursalesDestino = sucursales.filter(
    (s) => !s.eliminadoEn && s.idSucursal !== profile?.idSucursal,
  );

  const StepIndicator = () => (
    <div className="mb-4">
      <div className="progress" style={{ height: "2px" }}>
        <div
          className="progress-bar bg-primary"
          style={{ width: `${(state.step / 4) * 100}%` }}
        />
      </div>
      <div className="d-flex justify-content-between mt-2">
        {["Cliente", "Destinatario", "Paquetes", "Pago"].map((label, index) => (
          <div key={label} className="text-center">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 ${
                state.step > index + 1
                  ? "bg-success"
                  : state.step === index + 1
                    ? "bg-primary"
                    : "bg-secondary"
              }`}
              style={{ width: "30px", height: "30px", color: "white" }}
            >
              {state.step > index + 1 ? "✓" : index + 1}
            </div>
            <small
              className={
                state.step === index + 1 ? "text-primary fw-bold" : "text-muted"
              }
            >
              {label}
            </small>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <StepIndicator />

          {/* Paso 1: Cliente */}
          {state.step === 1 && (
            <div>
              <h4 className="mb-4">📋 Datos del Remitente</h4>
              <ClienteSearchInput
                onSelect={(cliente) =>
                  dispatch({ type: "SET_CLIENTE", payload: cliente })
                }
              />
              <button
                className="btn btn-link mt-2"
                onClick={() => setShowClienteModal(true)}
              >
                + Crear nuevo cliente
              </button>
              {state.cliente && (
                <div className="card mt-3 bg-light">
                  <div className="card-body">
                    <h6 className="mb-2">Cliente seleccionado:</h6>
                    <p className="mb-1">
                      <strong>{state.cliente.nombreRazonSocial}</strong>
                    </p>
                    <p className="mb-0 text-muted">
                      {state.cliente.tipoCliente === "NATURAL"
                        ? `CI: ${state.cliente.ci}`
                        : `NIT: ${state.cliente.nit}`}{" "}
                      | Tel: {state.cliente.telefono}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Consignatario y Ruta */}
          {state.step === 2 && (
            <div>
              <h4 className="mb-4">📦 Destinatario y Ruta</h4>

              <div className="mb-4">
                <label className="form-label fw-bold">Consignatario *</label>
                <ConsignatarioSearchInput
                  onSelect={(consignatario) =>
                    dispatch({
                      type: "SET_CONSIGNATARIO",
                      payload: consignatario,
                    })
                  }
                />
                <button
                  className="btn btn-link mt-2"
                  onClick={() => setShowConsignatarioModal(true)}
                >
                  + Crear nuevo consignatario
                </button>
                {state.consignatario && (
                  <div className="card mt-2 bg-light">
                    <div className="card-body">
                      <h6 className="mb-2">Consignatario seleccionado:</h6>
                      <p className="mb-1">
                        <strong>{state.consignatario.nombres}</strong>
                      </p>
                      <p className="mb-0 text-muted">
                        Tel: {state.consignatario.telefono}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Sucursal de Origen</label>
                <input
                  type="text"
                  className="form-control"
                  value={
                    profile?.sucursal?.nombre
                      ? `${profile.sucursal.nombre}${profile.sucursal.ciudad ? ` — ${profile.sucursal.ciudad}` : ""}`
                      : profile?.idSucursal
                        ? `Sucursal ID: ${profile.idSucursal}`
                        : "No asignada"
                  }
                  disabled
                />
                <small className="text-muted">
                  Sucursal asignada a tu cuenta
                </small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Sucursal Destino *</label>
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
              <h4 className="mb-4">📝 Ítems del Paquete</h4>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Descripción</th>
                      <th style={{ width: "100px" }}>Cantidad</th>
                      <th style={{ width: "100px" }}>Peso (kg)</th>
                      <th style={{ width: "120px" }}>Costo Flete</th>
                      <th style={{ width: "100px" }}>Subtotal</th>
                      <th style={{ width: "60px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.detalles.map((detalle, index) => (
                      <tr key={detalle.idDetalle}>
                        <td>
                          <input
                            type="text"
                            className="form-control"
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
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
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
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
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
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
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
                          />
                        </td>
                        <td className="text-end">
                          Bs.{" "}
                          {(detalle.cantidad * detalle.costoFlete).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() =>
                              dispatch({
                                type: "REMOVE_DETALLE",
                                payload: index,
                              })
                            }
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                className="btn btn-outline-primary mb-4"
                onClick={addDetalle}
              >
                + Agregar Ítem
              </button>

              <div className="mb-4">
                <label className="form-label fw-bold">
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
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">Observaciones</label>
                <textarea
                  className="form-control"
                  rows={3}
                  maxLength={500}
                  value={state.observaciones}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_OBSERVACIONES",
                      payload: e.target.value,
                    })
                  }
                />
                <small className="text-muted">
                  {state.observaciones.length}/500 caracteres
                </small>
              </div>

              <div className="alert alert-info">
                <h6>Resumen del envío:</h6>
                <p className="mb-0">
                  Peso total:{" "}
                  {state.detalles
                    .reduce((sum, d) => sum + d.pesoKg, 0)
                    .toFixed(2)}{" "}
                  kg
                  <br />
                  Costo total: Bs. {costoTotal.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Paso 4: Pago */}
          {state.step === 4 && (
            <div>
              <h4 className="mb-4">💳 Modalidad de Pago</h4>

              <div className="mb-4">
                <div className="btn-group w-100">
                  <button
                    className={`btn ${state.modalidadPago === "ORIGEN" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() =>
                      dispatch({
                        type: "SET_MODALIDAD_PAGO",
                        payload: "ORIGEN",
                      })
                    }
                  >
                    💰 Pago en origen
                  </button>
                  <button
                    className={`btn ${state.modalidadPago === "DESTINO" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() =>
                      dispatch({
                        type: "SET_MODALIDAD_PAGO",
                        payload: "DESTINO",
                      })
                    }
                  >
                    🎯 Pago en destino
                  </button>
                </div>
              </div>

              {state.modalidadPago === "ORIGEN" && (
                <div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Monto *</label>
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
                    />
                    <small className="text-muted">
                      Costo total: Bs. {costoTotal.toFixed(2)}
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
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
                    <label className="form-label fw-bold">Referencia</label>
                    <input
                      type="text"
                      className="form-control"
                      value={state.pagoReferencia}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PAGO_REFERENCIA",
                          payload: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Fecha de Pago</label>
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
                    />
                  </div>
                </div>
              )}

              <div className="alert alert-success mt-4">
                <h6>Resumen final:</h6>
                <p>
                  <strong>Cliente:</strong> {state.cliente?.nombreRazonSocial}
                </p>
                <p>
                  <strong>Consignatario:</strong> {state.consignatario?.nombres}
                </p>
                <p>
                  <strong>Ruta:</strong>{" "}
                  {profile?.sucursal
                    ? `${profile.sucursal.nombre} — ${profile.sucursal.ciudad || profile.sucursal.direccion || ""}`
                    : profile?.idSucursal
                      ? `Sucursal ${profile.idSucursal}`
                      : "Origen"}{" "}
                  → {state.sucursalDestino?.nombre}
                </p>
                <p>
                  <strong>Costo total:</strong> Bs. {costoTotal.toFixed(2)}
                </p>
                <p>
                  <strong>Modalidad:</strong>{" "}
                  {state.modalidadPago === "ORIGEN"
                    ? "Pago en origen"
                    : "Pago en destino"}
                </p>
              </div>
            </div>
          )}

          {/* Navegación */}
          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-secondary"
              onClick={() =>
                dispatch({ type: "SET_STEP", payload: state.step - 1 })
              }
              disabled={state.step === 1}
            >
              ← Anterior
            </button>
            {state.step < 4 ? (
              <button
                className="btn btn-primary"
                onClick={() =>
                  dispatch({ type: "SET_STEP", payload: state.step + 1 })
                }
                disabled={!canNext()}
              >
                Siguiente →
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={!canNext() || loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Registrando...
                  </>
                ) : (
                  "✅ Confirmar y Registrar"
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
