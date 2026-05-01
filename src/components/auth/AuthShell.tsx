import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface AuthShellProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function AuthShell({ eyebrow, title, subtitle, children, footer, maxWidth = "max-w-3xl" }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-primary/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-secondary/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative container mx-auto px-4 py-8 md:py-12">
        {/* Logo bar */}
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-secondary text-secondary-foreground shadow-glass group-hover:scale-110 transition">
            <i className="fas fa-bolt text-lg" />
          </span>
          <span className="text-xl font-black tracking-tight">Needlyy</span>
        </Link>

        <div className={`mx-auto ${maxWidth} mt-10 md:mt-14`}>
          <div className="text-center mb-8">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 bg-foreground/5 border border-border rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
                {eyebrow}
              </span>
            )}
            <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{subtitle}</p>}
          </div>

          <div className="bg-background/80 backdrop-blur-xl border border-border rounded-3xl shadow-glass p-6 md:p-10">
            {children}
          </div>

          {footer && <div className="text-center mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </main>
  );
}
