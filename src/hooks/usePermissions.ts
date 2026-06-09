// src/hooks/usePermissions.ts
import { useAuth } from "./useAuth";

type Module =
  | "clientes"
  | "consignatarios"
  | "sucursales"
  | "encomiendas"
  | "pagos"
  | "empleados"
  | "estadisticas"
  | "reportes";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  const canCreate = (module: Module) => {
    switch (module) {
      case "sucursales":
        return role === "super_admin";
      case "encomiendas":
      case "pagos":
        return role === "user" || role === "admin" || role === "super_admin";
      case "clientes":
      case "consignatarios":
        return role === "admin" || role === "super_admin";
      default:
        return false;
    }
  };

  const canEdit = (module: Module) => {
    switch (module) {
      case "sucursales":
        return role === "super_admin";
      case "encomiendas":
        return role === "user" || role === "admin" || role === "super_admin";
      case "empleados":
        return role === "admin" || role === "super_admin";
      case "clientes":
      case "consignatarios":
        return role === "admin" || role === "super_admin";
      default:
        return false;
    }
  };

  const canDelete = (module: Module) => {
    switch (module) {
      case "sucursales":
      case "encomiendas":
      case "empleados":
        return role === "super_admin";
      case "clientes":
      case "consignatarios":
        return role === "super_admin";
      default:
        return false;
    }
  };

  const canView = (module: Module) => {
    switch (module) {
      case "sucursales":
        return role === "admin" || role === "super_admin";
      case "empleados":
        return role === "admin" || role === "super_admin";
      case "estadisticas":
      case "reportes":
        return role === "admin" || role === "super_admin";
      default:
        return true;
    }
  };

  return { canCreate, canEdit, canDelete, canView };
}
