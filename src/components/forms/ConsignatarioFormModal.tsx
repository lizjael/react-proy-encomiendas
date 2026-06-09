// src/components/forms/ConsignatarioFormModal.tsx
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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {item ? "Editar Consignatario" : "Nuevo Consignatario"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Nombres *</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("nombres")}
                />
                {errors.nombres && (
                  <small className="text-danger">
                    {errors.nombres.message}
                  </small>
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
