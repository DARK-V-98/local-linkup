import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";

export default function Privacy() {
  const sections = [
    { id: "collection", title: "1. Information Collection", content: "We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, phone number, and payment information." },
    { id: "usage", title: "2. How We Use Information", content: "We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you about updates and offers." },
    { id: "cookies", title: "3. Cookie Policy", content: "We use cookies and similar technologies to track activity on our service and hold certain information. Cookies are files with small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent." },
    { id: "sharing", title: "4. Information Sharing", content: "We do not sell your personal information to third parties. We may share information with service providers who perform services for us, or when required by law to protect our rights." },
    { id: "security", title: "5. Data Security", content: "The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security." },
    { id: "rights", title: "6. Your Rights", content: "Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete the data we have about you." },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-32 pb-20">
        <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Privacy Policy</h1>
            <p className="opacity-70 font-medium">Last Updated: May 4, 2026</p>
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
              <h3 className="font-black text-slate-900 mb-2">Privacy Concerns?</h3>
              <p className="text-slate-500 text-sm mb-6">If you have any questions or concerns about how we handle your data, please reach out to our privacy officer.</p>
              <a href="mailto:privacy@needlyy.lk" className="text-primary font-black uppercase text-xs tracking-widest hover:underline">
                privacy@needlyy.lk
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
