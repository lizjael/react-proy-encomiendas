// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useState } from "react";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal — ocupa el resto del ancho */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0, // evita overflow horizontal
          marginLeft: 0,
        }}
      >
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main
          className="bg-light"
          style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
