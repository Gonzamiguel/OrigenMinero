import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { MockAuthProvider } from './context/MockAuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { RoleSwitcher } from './components/RoleSwitcher';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { ProfesionalesPage } from './pages/ProfesionalesPage';
import { PerfilPublicoPage } from './pages/PerfilPublicoPage';
import { RegistroPage } from './pages/RegistroPage';
import { ProveedorDashboardPage } from './pages/dashboard/ProveedorDashboardPage';
import { ProveedorPerfilPage } from './pages/dashboard/ProveedorPerfilPage';
import { ProfesionalDashboardPage } from './pages/dashboard/ProfesionalDashboardPage';
import { ProfesionalPerfilPage } from './pages/dashboard/ProfesionalPerfilPage';
import { MineraDashboardPage } from './pages/dashboard/MineraDashboardPage';
import { AuditorDashboardPage } from './pages/dashboard/AuditorDashboardPage';
import { AdminGonzaloPage } from './pages/AdminGonzaloPage';
import { DashboardRedirect } from './components/DashboardRedirect';

function App() {
  return (
    <MockAuthProvider>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-1 min-h-[calc(100vh-4rem)] flex flex-col">
              <Routes>
                {/* Nivel 1: Público */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/proveedores" element={<ProveedoresPage />} />
                <Route path="/profesionales" element={<ProfesionalesPage />} />
                <Route path="/perfil/publico/:id" element={<PerfilPublicoPage />} />
                <Route path="/registro" element={<RegistroPage />} />

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
                    path="profesional/perfil"
                    element={
                      <ProtectedRoute allowedRoles={['profesional']}>
                        <ProfesionalPerfilPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="minera"
                    element={
                      <ProtectedRoute allowedRoles={['minera']}>
                        <MineraDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="auditor"
                    element={
                      <ProtectedRoute allowedRoles={['auditor']}>
                        <AuditorDashboardPage />
                      </ProtectedRoute>
                    }
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
            <RoleSwitcher />
          </div>
        </BrowserRouter>
      </AppProvider>
    </MockAuthProvider>
  );
}

export default App;
