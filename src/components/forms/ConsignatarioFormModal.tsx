import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  createConsignatario,
  updateConsignatario,
} from "../../api/endpoints/consignatarios.api";
import type { Consignatario, CreateConsignatarioDto } from "../../types";
import { User, Phone, X, Save } from "lucide-react";

interface ConsignatarioFormModalProps {
  show: boolean;
  onClose: () => void;
  item?: Consignatario;
  onSaved: () => void;
}

const schema = yup.object({
  nombres: yup
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(100)
    .required("Nombres es requerido"),
  telefono: yup
    .string()
    .matches(/^[0-9]+$/, "Solo números")
    .min(7, "Mínimo 7 dígitos")
    .max(20)
    .required("Teléfono es requerido"),
});

export function ConsignatarioFormModal({
  show,
  onClose,
  item,
  onSaved,
}: ConsignatarioFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateConsignatarioDto>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (item) {
      setValue("nombres", item.nombres);
      setValue("telefono", item.telefono);
    } else {
      reset({ nombres: "", telefono: "" });
    }
  }, [item, setValue, reset]);

  const onSubmit = async (data: CreateConsignatarioDto) => {
    try {
      if (item) {
        await updateConsignatario(item.idConsignatario, data);
        toast.success("Consignatario actualizado correctamente");
      } else {
        await createConsignatario(data);
        toast.success("Consignatario creado correctamente");
      }
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Error al guardar consignatario",
      );
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 1050,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "450px" }}
      >
        <div
          className="modal-content"
          style={{
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            className="modal-header border-0"
            style={{
              backgroundColor: "#1A1A1A",
              padding: "1.25rem 1.5rem",
            }}
          >
            <h5
              className="modal-title fw-semibold"
              style={{
                color: "#FFFFFF",
                fontSize: "1.1rem",
              }}
            >
              {item ? "Editar Consignatario" : "Nuevo Consignatario"}
            </h5>
            <button
              type="button"
              className="btn p-0"
              onClick={onClose}
              style={{ color: "#FFFFFF", opacity: 0.7 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.7";
              }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className="modal-body p-4"
              style={{ backgroundColor: "#F8F5F0" }}
            >
              <div className="mb-3">
                <label
                  className="form-label fw-semibold mb-2"
                  style={{ color: "#374151", fontSize: "0.8rem" }}
                >
                  <User size={14} className="me-1" />
                  Nombres *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Juan Carlos Rodríguez"
                  {...register("nombres")}
                  style={{
                    borderRadius: "10px",
                    borderColor: "#E5E0D8",
                    height: "42px",
                    fontSize: "0.85rem",
                  }}
                />
                {errors.nombres && (
                  <small
                    className="text-danger d-block mt-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {errors.nombres.message}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label
                  className="form-label fw-semibold mb-2"
                  style={{ color: "#374151", fontSize: "0.8rem" }}
                >
                  <Phone size={14} className="me-1" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Ej: 71234567"
                  {...register("telefono")}
                  style={{
                    borderRadius: "10px",
                    borderColor: "#E5E0D8",
                    height: "42px",
                    fontSize: "0.85rem",
                  }}
                />
                {errors.telefono && (
                  <small
                    className="text-danger d-block mt-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {errors.telefono.message}
                  </small>
                )}
              </div>
            </div>

            <div
              className="modal-footer border-0"
              style={{
                backgroundColor: "#FFFFFF",
                padding: "1rem 1.5rem",
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={onClose}
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #E5E0D8",
                  borderRadius: "10px",
                  padding: "0.5rem 1.25rem",
                  color: "#6B7280",
                  fontSize: "0.85rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F8F5F0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn d-flex align-items-center gap-2"
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#8B1A1A",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.5rem 1.25rem",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5C0E0E";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#8B1A1A";
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
