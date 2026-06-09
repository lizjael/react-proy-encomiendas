// src/layouts/Sidebar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RoleBadge } from "../components/ui/RoleBadge";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none transition ${
      isActive
        ? "bg-primary text-white"
        : "text-white-50 hover-bg-light hover-text-white"
    }`;

  return (
    <>
      {/* Overlay para mobile */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-dark vh-100 position-fixed position-lg-static top-0 start-0 d-flex flex-column ${
          open ? "d-flex" : "d-none d-lg-flex"
        }`}
        style={{
          width: "260px",
          zIndex: 1041,
          transition: "all 0.3s ease",
        }}
      >
        {/* Logo */}
        <div className="p-3 border-bottom border-secondary">
          <h3 className="text-white mb-0">📦 GestEnc</h3>
          <small className="text-white-50">Sistema de Encomiendas</small>
        </div>

        {/* Menú */}
        <nav className="flex-grow-1 p-3">
          <div className="mb-4">
            <small className="text-white-50 text-uppercase">Principal</small>
            <div className="mt-2 d-flex flex-column gap-1">
              <NavLink to="/dashboard" className={navLinkClass}>
                🏠 <span>Dashboard</span>
              </NavLink>
              <NavLink to="/perfil" className={navLinkClass}>
                👤 <span>Mi Perfil</span>
              </NavLink>
            </div>
          </div>

          {(user?.role === "user" ||
            user?.role === "admin" ||
            user?.role === "super_admin") && (
            <div className="mb-4">
              <small className="text-white-50 text-uppercase">
                Operaciones
              </small>
              <div className="mt-2 d-flex flex-column gap-1">
                <NavLink to="/encomiendas" className={navLinkClass}>
                  📦 <span>Encomiendas</span>
                </NavLink>
                <NavLink to="/pagos" className={navLinkClass}>
                  💳 <span>Pagos</span>
                </NavLink>
              </div>
            </div>
          )}

          {(user?.role === "admin" || user?.role === "super_admin") && (
            <div className="mb-4">
              <small className="text-white-50 text-uppercase">Gestión</small>
              <div className="mt-2 d-flex flex-column gap-1">
                <NavLink to="/clientes" className={navLinkClass}>
                  👥 <span>Clientes</span>
                </NavLink>
                <NavLink to="/consignatarios" className={navLinkClass}>
                  🤝 <span>Consignatarios</span>
                </NavLink>
                <NavLink to="/empleados" className={navLinkClass}>
                  👨‍💼 <span>Empleados</span>
                </NavLink>
              </div>
            </div>
          )}

          {user?.role === "super_admin" && (
            <div className="mb-4">
              <small className="text-white-50 text-uppercase">
                Administración
              </small>
              <div className="mt-2 d-flex flex-column gap-1">
                <NavLink to="/sucursales" className={navLinkClass}>
                  🏢 <span>Sucursales</span>
                </NavLink>
              </div>
            </div>
          )}

          {(user?.role === "admin" || user?.role === "super_admin") && (
            <div className="mb-4">
              <small className="text-white-50 text-uppercase">Reportes</small>
              <div className="mt-2 d-flex flex-column gap-1">
                <NavLink to="/estadisticas" className={navLinkClass}>
                  📊 <span>Estadísticas</span>
                </NavLink>
                <NavLink to="/reportes" className={navLinkClass}>
                  📄 <span>Reportes PDF</span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        {/* Usuario activo */}
        {user && (
          <div className="p-3 border-top border-secondary">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: "40px", height: "40px", fontSize: "18px" }}
              >
                {getInitials(user.name)}
              </div>
              <div className="flex-grow-1">
                <div
                  className="text-white fw-semibold"
                  style={{ fontSize: "14px" }}
                >
                  {user.name}
                </div>
                <RoleBadge role={user.role} />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm w-100 mt-2"
            >
              🚪 Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </>
  );
}
