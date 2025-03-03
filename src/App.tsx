
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import AccountSettings from "./pages/AccountSettings";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PlanProtectedRoute } from "./components/PlanProtectedRoute";
import OrganizationSettings from "./pages/OrganizationSettings";
import PlanSettings from "./pages/PlanSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Basic protected routes - just require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/account-settings/organization" element={<OrganizationSettings />} />
              <Route path="/account-settings/plan" element={<PlanSettings />} />
            </Route>
            
            {/* Plan-specific protected routes */}
            {/* Dashboard - requires freelancer or pro plan */}
            <Route element={
              <PlanProtectedRoute 
                requiredPlans={['freelancer', 'pro']} 
                featureName="Dashboard"
              />
            }>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Assistant - requires pro plan */}
            <Route element={
              <PlanProtectedRoute 
                requiredPlans={['pro']} 
                featureName="AI Assistant"
              />
            }>
              {/* The assistant is embedded in the Index page, so we don't need to protect
                  a specific route, but we'll need to add checks in the component itself */}
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
