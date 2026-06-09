// src/components/forms/ClienteSearchInput.tsx
import { useState, useEffect, useRef } from "react";
import { getAllClientes } from "../../api/endpoints/clientes.api";
import type { Cliente } from "../../types";

interface ClienteSearchInputProps {
  onSelect: (cliente: Cliente) => void;
  placeholder?: string;
  className?: string;
}

export function ClienteSearchInput({
  onSelect,
  placeholder = "Buscar cliente por CI, NIT o nombre...",
  className = "",
}: ClienteSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes([]);
      setShowDropdown(false);
      return;
    }

    const filtered = clientes.filter((cliente) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (cliente.ci && cliente.ci.toLowerCase().includes(searchLower)) ||
        (cliente.nit && cliente.nit.toLowerCase().includes(searchLower)) ||
        cliente.nombreRazonSocial.toLowerCase().includes(searchLower)
      );
    });
    setFilteredClientes(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await getAllClientes();
      setClientes(data.filter((c) => !c.eliminadoEn));
    } catch (error) {
      console.error("Error loading clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (cliente: Cliente) => {
    setSearchTerm(cliente.nombreRazonSocial);
    setShowDropdown(false);
    onSelect(cliente);
  };

  return (
    <div ref={wrapperRef} className={`position-relative ${className}`}>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchTerm.trim() && setShowDropdown(true)}
      />
      {loading && (
        <div className="position-absolute end-0 top-0 me-3 mt-2">
          <div className="spinner-border spinner-border-sm text-primary" />
        </div>
      )}
      {showDropdown && filteredClientes.length > 0 && (
        <div
          className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
          style={{ zIndex: 1000, maxHeight: "300px", overflowY: "auto" }}
        >
          {filteredClientes.map((cliente) => (
            <button
              key={cliente.idCliente}
              className="dropdown-item text-start"
              onClick={() => handleSelect(cliente)}
              style={{ whiteSpace: "normal" }}
            >
              <div className="fw-semibold">{cliente.nombreRazonSocial}</div>
              <small className="text-muted">
                {cliente.tipoCliente === "NATURAL"
                  ? `CI: ${cliente.ci}`
                  : `NIT: ${cliente.nit}`}{" "}
                | Tel: {cliente.telefono}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
