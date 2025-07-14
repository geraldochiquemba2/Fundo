import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface AdminRouteProps {
  path: string;
  component: () => React.JSX.Element;
}

export function AdminRoute({
  path,
  component: Component,
}: AdminRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Check if the user is an admin
  if (user.role !== 'admin') {
    return (
      <Route path={path}>
        <Redirect to="/empresa/dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />
}
