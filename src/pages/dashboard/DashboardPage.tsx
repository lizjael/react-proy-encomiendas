// src/pages/dashboard/DashboardPage.tsx (wrapper)
import { useAuth } from "../../hooks/useAuth";
import { DashboardEmpleado } from "./DashboardEmpleado";
import { DashboardAdmin } from "./DashboardAdmin";
import { DashboardSuperAdmin } from "./DashboardSuperAdmin";

export function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === "super_admin") {
    return <DashboardSuperAdmin />;
  }

  if (user?.role === "admin") {
    return <DashboardAdmin />;
  }

  return <DashboardEmpleado />;
}
