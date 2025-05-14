import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Leaf, Menu, ChevronDown, User, FileUp, LogOut } from "lucide-react";
import { HelpButton } from "@/components/onboarding";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Fundo Verde Logo" className="h-8 w-8" />
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">Fundo Verde</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {!user ? (
              // Public Navigation
              <>
                <Link href="/" className={`text-gray-700 hover:text-primary font-medium ${isActive('/') && 'text-primary'}`}>
                  Início
                </Link>
                <Link href="/ods" className={`text-gray-700 hover:text-primary font-medium ${isActive('/ods') && 'text-primary'}`}>
                  ODS
                </Link>
                <Link href="/projetos" className={`text-gray-700 hover:text-primary font-medium ${isActive('/projetos') && 'text-primary'}`}>
                  Projetos
                </Link>
                <Link href="/calculadora" className={`text-gray-700 hover:text-primary font-medium ${isActive('/calculadora') && 'text-primary'}`}>
                  Calculadora
                </Link>
                <div className="ml-6 flex space-x-3">
                  <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
                    <Link href="/auth">Entrar</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth">Registrar</Link>
                  </Button>
                </div>
              </>
            ) : user.role === 'company' ? (
              // Company Navigation
              <>
                <Link href="/empresa/dashboard" className={`text-gray-700 hover:text-primary font-medium ${isActive('/empresa/dashboard') && 'text-primary'}`}>
                  Dashboard
                </Link>
                <Link href="/empresa/consumo" className={`text-gray-700 hover:text-primary font-medium ${isActive('/empresa/consumo') && 'text-primary'}`}>
                  Consumo
                </Link>
                <Link href="/empresa/historico" className={`text-gray-700 hover:text-primary font-medium ${isActive('/empresa/historico') && 'text-primary'}`}>
                  Histórico
                </Link>
                
                <div className="flex items-center space-x-2">
                  <HelpButton />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.company?.logoUrl || undefined} 
                        alt={user.company?.name || "Empresa"} 
                      />
                      <AvatarFallback className="bg-primary text-white">
                        {user.company?.name ? getInitials(user.company.name) : "CO"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700">{user.company?.name || "Empresa"}</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/empresa/perfil" className="cursor-pointer flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/empresa/comprovativo" className="cursor-pointer flex items-center">
                        <FileUp className="mr-2 h-4 w-4" />
                        <span>Enviar Comprovativo</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 cursor-pointer flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Admin Navigation
              <>
                <Link href="/admin/dashboard" className={`text-gray-700 hover:text-primary font-medium ${isActive('/admin/dashboard') && 'text-primary'}`}>
                  Dashboard
                </Link>
                <Link href="/admin/empresas" className={`text-gray-700 hover:text-primary font-medium ${isActive('/admin/empresas') && 'text-primary'}`}>
                  Empresas
                </Link>
                <Link href="/admin/ods-pendentes" className={`text-gray-700 hover:text-primary font-medium ${isActive('/admin/ods-pendentes') && 'text-primary'}`}>
                  ODS Pendentes
                </Link>
                <Link href="/admin/publicacoes" className={`text-gray-700 hover:text-primary font-medium ${isActive('/admin/publicacoes') && 'text-primary'}`}>
                  Publicações
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-white">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700">Admin</span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-red-600 cursor-pointer flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
            {!user ? (
              // Public Navigation Mobile
              <>
                <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Início
                </Link>
                <Link href="/ods" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  ODS
                </Link>
                <Link href="/projetos" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Projetos
                </Link>
                <Link href="/calculadora" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Calculadora
                </Link>
                <Link href="/auth" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10">
                  Entrar
                </Link>
                <Link href="/auth" className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary-600">
                  Registrar
                </Link>
              </>
            ) : user.role === 'company' ? (
              // Company Navigation Mobile
              <>
                <Link href="/empresa/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link href="/empresa/perfil" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Perfil
                </Link>
                <Link href="/empresa/consumo" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Consumo
                </Link>
                <Link href="/empresa/comprovativo" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Enviar Comprovativo
                </Link>
                <Link href="/empresa/historico" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Histórico
                </Link>
                <button 
                  onClick={() => {
                    const { showOnboarding } = require("@/hooks/use-onboarding").useOnboarding();
                    showOnboarding();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  Assistente de introdução
                </button>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  Sair
                </button>
              </>
            ) : (
              // Admin Navigation Mobile
              <>
                <Link href="/admin/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link href="/admin/empresas" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Empresas
                </Link>
                <Link href="/admin/ods-pendentes" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  ODS Pendentes
                </Link>
                <Link href="/admin/publicacoes" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50">
                  Publicações
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  Sair
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
