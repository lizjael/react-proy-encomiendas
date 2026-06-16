// src/utils/pdfGenerator.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Encomienda, Pago } from "../types";

// Utilidad: convierte cualquier valor a número seguro para toFixed()
const n = (val: unknown): number => {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

export function generarFacturaEncomienda(encomienda: Encomienda) {
  const doc = new jsPDF();
  const hoy = new Date().toLocaleDateString("es-ES");

  // ── Encabezado ──
  doc.setFontSize(20);
  doc.text("GESTENC", 14, 20);
  doc.setFontSize(10);
  doc.text("Sistema de Gestión de Encomiendas", 14, 28);
  doc.text(`Fecha: ${hoy}`, 14, 36);
  doc.text(`Factura: ${encomienda.nroGuia}`, 14, 44);

  doc.line(14, 50, 196, 50);

  // ── Remitente ──
  doc.setFontSize(12);
  doc.text("DATOS DEL REMITENTE", 14, 60);
  doc.setFontSize(10);
  doc.text(`Nombre: ${encomienda.cliente?.nombreRazonSocial || "N/A"}`, 14, 68);
  doc.text(
    `Documento: ${
      encomienda.cliente?.tipoCliente === "NATURAL"
        ? `CI: ${encomienda.cliente?.ci ?? "N/A"}`
        : `NIT: ${encomienda.cliente?.nit ?? "N/A"}`
    }`,
    14,
    76,
  );
  doc.text(`Teléfono: ${encomienda.cliente?.telefono || "N/A"}`, 14, 84);
  doc.text(`Dirección: ${encomienda.cliente?.direccion || "N/A"}`, 14, 92);

  // ── Destinatario ──
  doc.setFontSize(12);
  doc.text("DATOS DEL DESTINATARIO", 14, 104);
  doc.setFontSize(10);
  doc.text(`Nombre: ${encomienda.consignatario?.nombres || "N/A"}`, 14, 112);
  doc.text(`Teléfono: ${encomienda.consignatario?.telefono || "N/A"}`, 14, 120);

  // ── Ruta ──
  doc.setFontSize(12);
  doc.text("RUTA DE ENVÍO", 14, 132);
  doc.setFontSize(10);
  doc.text(
    `Origen: ${encomienda.sucursalOrigen?.nombre || "N/A"} - ${encomienda.sucursalOrigen?.ciudad || "N/A"}`,
    14,
    140,
  );
  doc.text(
    `Destino: ${encomienda.sucursalDestino?.nombre || "N/A"} - ${encomienda.sucursalDestino?.ciudad || "N/A"}`,
    14,
    148,
  );

  // ── Tabla de ítems ──
  // ✅ Todos los valores numéricos pasan por n() antes de toFixed()
  const tableData =
    encomienda.detalles?.map((d) => [
      d.descripcion || "-",
      String(n(d.cantidad)),
      `${n(d.pesoKg).toFixed(2)} kg`,
      `Bs. ${n(d.costoFlete).toFixed(2)}`,
      `Bs. ${(n(d.cantidad) * n(d.costoFlete)).toFixed(2)}`,
    ]) || [];

  autoTable(doc, {
    startY: 160,
    head: [["Descripción", "Cant.", "Peso", "Costo Unit.", "Subtotal"]],
    body: tableData,
    foot: [
      [
        {
          content: "TOTAL",
          colSpan: 4,
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: `Bs. ${n(encomienda.costoTotal).toFixed(2)}`,
          styles: { fontStyle: "bold" },
        },
      ],
    ],
  });

  // ── Información de pago ──
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("INFORMACIÓN DE PAGO", 14, finalY);
  doc.setFontSize(10);
  const pagoCompletado = encomienda.pagos?.find(
    (p) => p.estado === "COMPLETADO",
  );
  if (pagoCompletado) {
    doc.text(
      `Monto: Bs. ${n(pagoCompletado.monto).toFixed(2)}`,
      14,
      finalY + 8,
    );
    doc.text(
      `Método: ${pagoCompletado.metodoPago.replace(/_/g, " ")}`,
      14,
      finalY + 16,
    );
    doc.text(
      `Fecha: ${new Date(pagoCompletado.fecha).toLocaleDateString()}`,
      14,
      finalY + 24,
    );
    if (pagoCompletado.referencia) {
      doc.text(`Referencia: ${pagoCompletado.referencia}`, 14, finalY + 32);
    }
  } else {
    doc.text("Pendiente de pago", 14, finalY + 8);
  }

  doc.text(`Estado de entrega: ${encomienda.estadoEntrega}`, 14, finalY + 48);
  doc.text(
    `Fecha límite: ${new Date(encomienda.fechaLimiteEntrega).toLocaleDateString()}`,
    14,
    finalY + 56,
  );

  // ── Pie de página ──
  doc.setFontSize(8);
  doc.text("Gracias por preferirnos", 14, 280);
  doc.text(`Documento generado el ${hoy}`, 14, 288);

  doc.save(`factura-${encomienda.nroGuia}.pdf`);
}

export function generarReporteEncomiendas(
  encomiendas: Encomienda[],
  filtros: {
    desde?: string;
    hasta?: string;
    sucursal?: string;
    estado?: string;
  },
) {
  const doc = new jsPDF();
  const hoy = new Date().toLocaleDateString("es-ES");
  const usuario = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).name
    : "Usuario";

  doc.setFontSize(20);
  doc.text("GESTENC", 14, 20);
  doc.setFontSize(14);
  doc.text("Reporte de Encomiendas", 14, 35);
  doc.setFontSize(10);
  doc.text(`Generado por: ${usuario}`, 14, 45);
  doc.text(`Fecha: ${hoy}`, 14, 53);

  if (filtros.desde || filtros.hasta) {
    doc.text(
      `Período: ${filtros.desde || "inicio"} al ${filtros.hasta || "actual"}`,
      14,
      61,
    );
  }
  if (filtros.sucursal) doc.text(`Sucursal: ${filtros.sucursal}`, 14, 69);
  if (filtros.estado) doc.text(`Estado: ${filtros.estado}`, 14, 77);

  doc.line(14, 85, 196, 85);

  const tableData = encomiendas.map((e) => [
    e.nroGuia,
    e.cliente?.nombreRazonSocial || "N/A",
    e.consignatario?.nombres || "N/A",
    e.estadoEntrega,
    e.estadoPago,
    `Bs. ${n(e.costoTotal).toFixed(2)}`,
    new Date(e.fechaEmision).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 90,
    head: [
      [
        "Nro. Guía",
        "Cliente",
        "Destinatario",
        "Estado Entrega",
        "Estado Pago",
        "Costo",
        "Fecha",
      ],
    ],
    body: tableData,
    foot: [
      [
        {
          content: `TOTAL: ${encomiendas.length} encomiendas`,
          colSpan: 5,
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: `Bs. ${encomiendas.reduce((sum, e) => sum + n(e.costoTotal), 0).toFixed(2)}`,
          styles: { fontStyle: "bold" },
        },
        { content: "", styles: { fontStyle: "bold" } },
      ],
    ],
  });

  doc.save(`reporte-encomiendas-${new Date().toISOString().split("T")[0]}.pdf`);
}

export function generarReportePagos(
  pagos: Pago[],
  filtros: { desde?: string; hasta?: string; metodo?: string; estado?: string },
) {
  const doc = new jsPDF();
  const hoy = new Date().toLocaleDateString("es-ES");
  const usuario = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!).name
    : "Usuario";

  doc.setFontSize(20);
  doc.text("GESTENC", 14, 20);
  doc.setFontSize(14);
  doc.text("Reporte de Pagos", 14, 35);
  doc.setFontSize(10);
  doc.text(`Generado por: ${usuario}`, 14, 45);
  doc.text(`Fecha: ${hoy}`, 14, 53);

  if (filtros.desde || filtros.hasta) {
    doc.text(
      `Período: ${filtros.desde || "inicio"} al ${filtros.hasta || "actual"}`,
      14,
      61,
    );
  }
  if (filtros.metodo)
    doc.text(`Método: ${filtros.metodo.replace(/_/g, " ")}`, 14, 69);
  if (filtros.estado && filtros.estado !== "TODOS")
    doc.text(`Estado: ${filtros.estado}`, 14, 77);

  doc.line(14, 85, 196, 85);

  const tableData = pagos.map((p) => [
    p.idPago.toString(),
    p.idEncomienda.toString(),
    `Bs. ${n(p.monto).toFixed(2)}`,
    p.metodoPago.replace(/_/g, " "),
    p.referencia || "-",
    p.estado,
    new Date(p.fecha).toLocaleDateString(),
  ]);

  const totalRecaudado = pagos
    .filter((p) => p.estado === "COMPLETADO")
    .reduce((sum, p) => sum + n(p.monto), 0);

  autoTable(doc, {
    startY: 90,
    head: [
      ["ID", "Encomienda", "Monto", "Método", "Referencia", "Estado", "Fecha"],
    ],
    body: tableData,
    foot: [
      [
        {
          content: `TOTAL PAGOS: ${pagos.length}`,
          colSpan: 2,
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: `Bs. ${totalRecaudado.toFixed(2)}`,
          styles: { fontStyle: "bold" },
        },
        { content: "", colSpan: 4, styles: { fontStyle: "bold" } },
      ],
    ],
  });

  doc.save(`reporte-pagos-${new Date().toISOString().split("T")[0]}.pdf`);
}
