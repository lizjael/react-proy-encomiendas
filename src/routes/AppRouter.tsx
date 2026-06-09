// src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { MainLayout } from "../layouts/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { PerfilPage } from "../pages/perfil/PerfilPage";
import { ClientesPage } from "../pages/clientes/ClientesPage";
import { ConsignatariosPage } from "../pages/consignatarios/ConsignatariosPage";
import { SucursalesPage } from "../pages/sucursales/SucursalesPage";
import { EncomiendasPage } from "../pages/encomiendas/EncomiendasPage";
import { EncomiendaDetalle } from "../pages/encomiendas/EncomiendaDetalle";
import { NuevaEncomiendaWizard } from "../pages/encomiendas/NuevaEncomiendaWizard";
import { PagosPage } from "../pages/pagos/PagosPage";
import { EmpleadosPage } from "../pages/empleados/EmpleadosPage";
import { EstadisticasPage } from "../pages/estadisticas/EstadisticasPage";
import { ReportesPage } from "../pages/reportes/ResportesPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";

function NoAutorizado() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-1 text-danger">🚫</h1>
        <h2 className="mb-3">No tienes permiso</h2>
        <p className="text-muted">Tu rol no tiene acceso a esta sección.</p>
        <a href="/dashboard" className="btn btn-primary mt-2">
          Ir al dashboard
        </a>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Rutas públicas */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
      </Route>

      {/* Rutas protegidas con MainLayout */}
      <Route
        element={
          <ProtectedRoute requiredRoles={["user", "admin", "super_admin"]} />
        }
      >
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/perfil" element={<PerfilPage />} />

          {/* Módulo 3 - CRUDs */}
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/consignatarios" element={<ConsignatariosPage />} />
          <Route path="/sucursales" element={<SucursalesPage />} />

          {/* Módulo 4 - Encomiendas */}
          <Route path="/encomiendas" element={<EncomiendasPage />} />
          <Route
            path="/encomiendas/nueva"
            element={<NuevaEncomiendaWizard />}
          />
          <Route path="/encomiendas/:id" element={<EncomiendaDetalle />} />

          {/* Módulo 4 - Pagos y Empleados */}
          <Route path="/pagos" element={<PagosPage />} />
          <Route path="/empleados" element={<EmpleadosPage />} />

          {/* Reportes */}
          <Route path="/estadisticas" element={<EstadisticasPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
        </Route>
      </Route>

      <Route path="/no-autorizado" element={<NoAutorizado />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
