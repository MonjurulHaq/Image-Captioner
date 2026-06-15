import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Search from "@/pages/Search";
import LostItems from "@/pages/LostItems";
import FoundItems from "@/pages/FoundItems";
import Claims from "@/pages/Claims";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import AiAssistant from "@/pages/AiAssistant";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminClaims from "@/pages/admin/AdminClaims";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && user?.role !== "Admin") return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/search" component={Search} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/lost-items" component={() => <ProtectedRoute component={LostItems} />} />
      <Route path="/found-items" component={() => <ProtectedRoute component={FoundItems} />} />
      <Route path="/claims" component={() => <ProtectedRoute component={Claims} />} />
      <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/ai-assistant" component={() => <ProtectedRoute component={AiAssistant} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminOverview} adminOnly />} />
      <Route path="/admin/claims" component={() => <ProtectedRoute component={AdminClaims} adminOnly />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsers} adminOnly />} />
      <Route path="/admin/analytics" component={() => <ProtectedRoute component={AdminAnalytics} adminOnly />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
