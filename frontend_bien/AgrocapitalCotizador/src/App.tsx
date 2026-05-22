import { useState } from "react";
import "./App.css";
import AsistenteFAQ from "./AsistenteFAQ";

type Item = {
  id: string;
  nombre: string;
  desc: string;
  icon: string;
};

type Rubro = {
  id: string;
  titulo: string;
  descripcion: string;
  icon: string;
};

const RUBROS: Rubro[] = [
  {
    id: "restaurantes",
    titulo: "Restaurantes y alimentos",
    descripcion:
      "Financiamiento para restaurantes, cocinas industriales y negocios de la cadena alimentaria.",
    icon: "restaurant",
  },
  {
    id: "rural",
    titulo: "Negocios rurales",
    descripcion:
      "Impulsa negocios ubicados en comunidades rurales y zonas con actividad económica local.",
    icon: "cottage",
  },
  {
    id: "agricola",
    titulo: "Sector agrícola",
    descripcion:
      "Créditos para maquinaria, siembra, infraestructura, producción e insumos agrícolas.",
    icon: "agriculture",
  },
  {
    id: "transporte",
    titulo: "Transporte alimentario",
    descripcion:
      "Financiamiento para logística, distribución, almacenamiento y transporte de alimentos.",
    icon: "local_shipping",
  },
];

const ACTIVIDADES: Item[] = [
  {
    id: "agro",
    nombre: "Agricultor / Ganadero",
    desc: "Producción agrícola y ganadera",
    icon: "agriculture",
  },
  {
    id: "comercio",
    nombre: "Comercio Rural",
    desc: "Comercio y distribución rural",
    icon: "storefront",
  },
  {
    id: "alimentos",
    nombre: "Restaurante / Alimentos",
    desc: "Servicios de alimentos",
    icon: "restaurant",
  },
  {
    id: "otro",
    nombre: "Otro negocio rural",
    desc: "Otros giros de negocio",
    icon: "business",
  },
];

export default function App() {
  const [rubroActivo, setRubroActivo] = useState<string>("");
  const [actividadId, setActividadId] = useState<string>("");

  const rubro = RUBROS.find((item) => item.id === rubroActivo);
  const actividad = ACTIVIDADES.find((item) => item.id === actividadId);

  const abrirRubro = (id: string) => {
    setRubroActivo((actual) => (actual === id ? "" : id));
    setActividadId("");
  };

  const irARubros = () => {
    const section = document.getElementById("rubros");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <span className="material-symbols-outlined brand-icon">eco</span>

          <div>
            <h1>AGROCAPITAL</h1>
            <p>Financiamiento Inteligente</p>
          </div>
        </div>

        <button className="header-button" type="button" onClick={irARubros}>
          <span className="material-symbols-outlined">account_balance</span>
          Solicitar préstamo
        </button>
      </header>

      <section className="loan-hero">
        <div className="loan-hero-content">
          <div>
            <p className="hero-badge">Financiamiento rural rápido</p>

            <h2>Solicita tu préstamo para hacer crecer tu negocio</h2>

            <p>
              Inicia tu solicitud de crédito agrícola, rural o empresarial en
              minutos. AgroCapital conecta tu actividad con alternativas de
              financiamiento respaldadas para la cadena alimentaria.
            </p>

            <button className="hero-button" type="button" onClick={irARubros}>
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
              Solicita tu préstamo
            </button>
          </div>

          <div className="hero-info-card">
            <span className="material-symbols-outlined hero-big-icon">
              trending_up
            </span>

            <h3>Crédito para la cadena alimentaria</h3>

            <p>
              Restaurantes, comercios rurales, productores, transportistas y
              negocios relacionados con alimentos pueden iniciar su solicitud.
            </p>
          </div>
        </div>
      </section>

      <main className="main-card" id="rubros">
        <section className="rubros-section">
          <div className="rubros-header">
            <p>SECTORES FINANCIADOS</p>

            <h2>Elige el rubro de tu negocio</h2>

            <span>
              Selecciona una categoría para conocer las opciones disponibles e
              iniciar tu solicitud.
            </span>
          </div>

          <div className="rubros-grid">
            {RUBROS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rubro-card ${
                  rubroActivo === item.id ? "rubro-active" : ""
                }`}
                onClick={() => abrirRubro(item.id)}
              >
                <span className="material-symbols-outlined rubro-icon">
                  {item.icon}
                </span>

                <h3>{item.titulo}</h3>

                <p>{item.descripcion}</p>

                <div className="rubro-footer">
                  <span>
                    {rubroActivo === item.id
                      ? "Ocultar opciones"
                      : "Ver opciones"}
                  </span>

                  <span className="material-symbols-outlined">
                    {rubroActivo === item.id ? "expand_less" : "expand_more"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {rubroActivo && (
          <section className="cotizador-wrapper">
            <div className="cotizador-top">
              <div>
                <p className="cotizador-badge">Solicitud de financiamiento</p>

                <h2>
                  Selecciona tu actividad
                  {rubro ? ` en ${rubro.titulo.toLowerCase()}` : ""}
                </h2>
              </div>

              <div className="live-pill">
                <span className="material-symbols-outlined">verified</span>
                Elegibilidad FIRA
              </div>
            </div>

            <section>
              <h2 className="section-title">
                <span className="material-symbols-outlined">groups</span>
                Actividad principal
              </h2>

              <div className="activity-grid">
                {ACTIVIDADES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActividadId(item.id)}
                    className={`option-card ${
                      actividadId === item.id ? "selected" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined option-icon">
                      {item.icon}
                    </span>

                    <div>
                      <h3>{item.nombre}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {actividad && (
              <section className="result">
                <div>
                  <p>Actividad seleccionada</p>

                  <h2>{actividad.nombre}</h2>

                  <span>
                    Tu negocio puede continuar con el proceso de solicitud y
                    validación documental.
                  </span>
                </div>

                <button className="main-button" type="button">
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                  Continuar solicitud
                </button>
              </section>
            )}
          </section>
        )}
      </main>

      <AsistenteFAQ />
    </div>
  );
}