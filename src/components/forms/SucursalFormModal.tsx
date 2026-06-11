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
  activo: boolean;
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
  activo: yup.boolean().required(), // ✅ incluido en el schema
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
    watch, // ✅ agregar esto
    formState: { errors, isSubmitting },
  } = useForm<SucursalFormData>({
    resolver: yupResolver(schema),
    defaultValues: { activo: true },
  });

  const activoValue = watch("activo");

  useEffect(() => {
    if (item) {
      setValue("nombre", item.nombre);
      setValue("ciudad", item.ciudad ?? "");
      setValue("direccion", item.direccion ?? "");
      setValue("telefono", item.telefono ?? "");
      setValue("activo", item.activo ?? true); // ✅ cargar estado actual
    } else {
      reset({
        nombre: "",
        ciudad: "",
        direccion: "",
        telefono: "",
        activo: true,
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
              {/* ✅ campo activo — solo visible al editar */}
              {item && (
                <div className="mb-3">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-select"
                    value={activoValue ? "true" : "false"}
                    onChange={(e) =>
                      setValue("activo", e.target.value === "true")
                    }
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
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
