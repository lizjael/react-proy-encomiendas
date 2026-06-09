// src/components/forms/ConsignatarioSearchInput.tsx
import { useState, useEffect, useRef } from "react";
import { getAllConsignatarios } from "../../api/endpoints/consignatarios.api";
import type { Consignatario } from "../../types";

interface ConsignatarioSearchInputProps {
  onSelect: (consignatario: Consignatario) => void;
  placeholder?: string;
  className?: string;
}

export function ConsignatarioSearchInput({
  onSelect,
  placeholder = "Buscar consignatario por nombre o teléfono...",
  className = "",
}: ConsignatarioSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [consignatarios, setConsignatarios] = useState<Consignatario[]>([]);
  const [filteredConsignatarios, setFilteredConsignatarios] = useState<
    Consignatario[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConsignatarios();
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
      setFilteredConsignatarios([]);
      setShowDropdown(false);
      return;
    }

    const filtered = consignatarios.filter((consignatario) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        consignatario.nombres.toLowerCase().includes(searchLower) ||
        consignatario.telefono.includes(searchTerm)
      );
    });
    setFilteredConsignatarios(filtered);
    setShowDropdown(filtered.length > 0);
  }, [searchTerm, consignatarios]);

  const loadConsignatarios = async () => {
    setLoading(true);
    try {
      const data = await getAllConsignatarios();
      setConsignatarios(data.filter((c) => !c.eliminadoEn));
    } catch (error) {
      console.error("Error loading consignatarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (consignatario: Consignatario) => {
    setSearchTerm(consignatario.nombres);
    setShowDropdown(false);
    onSelect(consignatario);
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
      {showDropdown && filteredConsignatarios.length > 0 && (
        <div
          className="position-absolute w-100 mt-1 bg-white border rounded shadow-sm"
          style={{ zIndex: 1000, maxHeight: "300px", overflowY: "auto" }}
        >
          {filteredConsignatarios.map((consignatario) => (
            <button
              key={consignatario.idConsignatario}
              className="dropdown-item text-start"
              onClick={() => handleSelect(consignatario)}
              style={{ whiteSpace: "normal" }}
            >
              <div className="fw-semibold">{consignatario.nombres}</div>
              <small className="text-muted">
                Tel: {consignatario.telefono}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
