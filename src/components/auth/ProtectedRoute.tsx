import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { AuthUser } from "@/lib/auth";

type Role = AuthUser["role"];

/** Full-screen spinner shown while the auth state is being resolved. */
export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
      <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}

/**
 * Guards a route behind authentication and (optionally) a set of roles.
 *
 * - Not signed in  → redirect to /login?redirect=<current path>
 * - Wrong role     → redirect to that user's own dashboard
 */
export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading && !user) return <PageLoader />;

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const home: Record<Role, string> = {
      developer: "/admin",
      admin: "/admin",
      seller: "/dashboard/seller",
      buyer: "/dashboard/buyer",
    };
    return <Navigate to={home[user.role] ?? "/"} replace />;
  }

  return <>{children}</>;
}
