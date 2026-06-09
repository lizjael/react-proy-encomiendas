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

  const handleNavClick = () => {
    // Cierra el sidebar en mobile al hacer clic en un enlace
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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `d-flex align-items-center gap-2 px-3 py-2 rounded text-decoration-none ${
      isActive ? "bg-primary text-white" : "text-white-50"
    }`;

  const SIDEBAR_WIDTH = 260;

  return (
    <>
      {/* Overlay oscuro — solo en mobile cuando está abierto */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1040,
          }}
          className="d-lg-none"
        />
      )}

      {/* Sidebar */}
      <div
        className="bg-dark d-flex flex-column"
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          minWidth: `${SIDEBAR_WIDTH}px`,
          minHeight: "100vh",
          // En mobile: fixed y se desliza; en desktop: estático (en flujo normal)
          position: undefined, // se controla por clases abajo
          zIndex: 1041,
          // Desktop: siempre visible y estático
          // Mobile: overlay deslizante
        }}
      >
        {/* Usamos un wrapper para manejar mobile vs desktop */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: open ? 0 : `-${SIDEBAR_WIDTH}px`,
            width: `${SIDEBAR_WIDTH}px`,
            height: "100vh",
            backgroundColor: "#212529",
            display: "flex",
            flexDirection: "column",
            zIndex: 1041,
            transition: "left 0.3s ease",
          }}
          className="d-lg-none"
        >
          <SidebarContent
            user={user}
            navLinkClass={navLinkClass}
            handleNavClick={handleNavClick}
            handleLogout={handleLogout}
            getInitials={getInitials}
          />
        </div>

        {/* Desktop: estático, siempre visible */}
        <div
          className="d-none d-lg-flex flex-column bg-dark"
          style={{ width: `${SIDEBAR_WIDTH}px`, minHeight: "100vh" }}
        >
          <SidebarContent
            user={user}
            navLinkClass={navLinkClass}
            handleNavClick={handleNavClick}
            handleLogout={handleLogout}
            getInitials={getInitials}
          />
        </div>
      </div>
    </>
  );
}

// Contenido del sidebar extraído para no duplicar JSX
function SidebarContent({
  user,
  navLinkClass,
  handleNavClick,
  handleLogout,
  getInitials,
}: any) {
  return (
    <>
      {/* Logo */}
      <div className="p-3 border-bottom border-secondary">
        <h3 className="text-white mb-0">📦 GestEnc</h3>
        <small className="text-white-50">Sistema de Encomiendas</small>
      </div>

      {/* Menú */}
      <nav className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
        <div className="mb-4">
          <small className="text-white-50 text-uppercase">Principal</small>
          <div className="mt-2 d-flex flex-column gap-1">
            <NavLink
              to="/dashboard"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              🏠 <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/perfil"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              👤 <span>Mi Perfil</span>
            </NavLink>
          </div>
        </div>

        {(user?.role === "user" ||
          user?.role === "admin" ||
          user?.role === "super_admin") && (
          <div className="mb-4">
            <small className="text-white-50 text-uppercase">Operaciones</small>
            <div className="mt-2 d-flex flex-column gap-1">
              <NavLink
                to="/encomiendas"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                📦 <span>Encomiendas</span>
              </NavLink>
              <NavLink
                to="/pagos"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                💳 <span>Pagos</span>
              </NavLink>
            </div>
          </div>
        )}

        {(user?.role === "admin" || user?.role === "super_admin") && (
          <div className="mb-4">
            <small className="text-white-50 text-uppercase">Gestión</small>
            <div className="mt-2 d-flex flex-column gap-1">
              <NavLink
                to="/clientes"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                👥 <span>Clientes</span>
              </NavLink>
              <NavLink
                to="/consignatarios"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                🤝 <span>Consignatarios</span>
              </NavLink>
              <NavLink
                to="/empleados"
                className={navLinkClass}
                onClick={handleNavClick}
              >
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
              <NavLink
                to="/sucursales"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                🏢 <span>Sucursales</span>
              </NavLink>
            </div>
          </div>
        )}

        {(user?.role === "admin" || user?.role === "super_admin") && (
          <div className="mb-4">
            <small className="text-white-50 text-uppercase">Reportes</small>
            <div className="mt-2 d-flex flex-column gap-1">
              <NavLink
                to="/estadisticas"
                className={navLinkClass}
                onClick={handleNavClick}
              >
                📊 <span>Estadísticas</span>
              </NavLink>
              <NavLink
                to="/reportes"
                className={navLinkClass}
                onClick={handleNavClick}
              >
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
    </>
  );
}
