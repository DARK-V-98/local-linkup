import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useToast } from "@/hooks/use-toast";
import { MOCK_CATEGORIES } from "@/data/mock";

type SellerType = "individual" | "business";

export default function RegisterSeller() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [type, setType] = useState<SellerType>("individual");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < totalSteps) {
      next();
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "Application submitted (preview)",
        description: "Our admin team will review your verification within 24h.",
      });
      setLoading(false);
      navigate("/");
    }, 800);
  };

  return (
    <AuthShell
      eyebrow={<><i className="fas fa-briefcase" /> Become a Seller</>}
      title={<>Start earning on <span className="text-gradient-brand">Needlyy.</span></>}
      subtitle="Tell us about yourself and your business. Verification keeps the marketplace safe for everyone."
      footer={
        <>
          Looking to hire instead?{" "}
          <Link to="/register/buyer" className="font-bold text-foreground hover:text-primary">Sign up as a buyer</Link>
        </>
      }
    >
      {/* Type toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-foreground/5 rounded-2xl mb-8">
        <TypeToggle active={type === "individual"} onClick={() => setType("individual")} icon="fa-user" label="Individual" sub="Freelancer / sole trader" />
        <TypeToggle active={type === "business"} onClick={() => setType("business")} icon="fa-building" label="Business" sub="Registered company" />
      </div>

      {/* Step indicator */}
      <Stepper step={step} total={totalSteps} labels={["Account", type === "business" ? "Business" : "Profile", "Verification"]} />

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {step === 1 && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full name" name="name" placeholder="Saman Perera" icon="fa-user" required />
              <Field label="Phone" name="phone" placeholder="+94 77 123 4567" icon="fa-phone" type="tel" required />
            </div>
            <Field label="Email" name="email" placeholder="you@example.com" icon="fa-envelope" type="email" required />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Password" name="password" placeholder="••••••••" icon="fa-lock" type="password" required />
              <Field label="Confirm password" name="confirm" placeholder="••••••••" icon="fa-lock" type="password" required />
            </div>
          </>
        )}

        {step === 2 && type === "individual" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <SelectField label="Primary category" name="category" icon="fa-layer-group" required>
                <option value="">Select a category</option>
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </SelectField>
              <Field label="Years of experience" name="experience" placeholder="3" icon="fa-clock" type="number" min={0} required />
            </div>
            <Field label="City" name="city" placeholder="Colombo" icon="fa-location-dot" required />
            <TextareaField label="About you" name="bio" rows={4} placeholder="Tell buyers what makes your service special..." icon="fa-pen" required />
            <Field label="Skills (comma separated)" name="skills" placeholder="Plumbing, Pipe fitting, Leak repair" icon="fa-tags" required />
          </>
        )}

        {step === 2 && type === "business" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Business name" name="businessName" placeholder="Lanka Home Services (Pvt) Ltd" icon="fa-building" required />
              <Field label="Business reg. number" name="brn" placeholder="PV 12345" icon="fa-file-contract" required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <SelectField label="Primary category" name="category" icon="fa-layer-group" required>
                <option value="">Select a category</option>
                {MOCK_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </SelectField>
              <SelectField label="Team size" name="teamSize" icon="fa-people-group" required>
                <option value="">Select size</option>
                <option>1-5</option>
                <option>6-20</option>
                <option>21-50</option>
                <option>50+</option>
              </SelectField>
            </div>
            <Field label="Business address" name="address" placeholder="123 Galle Rd, Colombo 03" icon="fa-location-dot" required />
            <Field label="Website (optional)" name="website" placeholder="https://yourbusiness.lk" icon="fa-globe" type="url" />
            <TextareaField label="About your business" name="bio" rows={4} placeholder="What does your business do?" icon="fa-pen" required />
          </>
        )}

        {step === 3 && (
          <>
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-4 flex gap-3">
              <i className="fas fa-shield-halved text-secondary mt-1" />
              <div className="text-sm">
                <div className="font-bold text-foreground">Verification keeps Needlyy trusted</div>
                <p className="text-muted-foreground mt-1">
                  Your documents are reviewed within 24h by our admin team. They are stored encrypted and never shown publicly.
                </p>
              </div>
            </div>

            {type === "individual" ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="NIC number" name="nic" placeholder="200312345678 / 991234567V" icon="fa-id-card" required />
                  <SelectField label="ID type" name="idType" icon="fa-passport" required>
                    <option>National ID (NIC)</option>
                    <option>Passport</option>
                    <option>Driving license</option>
                  </SelectField>
                </div>
                <FileField label="ID document (front)" name="idFront" icon="fa-id-card" />
                <FileField label="ID document (back)" name="idBack" icon="fa-id-card" />
                <FileField label="Selfie holding ID" name="selfie" icon="fa-camera" />
              </>
            ) : (
              <>
                <Field label="Tax (TIN) number" name="tin" placeholder="123456789-7000" icon="fa-receipt" required />
                <FileField label="Business registration certificate" name="brnDoc" icon="fa-file-contract" />
                <FileField label="Owner's NIC / Passport" name="ownerId" icon="fa-id-card" />
                <FileField label="Tax certificate (optional)" name="taxDoc" icon="fa-receipt" />
              </>
            )}

            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" required className="mt-1 accent-[hsl(var(--primary))]" />
              <span>
                I confirm the information is accurate and I agree to Needlyy's{" "}
                <Link to="/terms" className="text-foreground font-semibold hover:text-primary">Seller Terms</Link>.
              </span>
            </label>
          </>
        )}

        <div className="flex items-center justify-between pt-2 gap-3">
          {step > 1 ? (
            <button type="button" onClick={back} className="px-5 py-3 rounded-full font-semibold border border-border hover:bg-foreground/5 transition inline-flex items-center gap-2">
              <i className="fas fa-arrow-left" /> Back
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-brand text-primary-foreground px-7 py-3 rounded-full font-bold shadow-glow hover:scale-[1.02] transition disabled:opacity-60 inline-flex items-center gap-2"
          >
            {loading ? <i className="fas fa-spinner fa-spin" /> : null}
            {step < totalSteps ? (<>Continue <i className="fas fa-arrow-right" /></>) : (<><i className="fas fa-paper-plane" /> Submit application</>)}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

function TypeToggle({ active, onClick, icon, label, sub }: { active: boolean; onClick: () => void; icon: string; label: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl px-4 py-3 transition flex items-center gap-3 ${
        active ? "bg-background shadow-soft border border-border" : "hover:bg-background/50"
      }`}
    >
      <span className={`grid place-items-center w-10 h-10 rounded-xl ${active ? "bg-gradient-brand text-primary-foreground" : "bg-foreground/10 text-foreground"}`}>
        <i className={`fas ${icon}`} />
      </span>
      <span>
        <span className="block font-bold text-sm">{label}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
    </button>
  );
}

function Stepper({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={i} className="flex-1 flex items-center gap-2">
            <div
              className={`grid place-items-center w-8 h-8 rounded-full text-xs font-bold transition ${
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "bg-foreground text-background"
                  : "bg-foreground/10 text-muted-foreground"
              }`}
            >
              {done ? <i className="fas fa-check" /> : idx}
            </div>
            <span className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"} hidden sm:inline`}>
              {labels[i]}
            </span>
            {i < total - 1 && <div className={`flex-1 h-0.5 rounded-full ${done ? "bg-primary" : "bg-foreground/10"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, name, icon, ...rest }: { label: string; name: string; icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" htmlFor={name}>{label}</label>
      <div className="relative">
        <i className={`fas ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm`} />
        <input
          id={name}
          name={name}
          className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          {...rest}
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, icon, children, ...rest }: { label: string; name: string; icon: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" htmlFor={name}>{label}</label>
      <div className="relative">
        <i className={`fas ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm`} />
        <select
          id={name}
          name={name}
          className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition appearance-none"
          {...rest}
        >
          {children}
        </select>
        <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none" />
      </div>
    </div>
  );
}

function TextareaField({ label, name, icon, ...rest }: { label: string; name: string; icon: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" htmlFor={name}>{label}</label>
      <div className="relative">
        <i className={`fas ${icon} absolute left-4 top-4 text-muted-foreground text-sm`} />
        <textarea
          id={name}
          name={name}
          className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition resize-none"
          {...rest}
        />
      </div>
    </div>
  );
}

function FileField({ label, name, icon }: { label: string; name: string; icon: string }) {
  const [filename, setFilename] = useState<string | null>(null);
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" htmlFor={name}>{label}</label>
      <label
        htmlFor={name}
        className="flex items-center gap-3 border-2 border-dashed border-border rounded-xl px-4 py-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition"
      >
        <span className="grid place-items-center w-10 h-10 rounded-xl bg-foreground/5">
          <i className={`fas ${icon} text-muted-foreground`} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold truncate">
            {filename ?? "Click to upload"}
          </span>
          <span className="block text-xs text-muted-foreground">PNG, JPG or PDF · max 5MB</span>
        </span>
        <span className="text-xs font-bold text-primary"><i className="fas fa-cloud-arrow-up mr-1" />Upload</span>
        <input
          id={name}
          name={name}
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(e) => setFilename(e.target.files?.[0]?.name ?? null)}
        />
      </label>
    </div>
  );
}
