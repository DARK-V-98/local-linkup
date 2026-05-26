import { useState } from "react";
import { Link } from "react-router-dom";

const FAQS = [
  {
    q: "How do I know a seller is trustworthy?",
    a: "Every seller on Needlyy goes through a multi-step verification process — ID check, background screening, and skills assessment. Verified sellers carry a blue badge on their profile. You can also read real reviews from past buyers before booking.",
    icon: "fa-shield-halved",
  },
  {
    q: "What happens if a seller doesn't show up?",
    a: "Your payment is protected by the Needlyy Guarantee. If a seller no-shows or doesn't complete the job, you're eligible for a full refund. You can also raise a dispute through your buyer dashboard and our team will resolve it within 24 hours.",
    icon: "fa-money-bill-wave",
  },
  {
    q: "How do I pay? What methods are accepted?",
    a: "You can pay by card (Visa/Mastercard), bank transfer, PayHere, Needlyy Wallet, or cash on service delivery. All digital payments are processed securely. We never store your card details — they're handled by PCI-compliant payment processors.",
    icon: "fa-credit-card",
  },
  {
    q: "Can I get quotes before committing to a booking?",
    a: "Yes — use the Post a Request feature to describe your job and budget. Verified sellers will send you quotes directly. You compare, choose, and only pay when you're ready. There's no obligation to accept any quote.",
    icon: "fa-file-invoice",
  },
  {
    q: "How does the Emergency service work?",
    a: "For urgent situations like pipe bursts, electrical faults, or lockouts — visit /emergency, select your issue, and we'll dispatch the nearest available verified pro within minutes. Surge pricing applies for after-hours emergencies.",
    icon: "fa-triangle-exclamation",
  },
  {
    q: "I'm living overseas. Can I still use Needlyy?",
    a: "Yes — we have a dedicated Overseas service for Sri Lankans living abroad. We'll assign a local property manager who does monthly video inspections, pays your bills, coordinates repairs, and sends reports directly to your WhatsApp. Starting from Rs. 2,500/month.",
    icon: "fa-globe",
  },
  {
    q: "How do I become a seller?",
    a: "Click 'Join Needlyy' and select 'Become a Seller'. You'll complete a 3-step registration with your details, service category, and ID verification. Our admin team reviews applications within 24 hours. Once approved, you can post services and start earning.",
    icon: "fa-briefcase",
  },
  {
    q: "What commission does Needlyy charge sellers?",
    a: "Needlyy charges a 10% platform fee on completed orders. This covers payment processing, customer support, the trust infrastructure, and marketing that brings buyers to your listings. There are no monthly fees — you only pay when you earn.",
    icon: "fa-percent",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  const toggle = (i: number) => setOpen((prev) => (prev === i ? null : i));

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
            <i className="fas fa-circle-question text-primary" /> FAQ
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">
            Common questions
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know about buying and selling on Needlyy.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-2xl overflow-hidden transition-all ${open === i ? "border-primary/30 shadow-soft" : "border-border"}`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-foreground/2 transition"
              >
                <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 transition ${open === i ? "bg-primary text-primary-foreground shadow-glow" : "bg-foreground/5 text-foreground/60"}`}>
                  <i className={`fas ${faq.icon} text-sm`} />
                </span>
                <span className="flex-1 font-bold text-foreground text-sm">{faq.q}</span>
                <i className={`fas fa-chevron-down text-muted-foreground text-xs transition-transform duration-200 shrink-0 ${open === i ? "rotate-180" : ""}`} />
              </button>

              {open === i && (
                <div className="px-6 pb-5 pl-[4.25rem]">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center p-8 bg-foreground/3 rounded-3xl border border-border">
          <div className="font-black text-foreground mb-1">Still have questions?</div>
          <p className="text-sm text-muted-foreground mb-5">Our support team replies within 2 hours on WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/94771234567?text=Hi%20Needly%20Support!%20I%20have%20a%20question."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#20ba5a] transition"
            >
              <i className="fab fa-whatsapp text-lg" /> Chat on WhatsApp
            </a>
            <Link to="/contact" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-2xl font-bold text-sm hover:bg-foreground/5 transition">
              <i className="fas fa-envelope" /> Send Email
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
