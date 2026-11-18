import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { LEGAL, LEGAL_PAGES } from "@/lib/legal";
import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

/**
 * Layout for policy pages. Content uses plain h2/h3/p/ul/table markup; styling
 * is applied here so individual pages stay readable as legal text.
 */
export default function LegalShell({ title, summary, children }: { title: string; summary?: string; children: ReactNode }) {
  const { supportEmail, supportPhone } = usePlatformSettings();
  const email = supportEmail || LEGAL.email;
  const phone = supportPhone || LEGAL.phone;
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20">
        <section className="bg-gradient-hero py-14 md:py-20 border-b border-border text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{title}</h1>
            {summary && <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">{summary}</p>}
            <p className="mt-4 text-muted-foreground font-semibold uppercase tracking-widest text-xs">Effective: {LEGAL.effectiveDate}</p>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl py-10 md:py-16 px-4 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)] gap-10">
          <aside className="lg:sticky lg:top-24 self-start">
            <nav aria-label="Policies" className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
              {LEGAL_PAGES.map(p => (
                <NavLink key={p.to} to={p.to}
                  className={({ isActive }) => `shrink-0 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  <i className={`fas ${p.icon} w-4 text-center`} />{p.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 text-[15px] leading-relaxed text-muted-foreground
            [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-3 [&_h2:first-child]:mt-0
            [&_h3]:text-foreground [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5
            [&_strong]:text-foreground [&_a]:text-primary [&_a]:font-semibold hover:[&_a]:underline
            [&_table]:w-full [&_table]:my-4 [&_table]:text-sm [&_th]:text-left [&_th]:text-foreground [&_th]:font-bold [&_th]:bg-muted [&_th]:p-3 [&_td]:p-3 [&_td]:align-top [&_tr]:border-b [&_tr]:border-border">
            {children}

            <section className="mt-12 rounded-2xl border border-border bg-muted/40 p-6">
              <h2>Contact us</h2>
              <ul className="!list-none !pl-0">
                {LEGAL.legalName && <li><strong>Business:</strong> {LEGAL.legalName}</li>}
                {LEGAL.registrationNo && <li><strong>Business Registration No.:</strong> {LEGAL.registrationNo}</li>}
                {LEGAL.address && <li><strong>Address:</strong> {LEGAL.address}</li>}
                <li><strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a></li>
                {phone && <li><strong>Phone:</strong> <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>}
                <li><strong>Online:</strong> <a href="/contact">Contact & Support form</a></li>
              </ul>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
