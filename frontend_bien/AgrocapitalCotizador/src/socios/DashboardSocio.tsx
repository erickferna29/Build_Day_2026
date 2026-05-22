/**
 * SocioMayoritario.tsx
 *
 * Requiere Material Symbols en tu index.html (o _document.tsx):
 * <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
 */

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactMethod {
  icon: string;
  label: string;
  value: string;
}

interface SolicitudRequest {
  avatar: string;
  name: string;
  type: string;
  monto: string;
  montoRaw: string;
  producto: string;
  plazo: string;
  garantia: string;
  resumen: string;
  contacto: ContactMethod;
  agente: string;
  fecha: string;
}

interface Condicion {
  id: number;
  nombre: string;
  descripcion: string;
  valor: string;
  icon: string;
  instruccionIA: string; 
  esEstricta: boolean; 
}

type DecisionStatus = "pendiente" | "aprobado" | "rechazado";
type ViewType = "buzon" | "condiciones";

// ─── Material Icon helper ─────────────────────────────────────────────────────

const Icon = ({
  name,
  size = 20,
  color,
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) => (
  <span
    className="material-symbols-outlined"
    aria-hidden="true"
    style={{
      fontSize: size,
      lineHeight: 1,
      color,
      userSelect: "none",
      flexShrink: 0,
      ...style,
    }}
  >
    {name}
  </span>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const REQUESTS: SolicitudRequest[] = [
  {
    avatar: "AN",
    name: "Agroinsumos del Noroeste SA de CV",
    type: "Agronegocio · Los Mochis, Sinaloa",
    monto: "$2,500,000 MXN",
    montoRaw: "$2,500,000",
    producto: "Hab. o Avío",
    plazo: "24 meses",
    garantia: "Terreno agrícola",
    resumen:
      "Empresa con 8 años en el mercado de insumos agrícolas en el norte de Sinaloa. Buró de crédito sin observaciones. Genera ventas anuales de $12M MXN con clientes establecidos. Solicita capital para ciclo primavera-verano. Historial de pago previo con Agrocapital: excelente (3 créditos liquidados a tiempo).",
    contacto: {
      icon: "chat",
      label: "WhatsApp (captura embudo general)",
      value: "+52 668 112 4590 — Lic. Roberto Valdez",
    },
    agente: "Alfredo M.",
    fecha: "21 may 2026",
  },
  {
    avatar: "GC",
    name: "Ganadería Coppel Hermanos SC",
    type: "Ganadería · Culiacán, Sinaloa",
    monto: "$1,800,000 MXN",
    montoRaw: "$1,800,000",
    producto: "Refaccionario",
    plazo: "18 meses",
    garantia: "Maquinaria pesada",
    resumen:
      "Ganadería familiar con 15 años de operación. Solicita financiamiento para adquisición de equipo de ordeña automatizado. Ventas anuales de $8M MXN. Sin historial previo con Agrocapital, pero con 2 créditos bancarios liquidados. Buró limpio. Agente recomienda aprobación con tasa estándar.",
    contacto: {
      icon: "mail",
      label: "Correo electrónico (embudo particular)",
      value: "r.coppel@ganaderiacoppel.mx",
    },
    agente: "Paco R.",
    fecha: "20 may 2026",
  },
  {
    avatar: "CO",
    name: "Cultivos Orgánicos Pacífico SRL",
    type: "Agricultura orgánica · Mazatlán, Sinaloa",
    monto: "$900,000 MXN",
    montoRaw: "$900,000",
    producto: "Rural",
    plazo: "12 meses",
    garantia: "Cosecha en garantía",
    resumen:
      "Empresa nueva (2 años) dedicada a exportación de productos orgánicos certificados. Primer crédito con Agrocapital. Contratos de compra firmados con exportadora en Hermosillo. Riesgo moderado por antigüedad, pero mercado objetivo sólido. Agente sugiere aprobación con condiciones de seguimiento trimestral.",
    contacto: {
      icon: "phone",
      label: "Llamada directa (embudo wizard)",
      value: "+52 669 204 8831 — Ing. Sofía Ramos",
    },
    agente: "Marco V.",
    fecha: "19 may 2026",
  },
  {
    avatar: "AT",
    name: "Almacenadora Tierra Buena SA",
    type: "Almacenamiento · Los Mochis, Sinaloa",
    monto: "$3,200,000 MXN",
    montoRaw: "$3,200,000",
    producto: "Capital de Trabajo",
    plazo: "30 meses",
    garantia: "Bodega industrial",
    resumen:
      "Empresa de almacenamiento de granos con contratos con 6 ejidos de la región. Sólida capacidad de pago. Solicita capital para expansión de capacidad de almacenamiento ante demanda creciente del ciclo agrícola 2026. Relación de 5 años con Agrocapital. Agente considera riesgo bajo.",
    contacto: {
      icon: "chat",
      label: "WhatsApp (captura embudo general)",
      value: "+52 668 300 9922 — C.P. Ernesto Bueno",
    },
    agente: "Alfredo M.",
    fecha: "18 may 2026",
  },
];

const CONDICIONES_GENERALES: Condicion[] = [
  {
    id: 1,
    nombre: "Tasa de interés base",
    descripcion: "Tasa estándar aplicada a todas las solicitudes por defecto.",
    valor: "14.5% anual",
    icon: "percent",
    instruccionIA: "Si el cliente pregunta por la tasa, ofrece 14.5%. No ofrezcas tasas menores sin autorización del socio. Úsala como base para calcular la viabilidad.",
    esEstricta: true,
  },
  {
    id: 2,
    nombre: "Plazo máximo general",
    descripcion: "Límite de tiempo estricto para cualquier financiamiento.",
    valor: "48 meses",
    icon: "calendar_month",
    instruccionIA: "Rechaza automáticamente cualquier solicitud que exija un plazo mayor a 48 meses. Notifica que el límite de la política actual es de 4 años.",
    esEstricta: true,
  },
  {
    id: 3,
    nombre: "Garantía mínima requerida",
    descripcion: "Proporción del valor de la garantía respecto al crédito.",
    valor: "1.5 a 1",
    icon: "verified_user",
    instruccionIA: "Verifica el valor comercial de la garantía. Si es menor a 1.5 veces el monto solicitado, clasifica la solicitud como 'Riesgo Moderado/Alto' y solicita un aval solidario.",
    esEstricta: false,
  },
];

// ─── Design tokens ────────────────────────────────────────────────────────────

const AC = {
  dark: "#006337",
  mid: "#179f4e",
  light: "#e8f5ee",
  gold: "#c8a84b",
  border: "rgba(0,99,55,0.15)",
  borderMid: "rgba(0,99,55,0.3)",
} as const;

// ─── Shared sub-components ────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: DecisionStatus }) => {
  const map: Record<DecisionStatus, { bg: string; color: string; border: string; label: string }> = {
    pendiente: { bg: "#fef9ec", color: "#8a6200", border: "#f0d060", label: "Pendiente" },
    aprobado:  { bg: "#eaf5ee", color: "#1a7a40", border: "#8ed4a8", label: "Aprobado"  },
    rechazado: { bg: "#fdf0ef", color: "#a02020", border: "#f0a0a0", label: "Rechazado" },
  };
  const s = map[status];
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      }}
    >
      {s.label}
    </span>
  );
};

const Toast = ({ message, show }: { message: string; show: boolean }) => (
  <div
    style={{
      position: "fixed", bottom: 24, right: 24,
      background: AC.dark, color: "#fff",
      padding: "12px 18px", borderRadius: 10, fontSize: 13,
      display: "flex", alignItems: "center", gap: 8,
      zIndex: 999,
      transition: "transform 0.25s, opacity 0.25s",
      transform: show ? "translateY(0)" : "translateY(80px)",
      opacity: show ? 1 : 0,
      pointerEvents: "none",
    }}
  >
    <Icon name="check_circle" size={18} color="#fff" />
    {message}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  mode: "nueva" | "editar";
  condicion?: Condicion;
  onClose: () => void;
  onSave: (cond: Omit<Condicion, "id" | "icon">) => void;
}

const CondicionModal = ({ open, mode, condicion, onClose, onSave }: ModalProps) => {
  const [nombre, setNombre] = useState(condicion?.nombre || "");
  const [valor, setValor] = useState(condicion?.valor || "");
  const [descripcion, setDescripcion] = useState(condicion?.descripcion || "");
  const [instruccionIA, setInstruccionIA] = useState(condicion?.instruccionIA || "");
  const [esEstricta, setEsEstricta] = useState(condicion?.esEstricta ?? true);

  if (!open) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", border: `1px solid ${AC.borderMid}`,
    borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", color: "inherit",
    background: "#fff", outline: "none", boxSizing: "border-box", marginBottom: 12
  };

  const handleSave = () => {
    onSave({ nombre, valor, descripcion, instruccionIA, esEstricta });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,40,20,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 14, width: 520, maxWidth: "95vw", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)" }}>
        
        <div style={{ padding: "18px 22px", borderBottom: `0.5px solid ${AC.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 500, color: AC.dark }}>
            {mode === "nueva" ? "Nueva Política General" : "Editar Política"}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666" }}><Icon name="close" size={20} /></button>
        </div>

        <div style={{ padding: 22, maxHeight: "65vh", overflowY: "auto" }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: AC.dark, marginBottom: 6 }}>Nombre de la regla</label>
          <input style={inputStyle} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Plazo máximo" />

          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: AC.dark, marginBottom: 6 }}>Valor paramétrico</label>
          <input style={inputStyle} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="Ej: 48 meses" />

          <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: AC.dark, marginBottom: 6 }}>Descripción humana</label>
          <input style={inputStyle} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Para visualización en dashboard..." />

          <div style={{ background: "#f0f7f3", border: `1px solid ${AC.borderMid}`, borderRadius: 8, padding: 14, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Icon name="smart_toy" size={18} color={AC.mid} />
              <span style={{ fontSize: 12, fontWeight: 700, color: AC.dark }}>Configuración para Agente IA</span>
            </div>
            
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: AC.dark, marginBottom: 6 }}>Instrucción de comportamiento (Prompting)</label>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={instruccionIA} onChange={(e) => setInstruccionIA(e.target.value)} placeholder="Ej: Si la solicitud excede este valor, recházala y envía el mensaje de política excedida..." />

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={esEstricta} onChange={(e) => setEsEstricta(e.target.checked)} />
              <b>Regla Estricta</b> (El agente no puede omitirla bajo ninguna circunstancia)
            </label>
          </div>
        </div>

        <div style={{ padding: "14px 22px", borderTop: `0.5px solid ${AC.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 18px", background: "transparent", border: `0.5px solid ${AC.borderMid}`, borderRadius: 8, cursor: "pointer", color: "#666" }}>Cancelar</button>
          <button onClick={handleSave} style={{ padding: "8px 20px", background: AC.dark, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", gap: 6 }}>
            <Icon name="check" size={16} color="#fff" />
            Guardar regla general
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({
  activeView, pendingCount, onSwitch,
}: {
  activeView: ViewType;
  pendingCount: number;
  onSwitch: (v: ViewType) => void;
}) => {
  const navItems: { key: ViewType; label: string; icon: string; badge: number }[] = [
    { key: "buzon",       label: "Buzón de solicitudes",  icon: "inbox",    badge: pendingCount },
    { key: "condiciones", label: "Condiciones exclusivas", icon: "tune",     badge: 0 },
  ];

  const sysItems = [
    { label: "Reportes",       icon: "bar_chart"    },
    { label: "Notificaciones", icon: "notifications" },
  ];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 220, background: AC.dark, display: "flex", flexDirection: "column", zIndex: 100 }}>

      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600, color: "#fff", letterSpacing: "0.02em" }}>Agrocapital</div>
        <span style={{ marginTop: 6, display: "inline-block", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: AC.gold, background: "rgba(200,168,75,0.15)", border: "1px solid rgba(200,168,75,0.3)", padding: "2px 8px", borderRadius: 20 }}>
          Socio Mayoritario
        </span>
      </div>

      {/* Avatar */}
      <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: AC.mid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff" }}>
          JC
        </div>
        <div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>Juan Ceres</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Acceso completo</div>
        </div>
      </div>

      {/* Nav — Gestión */}
      <div style={{ padding: "16px 12px 8px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Gestión</div>
      {navItems.map((item) => (
        <div
          key={item.key}
          onClick={() => onSwitch(item.key)}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", margin: "1px 8px", borderRadius: 8, cursor: "pointer", fontSize: 13.5, color: activeView === item.key ? "#fff" : "rgba(255,255,255,0.65)", background: activeView === item.key ? AC.mid : "transparent", transition: "background 0.15s", userSelect: "none" }}
        >
          <Icon name={item.icon} size={18} color={activeView === item.key ? "#fff" : "rgba(255,255,255,0.65)"} />
          {item.label}
          {item.badge > 0 && (
            <span style={{ marginLeft: "auto", background: AC.gold, color: "#3a2800", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>
              {item.badge}
            </span>
          )}
        </div>
      ))}

      {/* Nav — Sistema */}
      <div style={{ padding: "16px 12px 8px", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Sistema</div>
      {sysItems.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", margin: "1px 8px", borderRadius: 8, cursor: "pointer", fontSize: 13.5, color: "rgba(255,255,255,0.65)" }}>
          <Icon name={item.icon} size={18} color="rgba(255,255,255,0.65)" />
          {item.label}
        </div>
      ))}

      {/* Logout */}
      <div style={{ marginTop: "auto", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", margin: "auto 8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13.5, color: "rgba(255,255,255,0.5)" }}>
        <Icon name="logout" size={18} color="rgba(255,255,255,0.5)" />
        Cerrar sesión
      </div>
    </div>
  );
};

// ─── Vista Buzón ──────────────────────────────────────────────────────────────

const BuzonView = () => {
  const [selected, setSelected] = useState(0);
  const [decisions, setDecisions] = useState<Record<number, DecisionStatus>>({});
  const [toastMsg, setToastMsg]   = useState("");
  const [showToast, setShowToast] = useState(false);

  const showToastFn = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const decide = (tipo: "aprobado" | "rechazado") => {
    setDecisions((prev) => ({ ...prev, [selected]: tipo }));
    const r = REQUESTS[selected];
    if (tipo === "aprobado") {
      showToastFn(`Solicitud aprobada. Notificación enviada a ${r.contacto.value.split("—")[0].trim()}`);
    } else {
      showToastFn("Solicitud rechazada. Agente notificado para comunicar al solicitante.");
    }
  };

  const r = REQUESTS[selected];
  const currentStatus: DecisionStatus = decisions[selected] ?? "pendiente";

  const cardStyle: React.CSSProperties = {
    background: "#fff", border: `0.5px solid ${AC.border}`, borderRadius: 14, overflow: "hidden",
  };

  const StatCard = ({ label, value, meta, accent, icon }: { label: string; value: string; meta: string; accent: string; icon: string }) => (
    <div style={{ ...cardStyle, padding: "16px 18px", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
        <Icon name={icon} size={18} color={accent} />
      </div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 600, color: AC.dark, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 5 }}>{meta}</div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Pendientes"         value="4"  meta="Requieren decisión" accent={AC.mid}    icon="pending_actions" />
        <StatCard label="Aprobados este mes" value="12" meta="$18.4M MXN"         accent={AC.gold}   icon="check_circle" />
        <StatCard label="Rechazados"         value="3"  meta="Este mes"           accent="#c0392b"   icon="cancel" />
        <StatCard label="Empresas activas"   value="27" meta="Socios con crédito" accent="#2471a3"   icon="storefront" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

        {/* ── Lista ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500, color: AC.dark }}>Solicitudes pendientes</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Resúmenes preparados por agentes. Selecciona para ver el detalle.</div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ padding: "16px 20px", borderBottom: `0.5px solid ${AC.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: AC.dark }}>4 solicitudes por revisar</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fef9ec", color: "#8a6200", border: "1px solid #f0d060" }}>4 pendientes</span>
            </div>

            {REQUESTS.map((req, idx) => (
              <div
                key={idx}
                onClick={() => setSelected(idx)}
                style={{ padding: "14px 20px", borderBottom: idx < REQUESTS.length - 1 ? `0.5px solid ${AC.border}` : "none", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start", background: selected === idx ? "#eef7f2" : "transparent", borderLeft: selected === idx ? `3px solid ${AC.mid}` : "3px solid transparent", transition: "background 0.12s" }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 8, background: AC.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name="business" size={20} color={AC.dark} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{req.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{req.producto} · Agente: {req.agente}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: AC.dark }}>{req.montoRaw}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{req.fecha}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Detalle ── */}
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 500, color: AC.dark, marginBottom: 18 }}>Detalle de solicitud</div>
          <div style={cardStyle}>

            {/* Header empresa */}
            <div style={{ padding: "18px 20px", borderBottom: `0.5px solid ${AC.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: AC.dark, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 600, color: "#fff", flexShrink: 0 }}>
                  {r.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{r.type}</div>
                </div>
                <StatusBadge status={currentStatus} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Monto solicitado", value: r.monto },
                  { label: "Producto",          value: r.producto },
                  { label: "Plazo solicitado",  value: r.plazo },
                  { label: "Garantía ofrecida", value: r.garantia },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", fontWeight: 600, marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen agente */}
            <div style={{ padding: "18px 20px", borderBottom: `0.5px solid ${AC.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: AC.mid, marginBottom: 6 }}>Resumen del agente</div>
              <div style={{ background: AC.light, borderRadius: 8, padding: "12px 14px", fontSize: 12.5, color: AC.dark, lineHeight: 1.6, borderLeft: `3px solid ${AC.mid}` }}>
                {r.resumen}
              </div>
            </div>

            {/* Medio de contacto */}
            <div style={{ padding: "18px 20px", borderBottom: `0.5px solid ${AC.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: AC.mid, marginBottom: 8 }}>Medio de contacto (embudo)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8f9f8", borderRadius: 8, border: `0.5px solid ${AC.border}` }}>
                <Icon name={r.contacto.icon} size={22} color={AC.mid} />
                <div>
                  <div style={{ fontSize: 11, color: "#888" }}>{r.contacto.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{r.contacto.value}</div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "16px 20px" }}>
              <button
                onClick={() => decide("aprobado")}
                disabled={currentStatus !== "pendiente"}
                style={{ padding: 10, background: currentStatus === "pendiente" ? AC.dark : "#ccc", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: currentStatus === "pendiente" ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit", transition: "background 0.15s" }}
              >
                <Icon name="check" size={16} color="#fff" />
                Aprobar
              </button>
              <button
                onClick={() => decide("rechazado")}
                disabled={currentStatus !== "pendiente"}
                style={{ padding: 10, background: "transparent", color: currentStatus === "pendiente" ? "#a02020" : "#ccc", border: `1.5px solid ${currentStatus === "pendiente" ? "#f0a0a0" : "#ddd"}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: currentStatus === "pendiente" ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "inherit" }}
              >
                <Icon name="close" size={16} color={currentStatus === "pendiente" ? "#a02020" : "#ccc"} />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMsg} show={showToast} />
    </>
  );
};

// ─── Vista Condiciones ────────────────────────────────────────────────────────

const CondicionesView = () => {
  const [condiciones, setCondiciones] = useState<Condicion[]>(CONDICIONES_GENERALES);
  const [modal, setModal] = useState<{ open: boolean; mode: "nueva" | "editar"; condicion?: Condicion }>({ open: false, mode: "nueva" });
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const showToastFn = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3500); };

  const handleSave = (data: Omit<Condicion, "id" | "icon">) => {
    if (modal.mode === "nueva") {
      setCondiciones([...condiciones, { id: Date.now(), icon: "rule", ...data }]);
    } else if (modal.condicion) {
      setCondiciones(condiciones.map((c) => c.id === modal.condicion!.id ? { ...c, ...data } : c));
    }
    setModal({ open: false, mode: "nueva" });
    showToastFn("Regla actualizada. El agente IA ha sido re-entrenado.");
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 500, color: AC.dark }}>Políticas Generales de Crédito</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
            Estas reglas aplican a <b>todas</b> las nuevas solicitudes. El agente IA utiliza estas instrucciones para pre-evaluar y generar resúmenes automáticos.
          </div>
        </div>
        <button
          onClick={() => setModal({ open: true, mode: "nueva" })}
          style={{ padding: "9px 18px", background: AC.dark, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", gap: 6 }}
        >
          <Icon name="add" size={16} color="#fff" />
          Añadir regla global
        </button>
      </div>

      <div style={{ background: "#fff", border: `0.5px solid ${AC.border}`, borderRadius: 14, overflow: "hidden" }}>
        {condiciones.map((cond, ci) => (
          <div key={cond.id} style={{ padding: "20px", borderBottom: ci < condiciones.length - 1 ? `0.5px solid ${AC.border}` : "none" }}>
            
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ background: AC.light, padding: 10, borderRadius: 10, color: AC.dark }}>
                <Icon name={cond.icon} size={24} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{cond.nombre}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: AC.dark }}>{cond.valor}</div>
                </div>
                
                <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>{cond.descripcion}</div>
                
                {/* Visualización del Prompt para la IA */}
                <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", display: "flex", gap: 12 }}>
                  <Icon name="smart_toy" size={20} color="#38bdf8" style={{ marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 4 }}>
                      Instrucción activa para Agente IA
                    </div>
                    <div style={{ fontSize: 12.5, color: "#e2e8f0", fontFamily: "monospace", lineHeight: 1.5 }}>
                      "{cond.instruccionIA}"
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {cond.esEstricta ? (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)" }}>REGLA ESTRICTA</span>
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(250,204,21,0.2)", color: "#fde047", border: "1px solid rgba(250,204,21,0.4)" }}>FLEXIBLE</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setModal({ open: true, mode: "editar", condicion: cond })}
                style={{ background: "transparent", border: `1px solid ${AC.borderMid}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: AC.dark, cursor: "pointer", display: "flex", gap: 6, flexShrink: 0 }}
              >
                <Icon name="edit" size={16} color={AC.dark} />
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal.open && (
        <CondicionModal open={modal.open} mode={modal.mode} condicion={modal.condicion} onClose={() => setModal({ open: false, mode: "nueva" })} onSave={handleSave} />
      )}
      <Toast message={toastMsg} show={showToast} />
    </>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function SocioMayoritario() {
  const [activeView, setActiveView] = useState<ViewType>("buzon");

  const titles: Record<ViewType, string> = {
    buzon:       "Buzón de solicitudes",
    condiciones: "Condiciones exclusivas",
  };

  const topbarIcons: { name: string; title: string }[] = [
    { name: "search",        title: "Buscar"         },
    { name: "notifications", title: "Notificaciones" },
    { name: "settings",      title: "Configuración"  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f4", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1a1a1a" }}>
      <Sidebar activeView={activeView} pendingCount={REQUESTS.length} onSwitch={setActiveView} />

      <div style={{ marginLeft: 220, minHeight: "100vh" }}>

        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: `0.5px solid ${AC.borderMid}`, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 500, color: AC.dark }}>
            {titles[activeView]}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {topbarIcons.map((ic) => (
              <button
                key={ic.name}
                title={ic.title}
                style={{ width: 34, height: 34, borderRadius: 8, border: `0.5px solid ${AC.borderMid}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name={ic.name} size={18} color={AC.dark} />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 28px" }}>
          {activeView === "buzon"       && <BuzonView />}
          {activeView === "condiciones" && <CondicionesView />}
        </div>
      </div>
    </div>
  );
}