import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  Calculator,
  FolderHeart,
  Hash,
  Home,
  LogOut,
  Menu,
  Package,
  ShoppingBasket,
  User,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ActiveSessionBar } from "./ActiveSessionBar";

export const NAV = [
  { to: "/inicio", label: "Inicio", icon: Home },
  { to: "/proyectos", label: "Mis proyectos", icon: FolderHeart },
  { to: "/contadores", label: "Contadores", icon: Hash },
  { to: "/calculadoras", label: "Calculadoras", icon: Calculator },
  { to: "/materiales", label: "Materiales", icon: Package },
  { to: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { to: "/compras", label: "Compras", icon: ShoppingBasket },
  { to: "/comunidad", label: "Comunidad", icon: Users },
] as const;

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={onClick}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          activeProps={{
            className:
              "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
          }}
        >
          <n.icon className="h-5 w-5" /> {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  const footer = (
    <div className="mt-auto flex flex-col gap-1 border-t pt-3">
      <Link
        to="/perfil"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-sidebar-accent"
        activeProps={{ className: "bg-sidebar-accent" }}
      >
        <User className="h-5 w-5" /> Mi perfil
      </Link>
      <button
        onClick={signOut}
        className="flex items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-sidebar-accent"
      >
        <LogOut className="h-5 w-5" /> Cerrar sesión
      </button>
    </div>
  );
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-sidebar p-4 lg:flex">
        <Link to="/inicio" className="mb-6 px-3 font-display text-2xl font-semibold text-primary">
          Teje conmigo
        </Link>
        <NavLinks />
        {footer}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link to="/inicio" className="font-display text-xl font-semibold text-primary">
            Teje conmigo
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-4">
              <SheetTitle className="mb-4 px-3 font-display text-2xl text-primary">
                Teje conmigo
              </SheetTitle>
              <NavLinks onClick={() => setOpen(false)} />
              {footer}
            </SheetContent>
          </Sheet>
        </header>
        <ActiveSessionBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
