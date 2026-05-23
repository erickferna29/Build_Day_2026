import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SocioMayoritario from "./socios/DashboardSocio";
import AsistenteFAQ from "./AsistenteFAQ";

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep =
  | "sector"
  | "subsector"
  | "empresa"
  | "financiero"
  | "garantias"
  | "contacto"
  | "analisis"
  | "resultado";

interface WizardData {
  sector?: string;
  subsector?: string;
  tipoEmpresa?: string;
  antiguedad?: string;
  capitalSocial?: string;
  carteraVencida?: string;
  rentabilidad?: string;
  burocredito?: string;
  pld?: string;
  garantias?: string[];
  nombre?: string;
  correo?: string;
  telefono?: string;
  redesSociales?: string[];
  medioContacto?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTORES = [
  { id: "agricultura", label: "Agricultura", icon: "grass" },
  { id: "ganaderia", label: "Ganadería", icon: "pets" },
  { id: "acuacultura", label: "Acuacultura", icon: "water" },
  { id: "agroindustria", label: "Agroindustria", icon: "factory" },
  { id: "comercializacion", label: "Comercialización Agro", icon: "storefront" },
  { id: "servicios", label: "Servicios Rurales", icon: "agriculture" },
];

const SUBSECTORES: Record<string, { id: string; label: string; icon: string }[]> = {
  agricultura: [
    { id: "granos", label: "Granos y cereales", icon: "grain" },
    { id: "hortalizas", label: "Hortalizas y frutas", icon: "eco" },
    { id: "organicos", label: "Orgánicos certificados", icon: "spa" },
    { id: "forrajes", label: "Forrajes y pastizales", icon: "yard" },
  ],
  ganaderia: [
    { id: "bovino", label: "Bovino carne / leche", icon: "local_dining" },
    { id: "porcino", label: "Porcino", icon: "local_dining" },
    { id: "aves", label: "Avicultura", icon: "egg" },
    { id: "apicultura", label: "Apicultura", icon: "hive" },
  ],
  acuacultura: [
    { id: "camaron", label: "Camarón y crustáceos", icon: "set_meal" },
    { id: "tilapia", label: "Tilapia y especies dulces", icon: "phishing" },
    { id: "ostras", label: "Ostras y moluscos", icon: "water" },
  ],
  agroindustria: [
    { id: "procesamiento", label: "Procesamiento de alimentos", icon: "blender" },
    { id: "almacenamiento", label: "Almacenamiento y silos", icon: "warehouse" },
    { id: "frigorificos", label: "Frío y logística", icon: "kitchen" },
    { id: "empaque", label: "Empaque y exportación", icon: "inventory_2" },
  ],
  comercializacion: [
    { id: "acopio", label: "Centro de acopio", icon: "hub" },
    { id: "insumos", label: "Distribución de insumos", icon: "local_shipping" },
    { id: "exportacion", label: "Exportación directa", icon: "flight_takeoff" },
  ],
  servicios: [
    { id: "maquinaria", label: "Renta de maquinaria", icon: "construction" },
    { id: "asesoria", label: "Asesoría técnica", icon: "support_agent" },
    { id: "tecnologia", label: "Tecnología agro", icon: "precision_manufacturing" },
  ],
};

const COLORES = {
  verde: "#006337",
  verdeM: "#179f4e",
  verdeL: "#e8f5ee",
  verdeXL: "#f4faf6",
  dorado: "#c8a84b",
  doradoL: "#fef9ec",
  grisF: "#f7f8f7",
  texto: "#1a1a1a",
  textoS: "#555",
  textoT: "#888",
  borde: "rgba(0,99,55,0.12)",
  bordeM: "rgba(0,99,55,0.25)",
};

// ─── Material Icon Helper ─────────────────────────────────────────────────────

const Icon = ({
  name,
  size = 22,
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
      color: color ?? "inherit",
      userSelect: "none",
      flexShrink: 0,
      verticalAlign: "middle",
      ...style,
    }}
  >
    {name}
  </span>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const STEPS_ORDER: WizardStep[] = [
  "sector","subsector","empresa","financiero","garantias","contacto","analisis","resultado",
];

const STEP_LABELS: Record<WizardStep, string> = {
  sector: "Sector",
  subsector: "Actividad",
  empresa: "Empresa",
  financiero: "Perfil Financiero",
  garantias: "Garantías",
  contacto: "Contacto",
  analisis: "Análisis IA",
  resultado: "Resultado",
};

const WizardProgress = ({ current }: { current: WizardStep }) => {
  const currentIdx = STEPS_ORDER.indexOf(current);
  const progress = ((currentIdx) / (STEPS_ORDER.length - 1)) * 100;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: COLORES.textoT, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Paso {currentIdx + 1} de {STEPS_ORDER.length}
        </span>
        <span style={{ fontSize: 12, color: COLORES.verde, fontWeight: 600 }}>
          {STEP_LABELS[current]}
        </span>
      </div>
      <div style={{ height: 3, background: COLORES.borde, borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${COLORES.verde}, ${COLORES.verdeM})`,
            borderRadius: 2,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
};

// ─── Option Card ──────────────────────────────────────────────────────────────

const OptionCard = ({
  label,
  icon,
  selected,
  onClick,
  subtitle,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  subtitle?: string;
}) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 20px",
      background: selected ? COLORES.verdeL : "#fff",
      border: `1.5px solid ${selected ? COLORES.verde : COLORES.borde}`,
      borderRadius: 14,
      cursor: "pointer",
      textAlign: "left",
      width: "100%",
      transition: "all 0.18s",
      fontFamily: "inherit",
      boxShadow: selected ? `0 0 0 3px ${COLORES.borde}` : "none",
    }}
  >
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 12,
        background: selected ? COLORES.verde : COLORES.grisF,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background 0.18s",
      }}
    >
      <Icon name={icon} size={24} color={selected ? "#fff" : COLORES.verde} />
    </div>
    <div>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: selected ? COLORES.verde : COLORES.texto }}>{label}</div>
      {subtitle && <div style={{ fontSize: 12, color: COLORES.textoT, marginTop: 2 }}>{subtitle}</div>}
    </div>
    {selected && (
      <div style={{ marginLeft: "auto" }}>
        <Icon name="check_circle" size={20} color={COLORES.verde} />
      </div>
    )}
  </button>
);

// ─── Descarte Alert ───────────────────────────────────────────────────────────

const DescarteAlert = ({ mensaje, onBack }: { mensaje: string; onBack: () => void }) => (
  <div
    style={{
      background: "#fff8f0",
      border: "1.5px solid #f0c070",
      borderRadius: 16,
      padding: 28,
      textAlign: "center",
    }}
  >
    <div style={{ marginBottom: 16 }}>
      <Icon name="warning" size={42} color="#c87000" />
    </div>
    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: "#8a4a00", margin: "0 0 12px" }}>
      Perfil no calificado actualmente
    </h3>
    <p style={{ fontSize: 14, color: "#7a5500", lineHeight: 1.7, margin: "0 0 20px" }}>{mensaje}</p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      <button
        onClick={onBack}
        style={{
          padding: "10px 22px",
          background: "transparent",
          border: `1.5px solid #c8a84b`,
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          color: "#8a6200",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Icon name="arrow_back" size={16} color="#8a6200" />
        Revisar mis datos
      </button>
      <a
        href="https://www.fira.gob.mx"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "10px 22px",
          background: "#c8a84b",
          border: "none",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          color: "#fff",
          fontFamily: "inherit",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Icon name="open_in_new" size={16} color="#fff" />
        Ver requisitos FIRA
      </a>
    </div>
  </div>
);

// ─── AI Analysis Component ────────────────────────────────────────────────────

const AIAnalysis = ({ data, onDone }: { data: WizardData; onDone: (resultado: string) => void }) => {
  const [phase, setPhase] = useState<"loading" | "done">("loading");
  const [dots, setDots] = useState("");
  const [resultado, setResultado] = useState("");
  const called = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    analyzeWithAI();
  }, []);

  const analyzeWithAI = async () => {
    const prompt = `Eres un analista de crédito agropecuario senior de Agrocapital, una SOFOM ENR especializada en financiamiento rural en México, registrada bajo normativa FIRA.

Analiza el siguiente perfil de cliente potencial y emite un dictamen breve (máx 180 palabras) en español:

PERFIL DEL SOLICITANTE:
- Sector: ${data.sector ?? "N/A"}
- Actividad específica: ${data.subsector ?? "N/A"}
- Tipo de empresa: ${data.tipoEmpresa ?? "N/A"}
- Antigüedad: ${data.antiguedad ?? "N/A"}
- Capital social / capacidad: ${data.capitalSocial ?? "N/A"}
- Cartera vencida / historial: ${data.carteraVencida ?? "N/A"}
- Rentabilidad: ${data.rentabilidad ?? "N/A"}
- Buró de crédito: ${data.burocredito ?? "N/A"}
- Cumplimiento PLD: ${data.pld ?? "N/A"}
- Garantías ofrecidas: ${(data.garantias ?? []).join(", ") || "N/A"}
Emite tu dictamen con:
1. Calificación general: VIABLE / VIABLE CON CONDICIONES / NO VIABLE
2. Fortalezas del perfil (2-3 puntos)
3. Áreas de atención o riesgo (1-3 puntos)
4. Recomendación de producto Agrocapital más adecuado (Hab. o Avío, Refaccionario, Capital de Trabajo, Rural, Empresarial, Arrendamiento Puro, Prendario)
5. Próximo paso sugerido

Sé directo y profesional. No uses encabezados markdown. Usa texto plano con saltos de línea.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const res = await response.json();
      const text =
        res.content?.map((b: { type: string; text?: string }) => (b.type === "text" ? b.text : "")).join("\n") ??
        "No se pudo obtener el análisis en este momento. Un asesor de Agrocapital se comunicará contigo.";
      setResultado(text);
    } catch {
      setResultado(
        "No se pudo conectar con el servicio de análisis. Un asesor especializado de Agrocapital revisará tu perfil y se comunicará contigo a la brevedad."
      );
    }
    setPhase("done");
  };

  if (phase === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: COLORES.verdeL,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            animation: "pulse 2s infinite",
          }}
        >
          <Icon name="psychology" size={36} color={COLORES.verde} />
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: COLORES.verde, margin: "0 0 8px" }}>
          Analizando tu perfil{dots}
        </h3>
        <p style={{ fontSize: 14, color: COLORES.textoS, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
          Nuestro agente de IA está evaluando tu perfil con base en los criterios FIRA y los productos de Agrocapital.
        </p>
        <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: COLORES.verdeL,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="psychology" size={26} color={COLORES.verde} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORES.verde }}>Dictamen del Agente IA</div>
          <div style={{ fontSize: 12, color: COLORES.textoT }}>Análisis basado en criterios FIRA · Agrocapital</div>
        </div>
      </div>

      <div
        style={{
          background: COLORES.verdeXL,
          border: `1px solid ${COLORES.bordeM}`,
          borderRadius: 12,
          padding: "20px 22px",
          fontSize: 14,
          color: COLORES.texto,
          lineHeight: 1.8,
          whiteSpace: "pre-line",
          marginBottom: 24,
        }}
      >
        {resultado}
      </div>

      <div
        style={{
          background: COLORES.doradoL,
          border: `1px solid rgba(200,168,75,0.3)`,
          borderRadius: 10,
          padding: "12px 16px",
          fontSize: 12,
          color: "#7a5500",
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <Icon name="info" size={16} color="#c8a84b" style={{ marginTop: 1, flexShrink: 0 }} />
        Este análisis es orientativo. Un ejecutivo certificado de Agrocapital revisará tu expediente y confirmará las condiciones finales.
      </div>

      <button
        onClick={() => onDone(resultado)}
        style={{
          width: "100%",
          padding: "14px 0",
          background: COLORES.verde,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.18s",
        }}
        onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#005530")}
        onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = COLORES.verde)}
      >
        <Icon name="check_circle" size={20} color="#fff" />
        Ver mi resultado completo
      </button>
    </div>
  );
};

// ─── Resultado Final ──────────────────────────────────────────────────────────

const ResultadoFinal = ({ data, analisis }: { data: WizardData; analisis: string }) => {
  const isViable = analisis.toLowerCase().includes("viable") && !analisis.toLowerCase().includes("no viable");

  const REDES = [
    { id: "whatsapp", icon: "chat", label: "WhatsApp" },
    { id: "email", icon: "mail", label: "Email" },
    { id: "telefono", icon: "phone", label: "Teléfono" },
    { id: "facebook", icon: "share", label: "Facebook" },
    { id: "instagram", icon: "photo_camera", label: "Instagram" },
    { id: "linkedin", icon: "work", label: "LinkedIn" },
  ];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: isViable ? COLORES.verdeL : "#fff8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Icon name={isViable ? "verified" : "pending"} size={36} color={isViable ? COLORES.verde : "#c87000"} />
        </div>
        <h3
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            color: isViable ? COLORES.verde : "#8a4a00",
            margin: "0 0 8px",
          }}
        >
          {isViable ? "¡Tu perfil es candidato!" : "Perfil en revisión"}
        </h3>
        <p style={{ fontSize: 14, color: COLORES.textoS, lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
          {isViable
            ? "Un ejecutivo de Agrocapital se comunicará contigo en las próximas 24 horas hábiles."
            : "Nuestro equipo revisará tu caso y te orientará sobre los requisitos pendientes."}
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${COLORES.borde}`,
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            background: COLORES.verde,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="summarize" size={18} color="#fff" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Resumen de tu solicitud</span>
        </div>
        <div style={{ padding: "16px 18px" }}>
          {[
            { label: "Sector", value: data.sector },
            { label: "Actividad", value: data.subsector },
            { label: "Tipo empresa", value: data.tipoEmpresa },
            { label: "Antigüedad", value: data.antiguedad },
            { label: "Garantías", value: (data.garantias ?? []).join(", ") },
            { label: "Contacto", value: data.correo ?? data.telefono },
          ]
            .filter((r) => r.value)
            .map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "8px 0",
                  borderBottom: i < arr.length - 1 ? `0.5px solid ${COLORES.borde}` : "none",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 12, color: COLORES.textoT, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: COLORES.texto, textAlign: "right" }}>{row.value}</span>
              </div>
            ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORES.verde, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
          Medios de contacto seleccionados
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(data.redesSociales ?? []).map((id) => {
            const red = REDES.find((r) => r.id === id);
            return red ? (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: COLORES.verdeL,
                  border: `1px solid ${COLORES.bordeM}`,
                  borderRadius: 20,
                  fontSize: 13,
                  color: COLORES.verde,
                  fontWeight: 500,
                }}
              >
                <Icon name={red.icon} size={15} color={COLORES.verde} />
                {red.label}
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <a
          href="https://wa.me/526688185358"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "13px 0",
            background: "#25D366",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <Icon name="chat" size={18} color="#fff" />
          WhatsApp
        </a>
        <a
          href="mailto:atencionaclientes@agrocapital.com.mx"
          style={{
            padding: "13px 0",
            background: COLORES.verde,
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <Icon name="mail" size={18} color="#fff" />
          Correo
        </a>
      </div>
    </div>
  );
};

// ─── Wizard Steps ─────────────────────────────────────────────────────────────

const StepSector = ({
  data,
  onChange,
  onNext,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
}) => (
  <div>
    <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: COLORES.verde, margin: "0 0 6px" }}>
      ¿En qué sector opera tu negocio?
    </h2>
    <p style={{ fontSize: 14, color: COLORES.textoS, margin: "0 0 24px", lineHeight: 1.6 }}>
      Selecciona el sector principal de tu actividad productiva o empresarial.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
      {SECTORES.map((s) => (
        <OptionCard
          key={s.id}
          label={s.label}
          icon={s.icon}
          selected={data.sector === s.id}
          onClick={() => onChange({ sector: s.id, subsector: undefined })}
        />
      ))}
    </div>
    <button
      onClick={onNext}
      disabled={!data.sector}
      style={{
        width: "100%",
        padding: "14px 0",
        background: data.sector ? COLORES.verde : "#ccc",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 600,
        cursor: data.sector ? "pointer" : "not-allowed",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "background 0.18s",
      }}
    >
      Continuar
      <Icon name="arrow_forward" size={18} color="#fff" />
    </button>
  </div>
);

const StepSubsector = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) => {
  const subs = SUBSECTORES[data.sector ?? ""] ?? [];
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: COLORES.verde, margin: "0 0 6px" }}>
        ¿Cuál es tu actividad específica?
      </h2>
      <p style={{ fontSize: 14, color: COLORES.textoS, margin: "0 0 24px", lineHeight: 1.6 }}>
        Esto nos permite identificar el producto de financiamiento más adecuado para ti.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {subs.map((s) => (
          <OptionCard
            key={s.id}
            label={s.label}
            icon={s.icon}
            selected={data.subsector === s.id}
            onClick={() => onChange({ subsector: s.id })}
          />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            padding: "13px 0",
            background: "transparent",
            border: `1.5px solid ${COLORES.bordeM}`,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            color: COLORES.textoS,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Icon name="arrow_back" size={17} color={COLORES.textoS} />
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!data.subsector}
          style={{
            padding: "13px 0",
            background: data.subsector ? COLORES.verde : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: data.subsector ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Continuar
          <Icon name="arrow_forward" size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
};

const StepEmpresa = ({
  data,
  onChange,
  onNext,
  onBack,
  descarte,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  descarte: string | null;
}) => {
  if (descarte) return <DescarteAlert mensaje={descarte} onBack={() => onChange({ tipoEmpresa: undefined, antiguedad: undefined })} />;

  const tiposEmpresa = [
    { id: "persona_fisica", label: "Persona Física con Actividad Empresarial", icon: "person" },
    { id: "srl_sc", label: "S. de R.L. / S.C. (Soc. Civil o Rural)", icon: "groups" },
    { id: "sa_sapi", label: "S.A. de C.V. / S.A.P.I.", icon: "corporate_fare" },
    { id: "sofom", label: "SOFOM / IF Regulada", icon: "account_balance" },
    { id: "ejido", label: "Ejido / Comunidad Agraria", icon: "landscape" },
  ];

  const antiguedades = [
    { id: "menos1", label: "Menos de 1 año", icon: "new_releases", sub: "Empresa nueva o en arranque" },
    { id: "1a2", label: "1 a 2 años", icon: "schedule", sub: "Operación inicial consolidándose" },
    { id: "2a5", label: "2 a 5 años", icon: "calendar_month", sub: "Empresa en crecimiento" },
    { id: "mas5", label: "Más de 5 años", icon: "verified", sub: "Empresa establecida y consolidada" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: COLORES.verde, margin: "0 0 6px" }}>
        Perfil de tu empresa
      </h2>
      <p style={{ fontSize: 14, color: COLORES.textoS, margin: "0 0 22px", lineHeight: 1.6 }}>
        Estos datos son necesarios para verificar elegibilidad con los criterios de gobierno corporativo de FIRA.
      </p>

      <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
        Tipo de persona / empresa
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {tiposEmpresa.map((t) => (
          <OptionCard
            key={t.id}
            label={t.label}
            icon={t.icon}
            selected={data.tipoEmpresa === t.id}
            onClick={() => onChange({ tipoEmpresa: t.id })}
          />
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
        Antigüedad de operación
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        {antiguedades.map((a) => (
          <OptionCard
            key={a.id}
            label={a.label}
            icon={a.icon}
            subtitle={a.sub}
            selected={data.antiguedad === a.id}
            onClick={() => onChange({ antiguedad: a.id })}
          />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            padding: "13px 0",
            background: "transparent",
            border: `1.5px solid ${COLORES.bordeM}`,
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            color: COLORES.textoS,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Icon name="arrow_back" size={17} color={COLORES.textoS} />
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!data.tipoEmpresa || !data.antiguedad}
          style={{
            padding: "13px 0",
            background: data.tipoEmpresa && data.antiguedad ? COLORES.verde : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: data.tipoEmpresa && data.antiguedad ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Continuar
          <Icon name="arrow_forward" size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
};

const StepFinanciero = ({
  data,
  onChange,
  onNext,
  onBack,
  descarte,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  descarte: string | null;
}) => {
  if (descarte)
    return (
      <DescarteAlert
        mensaje={descarte}
        onBack={() => onChange({ capitalSocial: undefined, carteraVencida: undefined, rentabilidad: undefined, burocredito: undefined, pld: undefined })}
      />
    );

  const opts = {
    capitalSocial: [
      { id: "menos12m_udis", label: "Menor a 12 millones UDIs", icon: "trending_down", sub: "Capital insuficiente para FIRA" },
      { id: "12m_udis_plus", label: "12 millones UDIs o más", icon: "trending_up", sub: "Cumple capital mínimo FIRA" },
    ],
    carteraVencida: [
      { id: "alta", label: "Cartera vencida > 10%", icon: "warning", sub: "Excede el límite FIRA" },
      { id: "media", label: "Cartera vencida 2.5%–10%", icon: "remove_circle", sub: "En el umbral de riesgo" },
      { id: "baja", label: "Cartera vencida < 2.5%", icon: "check_circle", sub: "Cumple indicador FIRA" },
      { id: "na", label: "No aplica / Sin cartera", icon: "help", sub: "Persona física o empresa sin cartera" },
    ],
    rentabilidad: [
      { id: "negativa", label: "Resultado negativo en los últimos 3 años", icon: "trending_down" },
      { id: "variable", label: "Resultado mixto (algunos años positivos)", icon: "sync_alt" },
      { id: "positiva", label: "Rentabilidad positiva consistente", icon: "trending_up" },
    ],
    burocredito: [
      { id: "malo", label: "Con observaciones graves en buró", icon: "gpp_bad" },
      { id: "regular", label: "Con observaciones menores", icon: "gpp_maybe" },
      { id: "limpio", label: "Sin observaciones / historial limpio", icon: "verified_user" },
      { id: "sinhistorial", label: "Sin historial crediticio", icon: "remove_circle_outline" },
    ],
    pld: [
      { id: "no", label: "Sin oficial de cumplimiento PLD/FT designado", icon: "gpp_bad" },
      { id: "proceso", label: "En proceso de cumplimiento PLD", icon: "pending" },
      { id: "si", label: "Cumplimiento PLD/FT completo y vigente", icon: "security" },
    ],
  };

  const SeccionLabel = ({ label }: { label: string }) => (
    <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, textTransform: "uppercase", letterSpacing: "0.07em", margin: "18px 0 10px" }}>
      {label}
    </div>
  );

  const canContinue =
    data.capitalSocial &&
    data.carteraVencida &&
    data.rentabilidad &&
    data.burocredito &&
    data.pld;

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: COLORES.verde, margin: "0 0 6px" }}>
        Indicadores financieros
      </h2>
      <p style={{ fontSize: 14, color: COLORES.textoS, margin: "0 0 10px", lineHeight: 1.6 }}>
        Estos datos nos permiten evaluar tu perfil conforme a los indicadores mínimos del perfil FIRA.
      </p>

      <SeccionLabel label="Capital social / patrimonio" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.capitalSocial.map((o) => (
          <OptionCard key={o.id} label={o.label} icon={o.icon} subtitle={o.sub} selected={data.capitalSocial === o.id} onClick={() => onChange({ capitalSocial: o.id })} />
        ))}
      </div>

      <SeccionLabel label="Cartera vencida / morosidad" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.carteraVencida.map((o) => (
          <OptionCard key={o.id} label={o.label} icon={o.icon} subtitle={o.sub} selected={data.carteraVencida === o.id} onClick={() => onChange({ carteraVencida: o.id })} />
        ))}
      </div>

      <SeccionLabel label="Rentabilidad de operación" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.rentabilidad.map((o) => (
          <OptionCard key={o.id} label={o.label} icon={o.icon} selected={data.rentabilidad === o.id} onClick={() => onChange({ rentabilidad: o.id })} />
        ))}
      </div>

      <SeccionLabel label="Buró de crédito" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.burocredito.map((o) => (
          <OptionCard key={o.id} label={o.label} icon={o.icon} selected={data.burocredito === o.id} onClick={() => onChange({ burocredito: o.id })} />
        ))}
      </div>

      <SeccionLabel label="Cumplimiento PLD / FT" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {opts.pld.map((o) => (
          <OptionCard key={o.id} label={o.label} icon={o.icon} selected={data.pld === o.id} onClick={() => onChange({ pld: o.id })} />
        ))}
      </div>

      <div
        style={{
          background: COLORES.verdeXL,
          border: `1px solid ${COLORES.borde}`,
          borderRadius: 10,
          padding: "12px 14px",
          fontSize: 12,
          color: COLORES.textoS,
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          margin: "20px 0 24px",
        }}
      >
        <Icon name="calculate" size={17} color={COLORES.verde} style={{ marginTop: 1 }} />
        El monto, plazo y estimación de pagos se consultan por separado en el simulador público de préstamo.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            padding: "13px 0", background: "transparent", border: `1.5px solid ${COLORES.bordeM}`,
            borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer", color: COLORES.textoS,
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Icon name="arrow_back" size={17} color={COLORES.textoS} /> Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            padding: "13px 0", background: canContinue ? COLORES.verde : "#ccc", color: "#fff", border: "none",
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: canContinue ? "pointer" : "not-allowed",
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Continuar <Icon name="arrow_forward" size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
};

const StepGarantias = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) => {
  const garantias = [
    { id: "terreno_agricola", label: "Terreno agrícola", icon: "landscape" },
    { id: "terreno_urbano", label: "Terreno urbano / inmueble", icon: "home_work" },
    { id: "maquinaria", label: "Maquinaria y equipo", icon: "agriculture" },
    { id: "cosecha", label: "Cosecha / inventario (prenda agrícola)", icon: "inventory_2" },
    { id: "ganado", label: "Ganado (prenda ganadera)", icon: "pets" },
    { id: "vehiculos", label: "Vehículos o flotilla", icon: "local_shipping" },
    { id: "carta_credito", label: "Carta de crédito / aval bancario", icon: "account_balance" },
    { id: "aval", label: "Aval personal con patrimonio", icon: "person_check" },
    { id: "contrato", label: "Contrato de compra-venta asegurado", icon: "receipt_long" },
    { id: "sin_garantia", label: "Sin garantías actualmente", icon: "help_outline" },
  ];

  const sel = data.garantias ?? [];
  const toggle = (id: string) => {
    if (id === "sin_garantia") {
      onChange({ garantias: sel.includes("sin_garantia") ? [] : ["sin_garantia"] });
    } else {
      const next = sel.includes(id) ? sel.filter((g) => g !== id) : [...sel.filter((g) => g !== "sin_garantia"), id];
      onChange({ garantias: next });
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: COLORES.verde, margin: "0 0 6px" }}>
        Garantías disponibles
      </h2>
      <p style={{ fontSize: 14, color: COLORES.textoS, margin: "0 0 22px", lineHeight: 1.6 }}>
        Selecciona todos los activos que podrías ofrecer como garantía. Puedes elegir más de uno.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24 }}>
        {garantias.map((g) => (
          <OptionCard key={g.id} label={g.label} icon={g.icon} selected={sel.includes(g.id)} onClick={() => toggle(g.id)} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            padding: "13px 0", background: "transparent", border: `1.5px solid ${COLORES.bordeM}`,
            borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer", color: COLORES.textoS,
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Icon name="arrow_back" size={17} color={COLORES.textoS} /> Atrás
        </button>
        <button
          onClick={onNext}
          disabled={sel.length === 0}
          style={{
            padding: "13px 0", background: sel.length > 0 ? COLORES.verde : "#ccc", color: "#fff", border: "none",
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: sel.length > 0 ? "pointer" : "not-allowed",
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Continuar <Icon name="arrow_forward" size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
};

const StepContacto = ({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: WizardData;
  onChange: (d: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}) => {
  const redes = [
    { id: "whatsapp", icon: "chat", label: "WhatsApp" },
    { id: "email", icon: "mail", label: "Email" },
    { id: "telefono", icon: "phone", label: "Llamada" },
    { id: "facebook", icon: "share", label: "Facebook" },
    { id: "instagram", icon: "photo_camera", label: "Instagram" },
    { id: "linkedin", icon: "work", label: "LinkedIn" },
  ];

  const sel = data.redesSociales ?? [];
  const toggleRed = (id: string) => {
    const next = sel.includes(id) ? sel.filter((r) => r !== id) : [...sel, id];
    onChange({ redesSociales: next });
  };

  const canContinue = (data.correo || data.telefono) && sel.length > 0;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    border: `1.5px solid ${COLORES.bordeM}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "inherit",
    color: COLORES.texto,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 12,
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: COLORES.verde, margin: "0 0 6px" }}>
        Datos de contacto
      </h2>
      <p style={{ fontSize: 14, color: COLORES.textoS, margin: "0 0 22px", lineHeight: 1.6 }}>
        Un ejecutivo de Agrocapital se comunicará contigo por el canal que prefieras.
      </p>

      <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
        Información de contacto
      </div>

      <input
        type="text"
        placeholder="Nombre completo"
        value={data.nombre ?? ""}
        onChange={(e) => onChange({ nombre: e.target.value })}
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        value={data.correo ?? ""}
        onChange={(e) => onChange({ correo: e.target.value })}
        style={inputStyle}
      />
      <input
        type="tel"
        placeholder="Número celular (con lada)"
        value={data.telefono ?? ""}
        onChange={(e) => onChange({ telefono: e.target.value })}
        style={{ ...inputStyle, marginBottom: 22 }}
      />

      <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>
        ¿Por qué canales prefieres que te contactemos?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {redes.map((r) => (
          <button
            key={r.id}
            onClick={() => toggleRed(r.id)}
            style={{
              padding: "12px 8px",
              background: sel.includes(r.id) ? COLORES.verdeL : "#fff",
              border: `1.5px solid ${sel.includes(r.id) ? COLORES.verde : COLORES.borde}`,
              borderRadius: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: "all 0.18s",
            }}
          >
            <Icon name={r.icon} size={24} color={sel.includes(r.id) ? COLORES.verde : COLORES.textoS} />
            <span style={{ fontSize: 12, fontWeight: sel.includes(r.id) ? 600 : 400, color: sel.includes(r.id) ? COLORES.verde : COLORES.textoS }}>
              {r.label}
            </span>
          </button>
        ))}
      </div>

      <div
        style={{
          background: COLORES.verdeXL,
          border: `1px solid ${COLORES.borde}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 12,
          color: COLORES.textoS,
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <Icon name="lock" size={15} color={COLORES.verde} style={{ marginTop: 1, flexShrink: 0 }} />
        Tus datos son confidenciales y se usan exclusivamente para que nuestro equipo te contacte. Aplicamos aviso de privacidad.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10 }}>
        <button
          onClick={onBack}
          style={{
            padding: "13px 0", background: "transparent", border: `1.5px solid ${COLORES.bordeM}`,
            borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer", color: COLORES.textoS,
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <Icon name="arrow_back" size={17} color={COLORES.textoS} /> Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            padding: "13px 0", background: canContinue ? COLORES.verde : "#ccc", color: "#fff", border: "none",
            borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: canContinue ? "pointer" : "not-allowed",
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Analizar mi perfil <Icon name="psychology" size={17} color="#fff" />
        </button>
      </div>
    </div>
  );
};

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const Wizard = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<WizardStep>("sector");
  const [data, setData] = useState<WizardData>({});
  const [analisis, setAnalisis] = useState("");

  const update = (patch: Partial<WizardData>) => setData((d) => ({ ...d, ...patch }));

  // Descarte logic based on FIRA criteria
  const getDescarteEmpresa = (): string | null => {
    if (data.tipoEmpresa === "sofom") {
      return "Las SOFOM y entidades financieras reguladas no son el perfil objetivo de Agrocapital como acreditado directo. Te recomendamos contactar directamente a FIRA para operaciones de segundo piso.";
    }
    return null;
  };

  const getDescarteFinanciero = (): string | null => {
    if (data.capitalSocial === "menos12m_udis") {
      return "El capital social mínimo requerido por FIRA para intermediarios financieros es de 12 millones de UDIs. Si eres persona física o empresa sin acceso a fondeo FIRA, aún podemos apoyarte con productos propios de Agrocapital. Contacta a un asesor para revisar tu caso específico.";
    }
    if (data.carteraVencida === "alta") {
      return "Tu cartera vencida supera el límite del 10% establecido por FIRA. Esto no necesariamente nos impide atenderte, pero requeriremos un análisis detallado de tu situación. Te recomendamos agendar una consulta directa con nuestro equipo de crédito.";
    }
    if (data.rentabilidad === "negativa" && data.burocredito === "malo") {
      return "El perfil combinado de rentabilidad negativa en los últimos 3 años junto con observaciones graves en buró de crédito dificulta la aprobación en este momento. Nuestro equipo puede orientarte sobre un plan de saneamiento financiero antes de iniciar una solicitud formal.";
    }
    if (data.burocredito === "malo") {
      return "Las observaciones graves en el buró de crédito requieren un análisis especial. Podemos trabajar contigo para identificar una ruta de acceso al financiamiento. Un asesor te contactará para explorar opciones.";
    }
    return null;
  };

  const next = () => {
    const order = STEPS_ORDER;
    const curr = order.indexOf(step);
    if (curr < order.length - 1) setStep(order[curr + 1]);
  };
  const back = () => {
    const order = STEPS_ORDER;
    const curr = order.indexOf(step);
    if (curr > 0) setStep(order[curr - 1]);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,30,15,0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 620,
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,50,25,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 0",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
            borderBottom: step !== "resultado" ? `0.5px solid ${COLORES.borde}` : "none",
            paddingBottom: step !== "resultado" ? 20 : 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: step !== "resultado" ? 16 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: COLORES.verde,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="eco" size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORES.verde, lineHeight: 1 }}>Agrocapital</div>
                <div style={{ fontSize: 11, color: COLORES.textoT }}>Evaluación de perfil crediticio</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: COLORES.grisF,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="close" size={18} color={COLORES.textoS} />
            </button>
          </div>
          {step !== "resultado" && step !== "analisis" && <WizardProgress current={step} />}
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {step === "sector" && <StepSector data={data} onChange={update} onNext={next} />}
          {step === "subsector" && <StepSubsector data={data} onChange={update} onNext={next} onBack={back} />}
          {step === "empresa" && <StepEmpresa data={data} onChange={update} onNext={next} onBack={back} descarte={step === "empresa" && data.tipoEmpresa ? getDescarteEmpresa() : null} />}
          {step === "financiero" && (
            <StepFinanciero
              data={data}
              onChange={update}
              onNext={next}
              onBack={back}
              descarte={step === "financiero" && (data.capitalSocial || data.carteraVencida || data.rentabilidad || data.burocredito) ? getDescarteFinanciero() : null}
            />
          )}
          {step === "garantias" && <StepGarantias data={data} onChange={update} onNext={next} onBack={back} />}
          {step === "contacto" && <StepContacto data={data} onChange={update} onNext={next} onBack={back} />}
          {step === "analisis" && (
            <AIAnalysis
              data={data}
              onDone={(r) => {
                setAnalisis(r);
                next();
              }}
            />
          )}
          {step === "resultado" && <ResultadoFinal data={data} analisis={analisis} />}
        </div>
      </div>
    </div>
  );
};


// ─── Simulador Público de Préstamo ───────────────────────────────────────────

type FrecuenciaPago = "mensual" | "bimestral" | "trimestral" | "semestral";

const PRODUCTOS_SIMULADOR = [
  {
    id: "avio",
    nombre: "Habilitación o Avío",
    margen: 4.25,
    destino: "Insumos, jornales y ciclo productivo.",
    garantia: "Cosecha, inventario o garantía acordada.",
  },
  {
    id: "refaccionario",
    nombre: "Crédito Refaccionario",
    margen: 4.75,
    destino: "Maquinaria, equipo e infraestructura.",
    garantia: "Bien adquirido o garantía complementaria.",
  },
  {
    id: "capital",
    nombre: "Capital de Trabajo",
    margen: 5.25,
    destino: "Operación, comercialización y liquidez.",
    garantia: "Sujeta al análisis crediticio.",
  },
  {
    id: "rural",
    nombre: "Financiamiento Rural",
    margen: 4.9,
    destino: "Productores, ejidos y actividades rurales.",
    garantia: "Sujeta a elegibilidad y proyecto.",
  },
] as const;

const FRECUENCIAS: Record<
  FrecuenciaPago,
  { label: string; meses: number; pagosAnio: number }
> = {
  mensual: { label: "Mensual", meses: 1, pagosAnio: 12 },
  bimestral: { label: "Bimestral", meses: 2, pagosAnio: 6 },
  trimestral: { label: "Trimestral", meses: 3, pagosAnio: 4 },
  semestral: { label: "Semestral", meses: 6, pagosAnio: 2 },
};

const PLAZOS_SIMULADOR = [6, 12, 18, 24, 36, 48, 60];

const money = (valor: number) =>
  valor.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });

const SimuladorPrestamo = ({ onClose }: { onClose: () => void }) => {
  const [monto, setMonto] = useState(500000);
  const [plazoMeses, setPlazoMeses] = useState(24);
  const [frecuencia, setFrecuencia] = useState<FrecuenciaPago>("mensual");
  const [productoId, setProductoId] = useState<(typeof PRODUCTOS_SIMULADOR)[number]["id"]>("avio");
  const [tiie, setTiie] = useState(8.5);

  const producto = PRODUCTOS_SIMULADOR.find((p) => p.id === productoId) ?? PRODUCTOS_SIMULADOR[0];
  const periodo = FRECUENCIAS[frecuencia];
  const tasaAnual = tiie + producto.margen;
  const numeroPagos = Math.max(1, Math.round(plazoMeses / periodo.meses));
  const tasaPeriodo = Math.pow(1 + tasaAnual / 100, periodo.meses / 12) - 1;
  const pagoEstimado =
    tasaPeriodo === 0
      ? monto / numeroPagos
      : (monto * tasaPeriodo) / (1 - Math.pow(1 + tasaPeriodo, -numeroPagos));
  const totalEstimado = pagoEstimado * numeroPagos;
  const interesesEstimados = totalEstimado - monto;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,30,15,0.62)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
        backdropFilter: "blur(5px)",
      }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        style={{
          width: "min(1080px, 100%)",
          maxHeight: "94vh",
          overflowY: "auto",
          borderRadius: 22,
          background: "#fff",
          boxShadow: "0 28px 90px rgba(0,30,15,0.3)",
        }}
      >
        <div
          style={{
            padding: "20px 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            borderBottom: `1px solid ${COLORES.borde}`,
            position: "sticky",
            top: 0,
            zIndex: 2,
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 43,
                height: 43,
                borderRadius: 12,
                background: COLORES.verdeL,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="calculate" size={25} color={COLORES.verde} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  color: COLORES.verde,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 23,
                }}
              >
                Simulador de préstamo
              </h2>
              <p style={{ margin: "3px 0 0", color: COLORES.textoT, fontSize: 12 }}>
                Financiamiento con fondeo tipo fideicomiso · Resultado informativo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              border: "none",
              borderRadius: 10,
              background: COLORES.grisF,
              cursor: "pointer",
            }}
          >
            <Icon name="close" size={20} color={COLORES.textoS} />
          </button>
        </div>

        <div
          style={{
            padding: 26,
            display: "grid",
            gridTemplateColumns: "minmax(310px, 1fr) minmax(300px, 0.9fr)",
            gap: 26,
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 11 }}>
              Producto a simular
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
              {PRODUCTOS_SIMULADOR.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProductoId(item.id)}
                  style={{
                    minHeight: 72,
                    border: `1.5px solid ${productoId === item.id ? COLORES.verde : COLORES.borde}`,
                    background: productoId === item.id ? COLORES.verdeL : "#fff",
                    color: productoId === item.id ? COLORES.verde : COLORES.texto,
                    borderRadius: 11,
                    padding: "11px 12px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {item.nombre}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Monto deseado
              </label>
              <strong style={{ fontSize: 23, color: COLORES.verde }}>{money(monto)}</strong>
            </div>
            <input
              type="range"
              min={50000}
              max={10000000}
              step={50000}
              value={monto}
              onChange={(event) => setMonto(Number(event.target.value))}
              style={{ width: "100%", accentColor: COLORES.verde, marginBottom: 6 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: COLORES.textoT, fontSize: 12, marginBottom: 24 }}>
              <span>$50,000</span>
              <span>$10,000,000</span>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Plazo seleccionado
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {PLAZOS_SIMULADOR.map((plazo) => (
                <button
                  key={plazo}
                  type="button"
                  onClick={() => setPlazoMeses(plazo)}
                  style={{
                    padding: "10px 14px",
                    border: `1.5px solid ${plazoMeses === plazo ? COLORES.verde : COLORES.borde}`,
                    background: plazoMeses === plazo ? COLORES.verde : "#fff",
                    color: plazoMeses === plazo ? "#fff" : COLORES.textoS,
                    borderRadius: 9,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 600,
                  }}
                >
                  {plazo} meses
                </button>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: COLORES.verde, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Frecuencia de pago
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {(Object.entries(FRECUENCIAS) as [FrecuenciaPago, { label: string; meses: number; pagosAnio: number }][]).map(
                ([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFrecuencia(key)}
                    style={{
                      padding: "10px 13px",
                      border: `1.5px solid ${frecuencia === key ? COLORES.verde : COLORES.borde}`,
                      background: frecuencia === key ? COLORES.verdeL : "#fff",
                      color: frecuencia === key ? COLORES.verde : COLORES.textoS,
                      borderRadius: 9,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>

            <div
              style={{
                border: `1px solid ${COLORES.borde}`,
                background: COLORES.verdeXL,
                borderRadius: 12,
                padding: 15,
              }}
            >
              <label style={{ display: "block", color: COLORES.verde, fontWeight: 700, fontSize: 12, marginBottom: 7 }}>
                TIIE REFERENCIAL ANUAL (EDITABLE PARA LA DEMO)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number"
                  value={tiie}
                  min={0}
                  step={0.01}
                  onChange={(event) => setTiie(Number(event.target.value) || 0)}
                  style={{
                    width: 110,
                    border: `1px solid ${COLORES.bordeM}`,
                    borderRadius: 8,
                    padding: "9px 10px",
                    fontFamily: "inherit",
                    fontSize: 15,
                    fontWeight: 600,
                    color: COLORES.verde,
                  }}
                />
                <span style={{ color: COLORES.verde, fontWeight: 700 }}>%</span>
                <span style={{ fontSize: 11, color: COLORES.textoT }}>
                  Captura la tasa vigente aplicable.
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: COLORES.verdeXL,
              borderRadius: 17,
              border: `1px solid ${COLORES.borde}`,
              padding: 22,
            }}
          >
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: COLORES.verde, marginBottom: 10 }}>
              Resultado estimado
            </div>

            <div
              style={{
                background: COLORES.verde,
                color: "#fff",
                padding: "18px",
                borderRadius: 13,
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>Pago {periodo.label.toLowerCase()} estimado</div>
              <div style={{ fontSize: 36, lineHeight: 1.15, fontWeight: 700, marginTop: 5 }}>
                {money(pagoEstimado)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.82, marginTop: 7 }}>
                {numeroPagos} pagos durante {plazoMeses} meses
              </div>
            </div>

            {[
              { label: "Monto solicitado", value: money(monto) },
              { label: "TIIE referencial anual", value: `${tiie.toFixed(2)}%` },
              { label: `Margen indicativo (${producto.nombre})`, value: `+ ${producto.margen.toFixed(2)}%` },
              { label: "Tasa anual estimada", value: `${tasaAnual.toFixed(2)}%` },
              { label: "Frecuencia de pagos", value: periodo.label },
              { label: "Intereses estimados", value: money(interesesEstimados) },
              { label: "Total estimado a pagar", value: money(totalEstimado) },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "9px 0",
                  borderBottom: `1px solid ${COLORES.borde}`,
                  fontSize: 13,
                }}
              >
                <span style={{ color: COLORES.textoS }}>{row.label}</span>
                <strong style={{ color: COLORES.texto }}>{row.value}</strong>
              </div>
            ))}

            <div style={{ marginTop: 18, padding: "14px", borderRadius: 10, background: "#fff", border: `1px solid ${COLORES.borde}` }}>
              <div style={{ color: COLORES.verde, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                Condiciones de referencia
              </div>
              <div style={{ color: COLORES.textoS, fontSize: 12, lineHeight: 1.65 }}>
                <strong>Destino:</strong> {producto.destino}<br />
                <strong>Fuente:</strong> Financiamiento con fondeo tipo fideicomiso/FIRA, sujeto a elegibilidad.<br />
                <strong>Tasa:</strong> Variable, calculada como TIIE referencial más margen indicativo.<br />
                <strong>Garantía:</strong> {producto.garantia}
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                gap: 7,
                alignItems: "flex-start",
                color: "#7a5500",
                background: COLORES.doradoL,
                border: "1px solid rgba(200,168,75,0.3)",
                borderRadius: 9,
                padding: 11,
                fontSize: 11,
                lineHeight: 1.55,
              }}
            >
              <Icon name="info" size={15} color={COLORES.dorado} style={{ marginTop: 1 }} />
              Simulación informativa. No constituye aprobación, oferta vinculante ni CAT final.
              La tasa, comisiones, garantías y condiciones dependen del análisis del expediente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Landing Page Sections ────────────────────────────────────────────────────

const Navbar = ({ onWizard, onSimulador }: { onWizard: () => void; onSimulador: () => void }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        padding: "0 5vw",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        borderBottom: scrolled ? `0.5px solid ${COLORES.borde}` : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: COLORES.verde,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="eco" size={22} color="#fff" />
        </div>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 600,
            color: scrolled ? COLORES.verde : "#fff",
            letterSpacing: "0.01em",
          }}
        >
          Agrocapital
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {["Nosotros", "Productos", "Contacto"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: scrolled ? COLORES.textoS : "rgba(255,255,255,0.85)",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 8,
              transition: "all 0.18s",
            }}
          >
            {item}
          </a>
        ))}
        <button
          onClick={onSimulador}
          style={{
            padding: "9px 18px",
            background: scrolled ? "#fff" : "rgba(255,255,255,0.08)",
            color: scrolled ? COLORES.verde : "#fff",
            border: `1.5px solid ${scrolled ? COLORES.bordeM : "rgba(255,255,255,0.45)"}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: 8,
            transition: "all 0.18s",
          }}
        >
          <Icon name="calculate" size={16} color={scrolled ? COLORES.verde : "#fff"} />
          Simular préstamo
        </button>
        <button
          onClick={onWizard}
          style={{
            padding: "9px 20px",
            background: COLORES.verde,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: 8,
            transition: "background 0.18s",
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#005530")}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = COLORES.verde)}
        >
          <Icon name="assignment" size={16} color="#fff" />
          Solicitar financiamiento
        </button>
      </div>
    </nav>
  );
};

const Hero = ({ onWizard }: { onWizard: () => void }) => (
  <section
    style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #003d22 0%, #006337 45%, #179f4e 100%)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "100px 5vw 60px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative circles */}
    <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.025)", pointerEvents: "none" }} />

    <div style={{ maxWidth: 760, textAlign: "center", position: "relative", zIndex: 1 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 16px",
          background: "rgba(200,168,75,0.2)",
          border: "1px solid rgba(200,168,75,0.4)",
          borderRadius: 20,
          marginBottom: 28,
        }}
      >
        <Icon name="verified" size={14} color={COLORES.dorado} />
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORES.dorado, letterSpacing: "0.06em" }}>
          SOFOM ENR · Registrada CNBV · Socio FIRA
        </span>
      </div>

      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(38px, 6vw, 68px)",
          fontWeight: 600,
          color: "#fff",
          lineHeight: 1.15,
          margin: "0 0 24px",
          letterSpacing: "-0.01em",
        }}
      >
        Aquí creces con
        <br />
        <span style={{ fontStyle: "italic", color: "#a8e6c4" }}>seguridad y visión.</span>
      </h1>

      <p
        style={{
          fontSize: 18,
          color: "rgba(255,255,255,0.8)",
          lineHeight: 1.7,
          margin: "0 auto 40px",
          maxWidth: 560,
          fontWeight: 300,
        }}
      >
        Financiamiento integral para evolucionar tu agronegocio. Créditos diseñados para el campo mexicano con respaldo FIRA.
      </p>

      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={onWizard}
          style={{
            padding: "16px 34px",
            background: "#fff",
            color: COLORES.verde,
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.2s",
            letterSpacing: "0.01em",
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)"; }}
          onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
        >
          <Icon name="play_circle" size={20} color={COLORES.verde} />
          Evalúa tu perfil ahora
        </button>
        <a
          href="#productos"
          style={{
            padding: "16px 34px",
            background: "transparent",
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.4)",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)")}
          onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
        >
          <Icon name="info" size={18} color="rgba(255,255,255,0.8)" />
          Nuestros productos
        </a>
      </div>

      <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 52, flexWrap: "wrap" }}>
        {[
          { v: "+15", l: "años en el mercado" },
          { v: "$3B+", l: "MXN financiados" },
          { v: "8+", l: "estados atendidos" },
        ].map((stat) => (
          <div key={stat.l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 600, color: "#fff" }}>{stat.v}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{stat.l}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Productos = ({ onWizard }: { onWizard: () => void }) => {
  const productos = [
    { icon: "build", nombre: "Crédito Refaccionario", desc: "Adquiere maquinaria, equipo e infraestructura para tu agronegocio con plazos de hasta 10 años.", acento: "#006337" },
    { icon: "trending_up", nombre: "Capital de Trabajo", desc: "Liquidez inmediata para operar sin interrupciones en tus ciclos de producción y comercialización.", acento: "#179f4e" },
    { icon: "grass", nombre: "Habilitación o Avío", desc: "Financia tus insumos, jornales y gastos directos de producción agrícola o ganadera.", acento: "#c8a84b" },
    { icon: "apartment", nombre: "Arrendamiento Puro", desc: "Usa el equipo que necesitas sin inmovilizar capital. Mantenimiento y renovación incluidos.", acento: "#006337" },
    { icon: "landscape", nombre: "Financiamiento Rural", desc: "Soluciones especiales para ejidos, comunidades agrarias y productores de pequeña escala.", acento: "#179f4e" },
    { icon: "corporate_fare", nombre: "Crédito Empresarial", desc: "Líneas de crédito flexibles para empresas agropecuarias con necesidades de expansión.", acento: "#c8a84b" },
    { icon: "inventory_2", nombre: "Crédito Prendario", desc: "Fondeo inmediato con respaldo de inventario, cosecha o activos almacenados.", acento: "#006337" },
  ];

  return (
    <section id="productos" style={{ padding: "100px 5vw", background: "#f9fbf9" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "5px 14px", background: COLORES.verdeL, borderRadius: 20, border: `1px solid ${COLORES.borde}` }}>
            <Icon name="category" size={14} color={COLORES.verde} />
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORES.verde, textTransform: "uppercase", letterSpacing: "0.08em" }}>Productos Financieros</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, color: COLORES.verde, margin: "0 0 14px", fontWeight: 600 }}>
            Soluciones para cada etapa de tu agronegocio
          </h2>
          <p style={{ fontSize: 16, color: COLORES.textoS, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Cada producto está diseñado para responder a las necesidades específicas del sector agropecuario mexicano.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {productos.map((p) => (
            <div
              key={p.nombre}
              style={{
                background: "#fff",
                border: `1px solid ${COLORES.borde}`,
                borderRadius: 16,
                padding: "24px 22px",
                transition: "all 0.2s",
                cursor: "default",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = COLORES.verdeM;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 30px ${COLORES.borde}`;
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = COLORES.borde;
                (e.currentTarget as HTMLDivElement).style.transform = "none";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORES.verdeL, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon name={p.icon} size={26} color={p.acento} />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 600, color: COLORES.texto, margin: "0 0 8px" }}>{p.nombre}</h3>
              <p style={{ fontSize: 13.5, color: COLORES.textoS, lineHeight: 1.65, margin: "0 0 16px" }}>{p.desc}</p>
              <button
                onClick={onWizard}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: `1px solid ${COLORES.bordeM}`,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORES.verde,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.18s",
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLORES.verdeL; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <Icon name="arrow_forward" size={14} color={COLORES.verde} />
                Solicitar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Diferenciadores = () => {
  const items = [
    { icon: "psychology", titulo: "Análisis IA", desc: "Evaluación inicial de tu perfil en segundos con inteligencia artificial especializada en crédito agropecuario." },
    { icon: "verified_user", titulo: "Respaldo FIRA", desc: "Operamos bajo los estándares y normativas de FIRA–Banco de México para garantizar transparencia y solidez." },
    { icon: "support_agent", titulo: "Asesoría personalizada", desc: "Ejecutivos especializados en agro que conocen tu región y los ciclos productivos de tu actividad." },
    { icon: "speed", titulo: "Respuesta ágil", desc: "Pre-evaluación en menos de 24 horas y dictamen de crédito en tiempos récord para el sector." },
  ];

  return (
    <section style={{ padding: "100px 5vw", background: COLORES.verde }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, color: "#fff", margin: "0 0 14px", fontWeight: 600 }}>
            ¿Por qué Agrocapital?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
            No somos un banco genérico. Somos especialistas en el campo mexicano.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {items.map((item) => (
            <div
              key={item.titulo}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 16,
                padding: "28px 24px",
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon name={item.icon} size={28} color="#fff" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 600, color: "#fff", margin: "0 0 10px" }}>{item.titulo}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Asterra = () => (
  <section style={{ padding: "100px 5vw", background: "#fff" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
      <div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "5px 14px", background: "#fff3e0", borderRadius: 20, border: "1px solid rgba(200,168,75,0.3)" }}>
          <Icon name="shield" size={14} color={COLORES.dorado} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8a6200", textTransform: "uppercase", letterSpacing: "0.08em" }}>Seguro Agrícola</span>
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, color: COLORES.verde, margin: "0 0 16px", fontWeight: 600, lineHeight: 1.2 }}>
          Asterra:<br />
          <span style={{ fontStyle: "italic" }}>Tu cosecha protegida.</span>
        </h2>
        <p style={{ fontSize: 15, color: COLORES.textoS, lineHeight: 1.75, margin: "0 0 28px" }}>
          Minimizamos los riesgos naturales y climáticos que amenazan tu inversión. Seguro agrícola especializado que entiende los ciclos productivos del campo mexicano.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {["Cobertura para sequía, granizo e inundaciones", "Respaldo inmediato ante siniestros declarados", "Integrado con tu crédito Agrocapital"].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: COLORES.texto }}>
              <Icon name="check_circle" size={18} color={COLORES.verdeM} />
              {item}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: COLORES.verdeXL, borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 280 }}>
        <Icon name="grain" size={72} color={COLORES.verde} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 600, color: COLORES.verde }}>Asterra</div>
          <div style={{ fontSize: 13, color: COLORES.textoS, marginTop: 4 }}>Seguro agrícola inteligente</div>
        </div>
      </div>
    </div>
  </section>
);

const CTA = ({ onWizard }: { onWizard: () => void }) => (
  <section style={{ padding: "100px 5vw", background: COLORES.grisF }}>
    <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
      <Icon name="agriculture" size={56} color={COLORES.verde} style={{ marginBottom: 20 }} />
      <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 40, color: COLORES.verde, margin: "0 0 16px", fontWeight: 600, lineHeight: 1.2 }}>
        Comienza tu evaluación hoy. Sin costo, sin compromiso.
      </h2>
      <p style={{ fontSize: 16, color: COLORES.textoS, lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 480 }}>
        Nuestro wizard de perfil crediticio tarda menos de 5 minutos. Al final, un agente de IA analiza tu caso y un ejecutivo real te contacta.
      </p>
      <button
        onClick={onWizard}
        style={{
          padding: "18px 42px",
          background: COLORES.verde,
          color: "#fff",
          border: "none",
          borderRadius: 14,
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          transition: "all 0.2s",
          letterSpacing: "0.01em",
        }}
        onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#005530"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
        onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLORES.verde; (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
      >
        <Icon name="play_circle" size={22} color="#fff" />
        Evaluar mi perfil ahora
      </button>
    </div>
  </section>
);

const Footer = () => (
  <footer id="contacto" style={{ background: "#001f0f", padding: "60px 5vw 32px" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: COLORES.verde, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="eco" size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, color: "#fff" }}>Agrocapital</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 20px", maxWidth: 280 }}>
            SOFOM ENR. Blvd. Antonio Rosales 855 Nte, C.P.81240. Los Mochis, Sinaloa.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { icon: "share", href: "https://www.facebook.com/grupoceres.mx" },
              { icon: "photo_camera", href: "https://www.instagram.com/grupo_ceres/" },
              { icon: "work", href: "https://www.linkedin.com/company-beta/1357707/" },
            ].map((s) => (
              <a
                key={s.icon}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                  transition: "background 0.18s",
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.15)")}
                onMouseOut={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)")}
              >
                <Icon name={s.icon} size={18} color="rgba(255,255,255,0.7)" />
              </a>
            ))}
          </div>
        </div>

        {[
          {
            titulo: "Productos", links: ["Crédito Refaccionario", "Capital de Trabajo", "Hab. o Avío", "Arrendamiento Puro", "Crédito Prendario"],
          },
          {
            titulo: "Empresa", links: ["Agrocapital", "Asterra", "CPC", "Bolsa de trabajo"],
          },
          {
            titulo: "Contacto", links: ["(668) 818 5358", "(668) 818 5328", "atencionaclientes@agrocapital.com.mx", "Los Mochis, Sinaloa"],
          },
        ].map((col) => (
          <div key={col.titulo}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>{col.titulo}</div>
            {col.links.map((link) => (
              <div key={link} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10, lineHeight: 1.5 }}>{link}</div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, maxWidth: 700 }}>
          De conformidad con el artículo 87-J de la Ley General de Organizaciones y Actividades Auxiliares del Crédito, para nuestra constitución y operación como SOFOM ENR, no requerimos autorización de la SHCP. Sujetos a supervisión de la CNBV únicamente para efectos del artículo 56 de la Ley antes citada.
        </div>
        <a href="https://agrocapital.com.mx/assets/aviso_privacidad.pdf" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}>
          Aviso de privacidad
        </a>
      </div>
    </div>
  </footer>
);

// ─── Root Component ───────────────────────────────────────────────────────────

function Landing() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [simuladorOpen, setSimuladorOpen] = useState(false);

  const abrirWizard = () => {
    setSimuladorOpen(false);
    setWizardOpen(true);
  };

  const abrirSimulador = () => {
    setWizardOpen(false);
    setSimuladorOpen(true);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", color: COLORES.texto, overflowX: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,99,55,0.3); border-radius: 3px; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
      `}</style>

      <Navbar onWizard={abrirWizard} onSimulador={abrirSimulador} />
      <Hero onWizard={abrirWizard} />
      <Productos onWizard={abrirWizard} />
      <Diferenciadores />
      <Asterra />
      <CTA onWizard={abrirWizard} />
      <Footer />

      {!wizardOpen && !simuladorOpen && <AsistenteFAQ />}

      {wizardOpen && <Wizard onClose={() => setWizardOpen(false)} />}
      {simuladorOpen && <SimuladorPrestamo onClose={() => setSimuladorOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboardSocio" element={<SocioMayoritario />} />
      </Routes>
    </Router>
  );
}