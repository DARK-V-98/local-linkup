import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";

export default function IntellectualProperty() {
  const sections = [
    { id: "ownership", title: "1. Ownership of Content", content: "All content on Needlyy, including text, graphics, logos, icons, and software, is the property of Needlyy or its content suppliers and is protected by Sri Lankan and international copyright laws." },
    { id: "trademarks", title: "2. Trademarks", content: "The Needlyy name, logo, and brand elements are trademarks of Needlyy Sri Lanka. You may not use these trademarks in connection with any product or service that is not Needlyy's without express written permission." },
    { id: "user-content", title: "3. User-Generated Content", content: "By posting content on Needlyy, you represent that you own or have the necessary rights to that content. You grant Needlyy a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for platform purposes." },
    { id: "infringement", title: "4. Copyright Infringement", content: "We respect the intellectual property rights of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please notify our legal team immediately." },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-32 pb-20">
        <section className="bg-slate-800 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-gradient-brand">Intellectual Property</h1>
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
