import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// Importamos el dashboard. Nota: la función se llama SocioMayoritario en tu archivo
import SocioMayoritario from './socios/DashboardSocio';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal (Inicio) */}
        <Route path="/" element={
          <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-zinc-900">
            <h1 className="text-5xl font-bold text-cyan-400">
              React + Vite + Tailwind + TS
            </h1>
            <Link 
              to="/dashboard" 
              className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Ir al Dashboard
            </Link>
          </div>
        } />

        {/* Ruta del Dashboard */}
        <Route path="/dashboardSocio" element={<SocioMayoritario />} />
      </Routes>
    </Router>
  )
}

export default App;