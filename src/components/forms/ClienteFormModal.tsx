// src/components/forms/ClienteFormModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { createCliente, updateCliente } from "../../api/endpoints/clientes.api";
import type { Cliente, CreateClienteDto } from "../../types";

interface ClienteFormModalProps {
  show: boolean;
  onClose: () => void;
  item?: Cliente;
  onSaved: () => void;
}

// Función helper para normalizar el tipo de cliente
const normalizeTipoCliente = (
  tipo: string | undefined,
): "NATURAL" | "JURIDICO" => {
  if (!tipo) return "NATURAL";
  const upperTipo = tipo.toUpperCase();
  // Si es empresa/jurídico, retornar "JURIDICO", si no "NATURAL"
  if (
    upperTipo === "JURIDICO" ||
    upperTipo === "EMPRESA" ||
    upperTipo === "EMPRESARIAL"
  ) {
    return "JURIDICO";
  }
  // Cualquier otro valor (NATURAL, persona, etc.) se considera persona natural
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
    formState: { errors, isSubmitting },
  } = useForm<CreateClienteDto>({
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    if (item) {
      // Normalizar el tipoCliente antes de asignarlo
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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {item ? "Editar Cliente" : "Nuevo Cliente"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Tipo de Cliente *</label>
                <select className="form-control" {...register("tipoCliente")}>
                  <option value="NATURAL">Persona Natural</option>
                  <option value="JURIDICO">Empresa / Jurídico</option>
                </select>
                {errors.tipoCliente && (
                  <small className="text-danger">
                    {errors.tipoCliente.message}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Nombre / Razón Social *</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("nombreRazonSocial")}
                />
                {errors.nombreRazonSocial && (
                  <small className="text-danger">
                    {errors.nombreRazonSocial.message}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  {item && normalizeTipoCliente(item.tipoCliente) === "NATURAL"
                    ? "CI *"
                    : "CI"}
                </label>
                <input
                  type="text"
                  className="form-control"
                  {...register("ci")}
                />
                {errors.ci && (
                  <small className="text-danger">{errors.ci.message}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  {item && normalizeTipoCliente(item.tipoCliente) === "JURIDICO"
                    ? "NIT *"
                    : "NIT"}
                </label>
                <input
                  type="text"
                  className="form-control"
                  {...register("nit")}
                />
                {errors.nit && (
                  <small className="text-danger">{errors.nit.message}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono *</label>
                <input
                  type="tel"
                  className="form-control"
                  {...register("telefono")}
                />
                {errors.telefono && (
                  <small className="text-danger">
                    {errors.telefono.message}
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Dirección *</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("direccion")}
                />
                {errors.direccion && (
                  <small className="text-danger">
                    {errors.direccion.message}
                  </small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
