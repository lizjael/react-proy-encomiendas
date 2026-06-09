// src/layouts/Topbar.tsx
import { useAuth } from "../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getBreadcrumb = () => {
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
    };

    return pages[page] || page.charAt(0).toUpperCase() + page.slice(1);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom px-3 py-2">
      <div className="container-fluid">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-link text-dark d-lg-none p-0"
            onClick={onMenuClick}
            style={{ width: "32px", height: "32px" }}
          >
            ☰
          </button>
          <div>
            <h5 className="mb-0">{getBreadcrumb()}</h5>
            <small className="text-muted">{location.pathname}</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Sucursal actual - placeholder */}
          <div className="d-none d-md-block">
            <small className="text-muted">Sucursal:</small>
            <span className="ms-1 fw-semibold">Central</span>
          </div>

          {/* Dropdown usuario */}
          <div className="dropdown">
            <button
              className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-2 p-0"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div
                className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: "38px", height: "38px", fontSize: "16px" }}
              >
                {user && getInitials(user.name)}
              </div>
              <span className="d-none d-md-block">{user?.name}</span>
            </button>

            {dropdownOpen && (
              <div
                className="dropdown-menu dropdown-menu-end show"
                style={{ position: "absolute", inset: "0px 0px auto auto" }}
              >
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/perfil");
                  }}
                >
                  👤 Mi Perfil
                </button>
                <hr className="dropdown-divider" />
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
