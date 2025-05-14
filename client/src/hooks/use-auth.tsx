import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserWithCompany } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

type AuthContextType = {
  user: UserWithCompany | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  
  const {
    data: user,
    isLoading,
  } = useQuery<UserWithCompany | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  // Funções simplificadas para login e logout usando o sistema de autenticação Replit
  const login = () => {
    window.location.href = "/api/login";
  };

  const logout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
