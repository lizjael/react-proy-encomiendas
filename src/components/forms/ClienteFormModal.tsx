import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { createCliente, updateCliente } from "../../api/endpoints/clientes.api";
import type { Cliente, CreateClienteDto } from "../../types";
import { User, Building2, Phone, MapPin, X, Save } from "lucide-react";

interface ClienteFormModalProps {
  show: boolean;
  onClose: () => void;
  item?: Cliente;
  onSaved: () => void;
}

const normalizeTipoCliente = (
  tipo: string | undefined,
): "NATURAL" | "JURIDICO" => {
  if (!tipo) return "NATURAL";
  const upperTipo = tipo.toUpperCase();
  if (
    upperTipo === "JURIDICO" ||
    upperTipo === "EMPRESA" ||
    upperTipo === "EMPRESARIAL"
  ) {
    return "JURIDICO";
  }
  return "NATURAL";
};

const schema = yup.object({
  tipoCliente: yup
    .string()
    .oneOf(["NATURAL", "JURIDICO"])
    .required("Tipo de cliente es requerido"),
  nombreRazonSocial: yup
    .string()
    .min(2, "Mínimo 2 caracteres")
    .max(200)
    .required("Nombre/Razón social es requerido"),
  ci: yup.string().when("tipoCliente", {
    is: "NATURAL",
    then: (s) => s.required("CI es requerido para persona natural").max(20),
    otherwise: (s) => s.notRequired(),
  }),
  nit: yup.string().when("tipoCliente", {
    is: "JURIDICO",
    then: (s) => s.required("NIT es requerido para persona jurídica").max(20),
    otherwise: (s) => s.notRequired(),
  }),
  telefono: yup
    .string()
    .matches(/^[0-9]+$/, "Solo números")
    .min(7, "Mínimo 7 dígitos")
    .max(20)
    .required("Teléfono es requerido"),
  direccion: yup
    .string()
    .min(5, "Mínimo 5 caracteres")
    .max(255)
    .required("Dirección es requerida"),
});

export function ClienteFormModal({
  show,
  onClose,
  item,
  onSaved,
}: ClienteFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateClienteDto>({
    resolver: yupResolver(schema) as any,
  });

  const tipoCliente = watch("tipoCliente");

  useEffect(() => {
    if (item) {
      setValue("tipoCliente", normalizeTipoCliente(item.tipoCliente));
      setValue("nombreRazonSocial", item.nombreRazonSocial);
      setValue("ci", item.ci ?? "");
      setValue("nit", item.nit ?? "");
      setValue("telefono", item.telefono);
      setValue("direccion", item.direccion);
    } else {
      reset({
        tipoCliente: "NATURAL",
        nombreRazonSocial: "",
        ci: "",
        nit: "",
        telefono: "",
        direccion: "",
      });
    }
  }, [item, setValue, reset]);

  const onSubmit = async (data: CreateClienteDto) => {
    try {
      if (item) {
        await updateCliente(item.idCliente, data);
        toast.success("Cliente actualizado correctamente");
      } else {
        await createCliente(data);
        toast.success("Cliente creado correctamente");
      }
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar cliente");
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
        style={{ maxWidth: "500px" }}
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
              {item ? "Editar Cliente" : "Nuevo Cliente"}
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
                  Tipo de Cliente *
                </label>
                <div className="d-flex gap-3">
                  <label className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      value="NATURAL"
                      {...register("tipoCliente")}
                      style={{ accentColor: "#8B1A1A" }}
                    />
                    <User size={16} color="#6B7280" />
                    <span style={{ fontSize: "0.85rem" }}>Persona Natural</span>
                  </label>
                  <label className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      value="JURIDICO"
                      {...register("tipoCliente")}
                      style={{ accentColor: "#8B1A1A" }}
                    />
                    <Building2 size={16} color="#6B7280" />
                    <span style={{ fontSize: "0.85rem" }}>
                      Empresa / Jurídico
                    </span>
                  </label>
                </div>
                {errors.tipoCliente && (
                  <small
                    className="text-danger d-block mt-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {errors.tipoCliente.message}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label
                  className="form-label fw-semibold mb-2"
                  style={{ color: "#374151", fontSize: "0.8rem" }}
                >
                  Nombre / Razón Social *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    tipoCliente === "NATURAL"
                      ? "Ej: Juan Pérez"
                      : "Ej: Importaciones SRL"
                  }
                  {...register("nombreRazonSocial")}
                  style={{
                    borderRadius: "10px",
                    borderColor: "#E5E0D8",
                    height: "42px",
                    fontSize: "0.85rem",
                  }}
                />
                {errors.nombreRazonSocial && (
                  <small
                    className="text-danger d-block mt-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {errors.nombreRazonSocial.message}
                  </small>
                )}
              </div>

              {tipoCliente === "NATURAL" && (
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold mb-2"
                    style={{ color: "#374151", fontSize: "0.8rem" }}
                  >
                    CI *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: 1234567"
                    {...register("ci")}
                    style={{
                      borderRadius: "10px",
                      borderColor: "#E5E0D8",
                      height: "42px",
                      fontSize: "0.85rem",
                    }}
                  />
                  {errors.ci && (
                    <small
                      className="text-danger d-block mt-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {errors.ci.message}
                    </small>
                  )}
                </div>
              )}

              {tipoCliente === "JURIDICO" && (
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold mb-2"
                    style={{ color: "#374151", fontSize: "0.8rem" }}
                  >
                    NIT *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ej: 123456789"
                    {...register("nit")}
                    style={{
                      borderRadius: "10px",
                      borderColor: "#E5E0D8",
                      height: "42px",
                      fontSize: "0.85rem",
                    }}
                  />
                  {errors.nit && (
                    <small
                      className="text-danger d-block mt-1"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {errors.nit.message}
                    </small>
                  )}
                </div>
              )}

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

              <div className="mb-3">
                <label
                  className="form-label fw-semibold mb-2"
                  style={{ color: "#374151", fontSize: "0.8rem" }}
                >
                  <MapPin size={14} className="me-1" />
                  Dirección *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Av. Libertad #123"
                  {...register("direccion")}
                  style={{
                    borderRadius: "10px",
                    borderColor: "#E5E0D8",
                    height: "42px",
                    fontSize: "0.85rem",
                  }}
                />
                {errors.direccion && (
                  <small
                    className="text-danger d-block mt-1"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {errors.direccion.message}
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
