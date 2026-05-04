import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface AuthShellProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function AuthShell({ eyebrow, title, subtitle, children, footer, maxWidth = "max-w-3xl" }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      {/* Cinematic background */}
      <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full -ml-48 -mt-48" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full -mr-48 -mb-48" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col">
        {/* Logo bar */}
        <div className="flex justify-center md:justify-start">
           <Link to="/" className="flex items-center gap-3 group">
             <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                <i className="fas fa-n text-white font-black" />
             </div>
             <span className="text-3xl font-black text-white tracking-tighter">Needlyy</span>
           </Link>
        </div>

        <div className={`mx-auto w-full ${maxWidth} mt-12 md:mt-20 flex-1`}>
          <div className="text-center mb-10">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {eyebrow}
              </div>
            )}
            <h1 className="mt-6 text-4xl md:text-6xl font-[900] text-white tracking-tight leading-none">{title}</h1>
            {subtitle && <p className="mt-4 text-slate-400 font-medium text-lg max-w-xl mx-auto">{subtitle}</p>}
          </div>

          <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-14 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              {children}
            </div>
          </div>

          {footer && (
            <div className="text-center mt-10 text-sm font-bold text-slate-500">
              {footer}
            </div>
          )}
        </div>

        {/* Auth Footer */}
        <div className="mt-20 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest pb-8">
           © 2026 Needlyy Marketplace · Secure SSL Encrypted
        </div>
      </div>
    </main>
  );
}
