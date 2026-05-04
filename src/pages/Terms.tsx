import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";

export default function Terms() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing and using Needlyy, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use this website." },
    { id: "services", title: "2. Description of Service", content: "Needlyy is a marketplace connecting buyers with service providers. We do not provide the services ourselves and are not responsible for the quality or delivery of services provided by third-party sellers." },
    { id: "accounts", title: "3. User Accounts", content: "You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate and complete information when creating an account." },
    { id: "payments", title: "4. Payments & Fees", content: "All payments are processed through our secure payment gateway. Needlyy may charge service fees for successful transactions. Fees are non-refundable unless otherwise specified." },
    { id: "ip", title: "5. Intellectual Property", content: "The Needlyy name, logo, and all related content are the exclusive property of Needlyy Sri Lanka. You may not use our branding without prior written consent. Content posted by users remains the property of the user, but you grant Needlyy a license to host and display that content." },
    { id: "termination", title: "6. Termination", content: "We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users." },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-32 pb-20">
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Terms of Service</h1>
            <p className="text-slate-400 font-medium">Last Updated: May 4, 2026</p>
          </div>
        </section>

        <section className="container mx-auto px-4 mt-20">
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-soft border border-slate-100">
            <div className="space-y-12">
              {sections.map((s) => (
                <div key={s.id} id={s.id} className="scroll-mt-32">
                  <h2 className="text-2xl font-black text-slate-900 mb-4">{s.title}</h2>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    {s.content}
                  </p>
                  <Separator className="mt-12 bg-slate-100" />
                </div>
              ))}
            </div>

            <div className="mt-20 p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
              <h3 className="font-black text-slate-900 mb-2">Questions about our terms?</h3>
              <p className="text-slate-500 text-sm mb-6">If you have any questions regarding our Terms of Service or Intellectual Property policies, please contact our legal team.</p>
              <a href="mailto:legal@needlyy.lk" className="text-primary font-black uppercase text-xs tracking-widest hover:underline">
                legal@needlyy.lk
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
