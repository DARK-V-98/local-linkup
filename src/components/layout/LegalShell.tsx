import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ReactNode } from "react";

export default function LegalShell({ title, lastUpdated, children }: { title: string; lastUpdated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20">
        <section className="bg-gradient-hero py-20 border-b border-border text-center">
           <div className="container mx-auto px-4">
             <h1 className="text-4xl md:text-6xl font-black tracking-tight">{title}</h1>
             <p className="mt-4 text-muted-foreground font-semibold uppercase tracking-widest text-xs">Last updated: {lastUpdated}</p>
           </div>
        </section>

        <section className="container mx-auto max-w-4xl py-16 px-6">
           <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground">
             {children}
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
