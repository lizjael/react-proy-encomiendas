// src/components/forms/SucursalFormModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import {
  createSucursal,
  updateSucursal,
} from "../../api/endpoints/sucursales.api";
import type { Sucursal } from "../../types";

interface SucursalFormData {
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  estado: "Activo" | "Inactivo";
}

interface SucursalFormModalProps {
  show: boolean;
  onClose: () => void;
  item?: Sucursal;
  onSaved: () => void;
}

const schema = yup.object({
  nombre: yup.string().required("Nombre es requerido").max(100),
  ciudad: yup.string().required("Ciudad es requerida").max(100),
  direccion: yup.string().required("Dirección es requerida").max(255),
  telefono: yup
    .string()
    .matches(/^[0-9+-]+$/, "Solo números, + y -")
    .required("Teléfono es requerido")
    .max(20),
  estado: yup.string().oneOf(["Activo", "Inactivo"]).required(),
});

export function SucursalFormModal({
  show,
  onClose,
  item,
  onSaved,
}: SucursalFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SucursalFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: "",
      ciudad: "",
      direccion: "",
      telefono: "",
      estado: "Activo",
    },
  });

  useEffect(() => {
    if (item) {
      setValue("nombre", item.nombre);
      setValue("ciudad", item.ciudad ?? "");
      setValue("direccion", item.direccion ?? "");
      setValue("telefono", item.telefono ?? "");
      setValue(
        "estado",
        item.estado === "Activo" || item.estado === "Inactivo"
          ? item.estado
          : "Activo",
      );
    } else {
      reset({
        nombre: "",
        ciudad: "",
        direccion: "",
        telefono: "",
        estado: "Activo",
      });
    }
  }, [item, setValue, reset]);

  const onSubmit = async (data: SucursalFormData) => {
    try {
      if (item) {
        await updateSucursal(item.idSucursal, data);
        toast.success("Sucursal actualizada correctamente");
      } else {
        await createSucursal(data);
        toast.success("Sucursal creada correctamente");
      }
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al guardar sucursal");
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
              {item ? "Editar Sucursal" : "Nueva Sucursal"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("nombre")}
                />
                {errors.nombre && (
                  <small className="text-danger">{errors.nombre.message}</small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Ciudad *</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("ciudad")}
                />
                {errors.ciudad && (
                  <small className="text-danger">{errors.ciudad.message}</small>
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

              {/* Campo Estado - solo visible en edición */}
              {item && (
                <div className="mb-3">
                  <label className="form-label">Estado</label>
                  <select className="form-select" {...register("estado")}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              )}
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
