import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RoleBadge } from "../components/ui/RoleBadge";
import {
  Package,
  LayoutDashboard,
  UserCircle,
  Package as PackageIcon,
  CreditCard,
  Users,
  Handshake,
  Building2,
  BarChart2,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";

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

  const handleNavClick = () => {
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const SIDEBAR_WIDTH = 260;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `d-flex align-items-center gap-3 px-3 py-2 text-decoration-none transition-all ${
      isActive
        ? "active-nav-link text-white"
        : "inactive-nav-link text-secondary"
    }`;

  const SidebarContentComponent = () => (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: "#1A1A1A" }}
    >
      {/* Logo */}
      <div className="px-3 pt-4 pb-3 mb-3">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Package size={28} color="#D4A017" strokeWidth={1.8} />
          <span
            className="fw-bold"
            style={{
              color: "#FFFFFF",
              fontSize: "1.25rem",
              letterSpacing: "-0.3px",
            }}
          >
            Expreso Tupiza
          </span>
        </div>
        <div
          className="small"
          style={{
            color: "#9CA3AF",
            fontSize: "0.7rem",
            letterSpacing: "0.3px",
          }}
        >
          SISTEMA DE ENCOMIENDAS
        </div>
      </div>

      {/* Menú */}
      <nav className="flex-grow-1 px-2" style={{ overflowY: "auto" }}>
        {/* Sección Principal */}
        <div className="mb-4">
          <div
            className="small text-uppercase px-3 mb-2"
            style={{
              color: "#6B7280",
              fontSize: "0.65rem",
              letterSpacing: "0.5px",
            }}
          >
            Principal
          </div>
          <div className="d-flex flex-column gap-1">
            <NavLink
              to="/dashboard"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/perfil"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <UserCircle size={18} />
              <span>Mi Perfil</span>
            </NavLink>
          </div>
        </div>

        {/* Sección Operaciones */}
        {(user?.role === "user" ||
          user?.role === "admin" ||
          user?.role === "super_admin") && (
          <div className="mb-4">
            <div
              className="small text-uppercase px-3 mb-2"
              style={{
                color: "#6B7280",
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
              }}
            >
              Operaciones
            </div>
            <div className="d-flex flex-column gap-1">
              <NavLink
                to="/encomiendas"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <PackageIcon size={18} />
                <span>Encomiendas</span>
              </NavLink>
              <NavLink
                to="/pagos"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <CreditCard size={18} />
                <span>Pagos</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Sección Gestión */}
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <div className="mb-4">
            <div
              className="small text-uppercase px-3 mb-2"
              style={{
                color: "#6B7280",
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
              }}
            >
              Gestión
            </div>
            <div className="d-flex flex-column gap-1">
              <NavLink
                to="/clientes"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <Users size={18} />
                <span>Clientes</span>
              </NavLink>
              <NavLink
                to="/consignatarios"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <Handshake size={18} />
                <span>Consignatarios</span>
              </NavLink>
              <NavLink
                to="/empleados"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <Users size={18} />
                <span>Empleados</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Sección Administración */}
        {user?.role === "super_admin" && (
          <div className="mb-4">
            <div
              className="small text-uppercase px-3 mb-2"
              style={{
                color: "#6B7280",
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
              }}
            >
              Administración
            </div>
            <div className="d-flex flex-column gap-1">
              <NavLink
                to="/sucursales"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <Building2 size={18} />
                <span>Sucursales</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Sección Reportes */}
        {(user?.role === "admin" || user?.role === "super_admin") && (
          <div className="mb-4">
            <div
              className="small text-uppercase px-3 mb-2"
              style={{
                color: "#6B7280",
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
              }}
            >
              Reportes
            </div>
            <div className="d-flex flex-column gap-1">
              <NavLink
                to="/estadisticas"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <BarChart2 size={18} />
                <span>Estadísticas</span>
              </NavLink>
              <NavLink
                to="/reportes"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <FileText size={18} />
                <span>Reportes PDF</span>
              </NavLink>
            </div>
          </div>
        )}

        {/* Sección Sistema (opcional) */}
        {user?.role === "super_admin" && (
          <div className="mb-4">
            <div
              className="small text-uppercase px-3 mb-2"
              style={{
                color: "#6B7280",
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
              }}
            >
              Sistema
            </div>
            <div className="d-flex flex-column gap-1">
              <NavLink
                to="/configuracion"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                <Settings size={18} />
                <span>Configuración</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Usuario activo */}
      {user && (
        <div className="p-3 mt-auto" style={{ borderTop: "1px solid #2A2A2A" }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#8B1A1A",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              {getInitials(user.name)}
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div
                className="fw-semibold text-truncate"
                style={{ color: "#FFFFFF", fontSize: "0.85rem" }}
              >
                {user.name}
              </div>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #374151",
              color: "#9CA3AF",
              fontSize: "0.85rem",
              padding: "0.5rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2A2A2A";
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.borderColor = "#8B1A1A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#9CA3AF";
              e.currentTarget.style.borderColor = "#374151";
            }}
          >
            <LogOut size={16} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Overlay oscuro — solo en mobile cuando está abierto */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1040,
          }}
          className="d-lg-none"
        />
      )}

      {/* Mobile: sidebar deslizante */}
      <div
        className="d-lg-none"
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : `-${SIDEBAR_WIDTH}px`,
          width: `${SIDEBAR_WIDTH}px`,
          height: "100vh",
          zIndex: 1041,
          transition: "left 0.3s ease",
          boxShadow: open ? "2px 0 8px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <SidebarContentComponent />
      </div>

      {/* Desktop: sidebar fijo */}
      <div
        className="d-none d-lg-flex flex-shrink-0"
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        <SidebarContentComponent />
      </div>

      <style>{`
        .active-nav-link {
          background-color: #8B1A1A !important;
          border-left: 3px solid #D4A017 !important;
          font-weight: 500;
        }
        .inactive-nav-link {
          color: #9CA3AF !important;
        }
        .inactive-nav-link:hover {
          background-color: #2A2A2A !important;
          color: #FFFFFF !important;
        }
        .transition-all {
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  );
}
