import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { ProfesionalesPage } from './pages/ProfesionalesPage';
import { PerfilPublicoPage } from './pages/PerfilPublicoPage';
import { RegistroPage } from './pages/RegistroPage';
import { DashboardUsuarioPage } from './pages/DashboardUsuarioPage';
import { BuscarPage } from './pages/BuscarPage';
import { ProyectosRSEPage } from './pages/ProyectosRSEPage';
import { LicitacionesPage } from './pages/LicitacionesPage';
import { AdminAuditoriaPage } from './pages/AdminAuditoriaPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar />
          <main className="flex-1 min-h-[calc(100vh-4rem)] flex flex-col">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/proveedores" element={<ProveedoresPage />} />
              <Route path="/profesionales" element={<ProfesionalesPage />} />
              <Route path="/perfil/publico/:id" element={<PerfilPublicoPage />} />
              <Route path="/registro" element={<RegistroPage />} />
              <Route path="/dashboard/usuario" element={<DashboardUsuarioPage />} />
              <Route path="/app/buscar" element={<BuscarPage />} />
              <Route path="/app/proyectos-rse" element={<ProyectosRSEPage />} />
              <Route path="/app/licitaciones" element={<LicitacionesPage />} />
              <Route path="/admin/auditoria" element={<AdminAuditoriaPage />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
