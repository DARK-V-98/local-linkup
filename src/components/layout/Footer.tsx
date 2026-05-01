import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-slate-300 mt-24">
      <div className="absolute inset-0 dot-pattern-light opacity-40 pointer-events-none" />
      <div className="container mx-auto relative py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-secondary text-secondary-foreground">
              <i className="fas fa-bolt text-lg" />
            </span>
            <span className="text-xl font-black text-white">Needlyy</span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Sri Lanka's trusted marketplace connecting buyers with verified local pros across every category.
          </p>
          <div className="flex gap-3 mt-5">
            {["facebook-f", "instagram", "x-twitter", "linkedin-in"].map((s) => (
              <a key={s} href="#" className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-primary hover:text-primary-foreground transition">
                <i className={`fab fa-${s} text-sm`} />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Marketplace", links: [["Browse Services", "/"], ["Categories", "/"], ["Top Sellers", "/"]] },
          { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["Careers", "#"]] },
          { title: "Legal", links: [["Terms", "#"], ["Privacy", "#"], ["Trust & Safety", "#"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-bold mb-4 text-sm">{col.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="hover:text-primary transition">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="container mx-auto py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Needlyy. All rights reserved.</span>
          <span className="flex items-center gap-1.5"><i className="fas fa-shield-halved text-primary" /> Verified & secure marketplace in 🇱🇰 Sri Lanka</span>
        </div>
      </div>
    </footer>
  );
}
