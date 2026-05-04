import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Separator } from "@/components/ui/separator";

export default function CookiePolicy() {
  const sections = [
    { id: "what", title: "1. What are Cookies?", content: "Cookies are small text files that are placed on your computer or mobile device when you browse websites. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site." },
    { id: "types", title: "2. Types of Cookies We Use", content: "We use strictly necessary cookies for core functionality, performance cookies to understand how visitors use our site, and functional cookies to remember your preferences." },
    { id: "control", title: "3. Controlling Cookies", content: "Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit allaboutcookies.org." },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-32 pb-20">
        <section className="bg-secondary text-secondary-foreground py-20 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Cookie Policy</h1>
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
