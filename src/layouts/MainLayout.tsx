import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useState } from "react";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F8F5F0",
      }}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido principal */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          backgroundColor: "#F8F5F0",
        }}
      >
        <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main
          style={{
            flex: 1,
            padding: "1.5rem",
            overflowY: "auto",
            backgroundColor: "#F8F5F0",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
