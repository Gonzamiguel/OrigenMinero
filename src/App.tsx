import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { ProfesionalesPage } from './pages/ProfesionalesPage';
import { PerfilPublicoPage } from './pages/PerfilPublicoPage';
import { GuestRoute } from './components/GuestRoute';
import { DocumentsDashboardPage } from './pages/dashboard/DocumentsDashboardPage';
import { DocumentsProfesionalPage } from './pages/dashboard/DocumentsProfesionalPage';
import { HistorialPage } from './pages/dashboard/HistorialPage';
import { ProveedorDashboardPage } from './pages/dashboard/ProveedorDashboardPage';
import { ProveedorPerfilPage } from './pages/dashboard/ProveedorPerfilPage';
import { ProfesionalDashboardPage } from './pages/dashboard/ProfesionalDashboardPage';
import { ProfesionalPerfilPage } from './pages/dashboard/ProfesionalPerfilPage';
import { EmpresaBuscarPage } from './pages/dashboard/empresa/EmpresaBuscarPage';
import { EmpresaFavoritosPage } from './pages/dashboard/empresa/EmpresaFavoritosPage';
import { EmpresaLicitacionesPage } from './pages/dashboard/empresa/EmpresaLicitacionesPage';
import { EmpresaPerfilDetallePage } from './pages/dashboard/empresa/EmpresaPerfilDetallePage';
import { EmpresaNominaPage } from './pages/dashboard/empresa/EmpresaNominaPage';
import { AuditorPendientesPage } from './pages/dashboard/auditor/AuditorPendientesPage';
import { AuditorCompletadasPage } from './pages/dashboard/auditor/AuditorCompletadasPage';
import { AuditorPanelPage } from './pages/dashboard/auditor/AuditorPanelPage';
import { AuditorDirectorioPage } from './pages/dashboard/auditor/AuditorDirectorioPage';
import { AuditorVencimientosPage } from './pages/dashboard/auditor/AuditorVencimientosPage';
import { AuditorPerfilDetallePage } from './pages/dashboard/auditor/AuditorPerfilDetallePage';
import { AdminGonzaloPage } from './pages/AdminGonzaloPage';
import { DashboardRedirect } from './components/DashboardRedirect';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 min-h-[calc(100vh-4rem)] flex flex-col">
              <Routes>
                {/* Rutas públicas (visitantes) - redirigen a /dashboard si ya están logueados */}
                <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path="/proveedores" element={<ProveedoresPage />} />
                <Route path="/profesionales" element={<ProfesionalesPage />} />
                <Route path="/perfil/publico/:id" element={<PerfilPublicoPage />} />

                {/* Nivel 2: Dashboard (proveedor, minera, auditor) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['proveedor', 'profesional', 'minera', 'auditor']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    path="proveedor"
                    element={
                      <ProtectedRoute allowedRoles={['proveedor']}>
                        <ProveedorDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="documentos"
                    element={
                      <ProtectedRoute allowedRoles={['proveedor', 'profesional']}>
                        <DocumentsDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="historial"
                    element={
                      <ProtectedRoute allowedRoles={['proveedor', 'profesional']}>
                        <HistorialPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="proveedor/perfil"
                    element={
                      <ProtectedRoute allowedRoles={['proveedor']}>
                        <ProveedorPerfilPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profesional"
                    element={
                      <ProtectedRoute allowedRoles={['profesional']}>
                        <ProfesionalDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profesional/documentos"
                    element={
                      <ProtectedRoute allowedRoles={['profesional']}>
                        <DocumentsProfesionalPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profesional/historial"
                    element={
                      <ProtectedRoute allowedRoles={['profesional']}>
                        <HistorialPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profesional/perfil"
                    element={
                      <ProtectedRoute allowedRoles={['profesional']}>
                        <ProfesionalPerfilPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="empresa"
                    element={<Navigate to="/dashboard/empresa/buscar" replace />}
                  />
                  <Route
                    path="empresa/buscar"
                    element={
                      <ProtectedRoute allowedRoles={['minera']}>
                        <EmpresaBuscarPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="empresa/favoritos"
                    element={
                      <ProtectedRoute allowedRoles={['minera']}>
                        <EmpresaFavoritosPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="empresa/nomina"
                    element={
                      <ProtectedRoute allowedRoles={['minera']}>
                        <EmpresaNominaPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="empresa/licitaciones"
                    element={
                      <ProtectedRoute allowedRoles={['minera']}>
                        <EmpresaLicitacionesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="empresa/perfil/:id"
                    element={
                      <ProtectedRoute allowedRoles={['minera']}>
                        <EmpresaPerfilDetallePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="minera"
                    element={<Navigate to="/dashboard/empresa/buscar" replace />}
                  />
                  <Route
                    path="auditor/panel"
                    element={
                      <ProtectedRoute allowedRoles={['auditor']}>
                        <ErrorBoundary>
                          <AuditorPanelPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="auditor/directorio"
                    element={
                      <ProtectedRoute allowedRoles={['auditor']}>
                        <ErrorBoundary>
                          <AuditorDirectorioPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="auditor/directorio/:id"
                    element={
                      <ProtectedRoute allowedRoles={['auditor']}>
                        <ErrorBoundary>
                          <AuditorPerfilDetallePage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="auditor/vencimientos"
                    element={
                      <ProtectedRoute allowedRoles={['auditor']}>
                        <ErrorBoundary>
                          <AuditorVencimientosPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="auditor/pendientes"
                    element={
                      <ProtectedRoute allowedRoles={['auditor']}>
                        <ErrorBoundary>
                          <AuditorPendientesPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="auditor/completadas"
                    element={
                      <ProtectedRoute allowedRoles={['auditor']}>
                        <ErrorBoundary>
                          <AuditorCompletadasPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="auditor"
                    element={<Navigate to="/dashboard/auditor/panel" replace />}
                  />
                  <Route index element={<DashboardRedirect />} />
                </Route>

                {/* Nivel 3: Admin */}
                <Route
                  path="/admin-gonzalo"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminGonzaloPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer />
          </div>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
