import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  MapPin,
  Menu,
  UserCircle,
  LogOut,
} from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split("/").filter((seg) => seg);

    if (segments.length === 0) return "Dashboard";

    const page = segments[0];
    const pages: Record<string, string> = {
      dashboard: "Dashboard",
      perfil: "Mi Perfil",
      encomiendas: "Encomiendas",
      pagos: "Pagos",
      clientes: "Clientes",
      consignatarios: "Consignatarios",
      empleados: "Empleados",
      sucursales: "Sucursales",
      estadisticas: "Estadísticas",
      reportes: "Reportes",
      configuracion: "Configuración",
    };

    return pages[page] || page.charAt(0).toUpperCase() + page.slice(1);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="d-flex align-items-center justify-content-between px-3 px-md-4"
      style={{
        backgroundColor: "#FFFFFF",
        height: "60px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderBottom: "1px solid #E5E0D8",
      }}
    >
      {/* Izquierda: botón hamburguesa + breadcrumb */}
      <div className="d-flex align-items-center gap-3">
        <button
          onClick={onMenuClick}
          className="d-lg-none btn p-0"
          style={{ color: "#1A1A1A", width: "32px", height: "32px" }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h5
            className="mb-0 fw-semibold"
            style={{
              color: "#1A1A1A",
              fontSize: "1.1rem",
              letterSpacing: "-0.2px",
            }}
          >
            {getPageTitle()}
          </h5>
        </div>
      </div>

      {/* Derecha: sucursal, notificaciones, usuario */}
      <div className="d-flex align-items-center gap-3 gap-md-4">
        {/* Badge de sucursal */}
        <div
          className="d-none d-sm-flex align-items-center gap-2 px-3 py-1 rounded-3"
          style={{
            backgroundColor: "#F8F5F0",
            border: "1px solid #E5E0D8",
          }}
        >
          <MapPin size={14} color="#D4A017" />
          <span style={{ fontSize: "0.8rem", color: "#2D2D2D" }}>
            Sucursal: <strong>Central</strong>
          </span>
        </div>

        {/* Notificaciones */}
        <div ref={notifDropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="btn p-0 position-relative"
            style={{
              backgroundColor: "transparent",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F8F5F0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Bell size={20} color="#2D2D2D" />
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-circle"
              style={{
                backgroundColor: "#8B1A1A",
                fontSize: "9px",
                padding: "2px 5px",
                marginTop: "-4px",
                marginLeft: "-10px",
              }}
            >
              3
            </span>
          </button>

          {notifDropdownOpen && (
            <div
              className="dropdown-menu show"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                minWidth: "280px",
                borderRadius: "12px",
                border: "1px solid #E5E0D8",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                padding: "0",
              }}
            >
              <div
                className="p-3 border-bottom"
                style={{ borderColor: "#E5E0D8" }}
              >
                <strong style={{ color: "#1A1A1A" }}>Notificaciones</strong>
              </div>
              <div
                className="p-3 text-center"
                style={{ color: "#6B7280", fontSize: "0.85rem" }}
              >
                No hay notificaciones nuevas
              </div>
            </div>
          )}
        </div>

        {/* Dropdown de usuario */}
        <div ref={userDropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="d-flex align-items-center gap-2 btn p-0"
            style={{ backgroundColor: "transparent" }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "38px",
                height: "38px",
                backgroundColor: "#8B1A1A",
                fontSize: "14px",
                fontWeight: 600,
                color: "#FFFFFF",
              }}
            >
              {user && getInitials(user.name)}
            </div>
            <div className="d-none d-md-block text-start">
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "#1A1A1A",
                }}
              >
                {user?.name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>
                {user?.role === "super_admin"
                  ? "Super Admin"
                  : user?.role === "admin"
                    ? "Administrador"
                    : "Empleado"}
              </div>
            </div>
            <ChevronDown
              size={16}
              color="#6B7280"
              className="d-none d-md-block"
            />
          </button>

          {userDropdownOpen && (
            <div
              className="dropdown-menu show"
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                minWidth: "200px",
                borderRadius: "12px",
                border: "1px solid #E5E0D8",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                padding: "0.5rem 0",
              }}
            >
              <button
                className="dropdown-item d-flex align-items-center gap-2 py-2"
                onClick={() => {
                  setUserDropdownOpen(false);
                  navigate("/perfil");
                }}
                style={{ fontSize: "0.85rem" }}
              >
                <UserCircle size={16} />
                Mi Perfil
              </button>
              <hr className="dropdown-divider my-1" />
              <button
                className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                onClick={handleLogout}
                style={{ fontSize: "0.85rem" }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
