import { useMemo, useState } from 'react';
import './App.css';

type FormData = {
  nombre: string;
  ubicacion: string;
  giro: string;
  monto: number;
  concepto: string;
  plazo: number;
  tiie: number;
  puntos: number;
};

type BackendResponse = {
  evaluacion: {
    elegible_fira: boolean;
    motivo_dictamen: string;
  };
  cotizacion_estimada: {
    tasa_anual_aplicada_porcentaje: number;
    monto_autorizado_sugerido: number;
    observaciones_financieras: string;
  };
  siguiente_paso: {
    requiere_documentacion: boolean;
    mensaje_para_usuario: string;
  };
};

const initialState: FormData = {
  nombre: '',
  ubicacion: '',
  giro: '',
  monto: 0,
  concepto: '',
  plazo: 12,
  tiie: 11.25,
  puntos: 4.5
};

function App() {
  const [form, setForm] = useState<FormData>(initialState);
  const [status, setStatus] = useState<'entry' | 'loading' | 'result' | 'accepted'>('entry');
  const [responseData, setResponseData] = useState<BackendResponse | null>(null);
  const [error, setError] = useState<string>('');

  const tasaFinal = useMemo(() => form.tiie + form.puntos, [form.tiie, form.puntos]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'monto' || name === 'plazo' || name === 'tiie' || name === 'puntos'
        ? Number(value)
        : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setError('');
    setResponseData(null);

    try {
      const response = await fetch('/api/cotizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          datos_cliente: {
            nombre_o_razon_social: form.nombre,
            ubicacion: form.ubicacion,
            giro_negocio: form.giro
          },
          solicitud_credito: {
            monto_solicitado: form.monto,
            concepto_inversion: form.concepto,
            plazo_meses: form.plazo
          },
          REGLAS_NEGOCIO_SISTEMA: {
            TIIE_actual: form.tiie,
            puntos_adicionales_configurados: form.puntos
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Servidor respondió con ${response.status}`);
      }

      const data = (await response.json()) as BackendResponse;
      setResponseData(data);
      setStatus('result');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setStatus('result');
    }
  };

  const acceptFinancing = () => setStatus('accepted');

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AgroCapital / FIRA</p>
          <h1>Evaluación de crédito inteligente</h1>
          <p className="subtitle">Valida solicitudes rurales y de la cadena alimentaria con un flujo claro y profesional.</p>
        </div>
      </header>

      <main>
        {status === 'entry' && (
          <form className="card form-card" onSubmit={handleSubmit}>
            <div className="section-title">
              <h2>Datos del cliente</h2>
              <p>Completa la solicitud para que el Agente de IA evalúe la viabilidad.</p>
            </div>

            <div className="grid-2">
              <label>
                <span>Nombre o razón social</span>
                <input name="nombre" value={form.nombre} onChange={handleChange} required />
              </label>
              <label>
                <span>Ubicación</span>
                <input name="ubicacion" value={form.ubicacion} onChange={handleChange} required />
              </label>
            </div>

            <label>
              <span>Giro del negocio</span>
              <input name="giro" value={form.giro} onChange={handleChange} required />
            </label>

            <div className="grid-2">
              <label>
                <span>Monto solicitado</span>
                <input name="monto" type="number" value={form.monto} onChange={handleChange} min={0} required />
              </label>
              <label>
                <span>Plazo (meses)</span>
                <input name="plazo" type="number" value={form.plazo} onChange={handleChange} min={1} required />
              </label>
            </div>

            <label>
              <span>Concepto de inversión</span>
              <textarea name="concepto" value={form.concepto} onChange={handleChange} rows={4} required />
            </label>

            <div className="grid-3">
              <label>
                <span>TIIE actual (%)</span>
                <input name="tiie" type="number" value={form.tiie} onChange={handleChange} step="0.01" min="0" required />
              </label>
              <label>
                <span>Puntos adicionales (%)</span>
                <input name="puntos" type="number" value={form.puntos} onChange={handleChange} step="0.01" min="0" required />
              </label>
              <div className="summary-panel">
                <span>Tasa estimada final</span>
                <strong>{tasaFinal.toFixed(2)}%</strong>
              </div>
            </div>

            <button className="primary-button" type="submit">Analizar viabilidad</button>
          </form>
        )}

        {status === 'loading' && (
          <section className="card loading-card">
            <div className="loader" aria-hidden="true"></div>
            <div>
              <h2>Analizando viabilidad con Agente de IA...</h2>
              <p>Estamos revisando el giro, el concepto y las reglas FIRA. Esto tomará unos segundos.</p>
            </div>
          </section>
        )}

        {status !== 'entry' && status !== 'loading' && (
          <section className="card result-card">
            <div className="result-header">
              <div>
                <span className="status-chip">Dictamen FIRA</span>
                <h2>{responseData ? 'Solicitud evaluada' : 'Resultado parcial'}</h2>
              </div>
              <div className="rate-pill">{tasaFinal.toFixed(2)}%</div>
            </div>

            {error ? (
              <div className="alert error">
                <p>No se pudo obtener el dictamen.</p>
                <small>{error}</small>
              </div>
            ) : (
              <>
                <p className="dictamen-text">{responseData?.evaluacion.motivo_dictamen}</p>

                <div className="metrics-grid">
                  <div>
                    <span>Interés aplicado</span>
                    <strong>{responseData?.cotizacion_estimada.tasa_anual_aplicada_porcentaje.toFixed(2)}%</strong>
                  </div>
                  <div>
                    <span>Monto sugerido</span>
                    <strong>${responseData?.cotizacion_estimada.monto_autorizado_sugerido.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Plazo</span>
                    <strong>{form.plazo} meses</strong>
                  </div>
                </div>

                <p className="note">{responseData?.cotizacion_estimada.observaciones_financieras}</p>
              </>
            )}

            {status === 'result' && !error && (
              <button className="primary-button" type="button" onClick={acceptFinancing}>
                Aceptar Financiamiento
              </button>
            )}
          </section>
        )}

        {status === 'accepted' && (
          <section className="card upload-card">
            <h2>Documentación necesaria</h2>
            <p>Carga tu Buró de Crédito, identificación oficial y RFC para completar la solicitud.</p>

            <label>
              <span>RFC</span>
              <input type="text" placeholder="AAA010101AAA" />
            </label>
            <label>
              <span>Buró de Crédito</span>
              <input type="file" accept="application/pdf,image/*" />
            </label>
            <label>
              <span>Identificación oficial</span>
              <input type="file" accept="application/pdf,image/*" />
            </label>

            <button className="secondary-button" type="button">Enviar documentos</button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
