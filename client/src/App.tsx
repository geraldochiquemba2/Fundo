import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "@/lib/admin-route";

// Pages
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import OdsIndex from "@/pages/ods/index";
import OdsDetail from "@/pages/ods/ods-detail";
import ProjectsIndex from "@/pages/projects/index";
import ProjectDetail from "@/pages/projects/project-detail";

// Company Pages
import CompanyDashboard from "@/pages/company/dashboard";
import CompanyProfile from "@/pages/company/profile";
import CompanyConsumption from "@/pages/company/consumption";
import CompanyPaymentProof from "@/pages/company/payment-proof";
import CompanyHistory from "@/pages/company/history";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCompanies from "@/pages/admin/companies";
import AdminPendingOds from "@/pages/admin/pending-ods";
import AdminPublications from "@/pages/admin/publications";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/ods" component={OdsIndex} />
      <Route path="/ods/:id" component={OdsDetail} />
      <Route path="/projetos" component={ProjectsIndex} />
      <Route path="/projeto/:id" component={ProjectDetail} />
      
      {/* Company Routes */}
      <ProtectedRoute path="/empresa/dashboard" component={CompanyDashboard} role="company" />
      <ProtectedRoute path="/empresa/perfil" component={CompanyProfile} role="company" />
      <ProtectedRoute path="/empresa/consumo" component={CompanyConsumption} role="company" />
      <ProtectedRoute path="/empresa/comprovativo" component={CompanyPaymentProof} role="company" />
      <ProtectedRoute path="/empresa/historico" component={CompanyHistory} role="company" />
      
      {/* Admin Routes */}
      <AdminRoute path="/admin/dashboard" component={AdminDashboard} />
      <AdminRoute path="/admin/empresas" component={AdminCompanies} />
      <AdminRoute path="/admin/ods-pendentes" component={AdminPendingOds} />
      <AdminRoute path="/admin/publicacoes" component={AdminPublications} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
