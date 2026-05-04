import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useToast } from "@/hooks/use-toast";
import { MOCK_CATEGORIES } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type SellerType = "individual" | "business";

export default function RegisterSeller() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [type, setType] = useState<SellerType>("individual");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<any>({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
    category: "",
    experience: "",
    city: "",
    bio: "",
    skills: "",
    businessName: "",
    brn: "",
    address: "",
    website: "",
    teamSize: "",
    nic: "",
    idType: "",
    tin: "",
  });

  const [files, setFiles] = useState<Record<string, File>>({});

  const totalSteps = 3;

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [name]: file }));
    }
  };

  const uploadFile = async (userId: string, fileName: string, file: File) => {
    const storageRef = ref(storage, `verifications/${userId}/${fileName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < totalSteps) {
      next();
      return;
    }

    if (formData.password !== formData.confirm) {
      toast({ title: "Passwords mismatch", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Profile Name
      await updateProfile(user, { displayName: formData.name });

      // 3. Upload Verification Files
      const fileUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(files)) {
        fileUrls[key] = await uploadFile(user.uid, key, file);
      }

      // 4. Create Firestore Profile
      const sellerProfile = {
        uid: user.uid,
        type,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        city: formData.city,
        bio: formData.bio,
        skills: formData.skills ? formData.skills.split(",").map((s: string) => s.trim()) : [],
        role: "Seller",
        status: "Pending", // Admin needs to verify
        verificationDocs: fileUrls,
        createdAt: new Date().toISOString(),
        ...(type === "individual" ? {
          experience: formData.experience,
          nic: formData.nic,
          idType: formData.idType,
        } : {
          businessName: formData.businessName,
          brn: formData.brn,
          address: formData.address,
          website: formData.website,
          teamSize: formData.teamSize,
          tin: formData.tin,
        })
      };

      await setDoc(doc(db, "users", user.uid), sellerProfile);

      toast({
        title: "Application submitted!",
        description: "Our admin team will review your verification within 24h.",
      });
      navigate("/dashboard/seller");
    } catch (error: any) {
      toast({ 
        title: "Registration failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      maxWidth="max-w-3xl"
      eyebrow={<><i className="fas fa-briefcase-bolt" /> Pro Application</>}
      title={<>Monetize your <span className="text-primary">Skills.</span></>}
      subtitle="Complete your professional profile to start receiving high-value leads."
      footer={
        <>
          Looking for services?{" "}
          <Link to="/register/buyer" className="font-black text-slate-900 hover:text-primary transition-colors">Switch to Buyer account</Link>
        </>
      }
    >
      {/* Type toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 bg-slate-50 rounded-3xl mb-12 border border-slate-100">
        <TypeToggle active={type === "individual"} onClick={() => setType("individual")} icon="fa-user" label="Individual" sub="Freelancer / Sole Trader" />
        <TypeToggle active={type === "business"} onClick={() => setType("business")} icon="fa-building" label="Business" sub="Registered Company" />
      </div>

      {/* Step indicator */}
      <Stepper step={step} total={totalSteps} labels={["Basic Account", type === "business" ? "Business Profile" : "Professional Info", "Identity Verification"]} />

      <form onSubmit={onSubmit} className="mt-12 space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Full Name" name="name" placeholder="Saman Perera" icon="fa-user" required value={formData.name} onChange={handleChange} />
              <Field label="Phone Number" name="phone" placeholder="+94 77 123 4567" icon="fa-phone" type="tel" required value={formData.phone} onChange={handleChange} />
            </div>
            <Field label="Email Address" name="email" placeholder="you@example.com" icon="fa-envelope" type="email" required value={formData.email} onChange={handleChange} />
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Create Password" name="password" placeholder="••••••••" icon="fa-lock" type="password" required value={formData.password} onChange={handleChange} />
              <Field label="Confirm Password" name="confirm" placeholder="••••••••" icon="fa-lock-keyhole" type="password" required value={formData.confirm} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 2 && type === "individual" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Category</label>
                 <Select onValueChange={(val) => handleSelectChange('category', val)} required>
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-5 font-bold">
                       <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                       {MOCK_CATEGORIES.map((c) => (
                         <SelectItem key={c.slug} value={c.slug} className="rounded-xl py-3 font-bold cursor-pointer">{c.name}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
               </div>
              <Field label="Years of Experience" name="experience" placeholder="5" icon="fa-clock-rotate-left" type="number" min={0} required value={formData.experience} onChange={handleChange} />
            </div>
            <Field label="City of Operation" name="city" placeholder="Colombo" icon="fa-map-pin" required value={formData.city} onChange={handleChange} />
            <TextareaField label="Professional Bio" name="bio" rows={4} placeholder="Describe your expertise and what sets you apart..." icon="fa-feather" required value={formData.bio} onChange={handleChange} />
            <Field label="Skills (comma separated)" name="skills" placeholder="Graphic Design, Branding, Web Development" icon="fa-tags" required value={formData.skills} onChange={handleChange} />
          </div>
        )}

        {step === 2 && type === "business" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Official Business Name" name="businessName" placeholder="Lanka Tech Solutions" icon="fa-building-shield" required value={formData.businessName} onChange={handleChange} />
              <Field label="Registration Number (BRN)" name="brn" placeholder="PV 123456" icon="fa-file-certificate" required value={formData.brn} onChange={handleChange} />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Industry Vertical</label>
                 <Select onValueChange={(val) => handleSelectChange('category', val)} required>
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-5 font-bold">
                       <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                       {MOCK_CATEGORIES.map((c) => (
                         <SelectItem key={c.slug} value={c.slug} className="rounded-xl py-3 font-bold cursor-pointer">{c.name}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Team Capacity</label>
                 <Select onValueChange={(val) => handleSelectChange('teamSize', val)} required>
                    <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-5 font-bold">
                       <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                       {["1-5 Pros", "6-20 Pros", "21-50 Pros", "50+ Enterprise"].map((s) => (
                         <SelectItem key={s} value={s} className="rounded-xl py-3 font-bold cursor-pointer">{s}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
               </div>
            </div>
            <Field label="Registered Address" name="address" placeholder="123 Galle Rd, Colombo 03" icon="fa-location-dot" required value={formData.address} onChange={handleChange} />
            <Field label="Corporate Website (optional)" name="website" placeholder="https://company.lk" icon="fa-globe" type="url" value={formData.website} onChange={handleChange} />
            <TextareaField label="Corporate Profile" name="bio" rows={4} placeholder="Tell us about your team and service specializations..." icon="fa-pen-clip" required value={formData.bio} onChange={handleChange} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 flex gap-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white grid place-items-center shrink-0 shadow-lg">
                <i className="fas fa-shield-check text-xl" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-[900] text-indigo-950 uppercase tracking-widest">Identity Trust Shield</div>
                <p className="text-indigo-700/70 font-bold text-xs leading-relaxed">
                  Verification is mandatory for all premium sellers. Your documents are encrypted and only accessible by authorized compliance officers.
                </p>
              </div>
            </div>

            {type === "individual" ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="NIC / ID Number" name="nic" placeholder="200312345678" icon="fa-id-card" required value={formData.nic} onChange={handleChange} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Type</label>
                    <Select onValueChange={(val) => handleSelectChange('idType', val)} required>
                       <SelectTrigger className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-5 font-bold">
                          <SelectValue placeholder="Select ID Type" />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                          {["NIC Card", "Passport", "Driving License"].map((s) => (
                            <SelectItem key={s} value={s} className="rounded-xl py-3 font-bold cursor-pointer">{s}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <FileField label="ID Front Side" name="idFront" icon="fa-image" onChange={(f) => handleFileChange('idFront', f)} />
                  <FileField label="ID Back Side" name="idBack" icon="fa-image" onChange={(f) => handleFileChange('idBack', f)} />
                </div>
                <FileField label="Verification Selfie" name="selfie" icon="fa-camera-retro" onChange={(f) => handleFileChange('selfie', f)} />
              </div>
            ) : (
              <div className="space-y-6">
                <Field label="Tax Identification Number (TIN)" name="tin" placeholder="123456789-7000" icon="fa-receipt" required value={formData.tin} onChange={handleChange} />
                <div className="grid md:grid-cols-2 gap-6">
                  <FileField label="BRN Certificate" name="brnDoc" icon="fa-file-certificate" onChange={(f) => handleFileChange('brnDoc', f)} />
                  <FileField label="Director's NIC" name="ownerId" icon="fa-id-card" onChange={(f) => handleFileChange('ownerId', f)} />
                </div>
                <FileField label="Tax Certification (Optional)" name="taxDoc" icon="fa-building-columns" onChange={(f) => handleFileChange('taxDoc', f)} />
              </div>
            )}

            <div className="flex items-start gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <Checkbox id="sellerTerms" required className="mt-1 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label htmlFor="sellerTerms" className="text-xs font-bold text-slate-500 leading-relaxed cursor-pointer">
                I confirm that all provided documentation is authentic and current. I agree to comply with <Link to="/terms" className="text-slate-900 underline hover:text-primary transition-colors">Seller Policies</Link>.
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 gap-4">
          {step > 1 ? (
            <Button type="button" onClick={back} variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex gap-3">
              <i className="fas fa-arrow-left-long" /> Previous
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-14 px-10 bg-slate-950 text-white rounded-2xl font-[900] text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center gap-3"
          >
            {loading && <i className="fas fa-spinner fa-spin" />}
            {step < totalSteps ? (<>Continue <i className="fas fa-arrow-right-long" /></>) : (<>Submit Profile <i className="fas fa-paper-plane" /></>)}
          </Button>
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
      className={`text-left rounded-2xl px-5 py-4 transition-all duration-300 flex items-center gap-4 ${
        active ? "bg-white shadow-xl border border-primary/10 ring-4 ring-primary/5" : "hover:bg-white/50 grayscale opacity-60"
      }`}
    >
      <div className={`grid place-items-center w-12 h-12 rounded-xl transition-colors ${active ? "bg-primary text-white shadow-glow" : "bg-slate-200 text-slate-400"}`}>
        <i className={`fas ${icon} text-lg`} />
      </div>
      <div>
        <div className={`font-black text-sm uppercase tracking-wider ${active ? "text-slate-950" : "text-slate-500"}`}>{label}</div>
        <div className={`text-[10px] font-bold ${active ? "text-primary" : "text-slate-400"}`}>{sub}</div>
      </div>
    </button>
  );
}

function Stepper({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-4 px-2">
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1;
        const done = idx < step;
        const active = idx === step;
        return (
          <div key={i} className="flex-1 flex items-center gap-4">
            <div
              className={`grid place-items-center w-10 h-10 rounded-2xl text-xs font-black transition-all duration-500 shrink-0 ${
                done
                  ? "bg-primary text-white shadow-glow"
                  : active
                  ? "bg-slate-950 text-white shadow-xl scale-110"
                  : "bg-slate-100 text-slate-300"
              }`}
            >
              {done ? <i className="fas fa-check" /> : idx}
            </div>
            <div className="hidden md:block">
               <div className={`text-[8px] font-black uppercase tracking-[0.2em] mb-1 ${active ? "text-primary" : "text-slate-300"}`}>Step 0{idx}</div>
               <div className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${active ? "text-slate-950" : "text-slate-400"}`}>
                 {labels[i]}
               </div>
            </div>
            {i < total - 1 && <div className={`flex-1 h-0.5 rounded-full transition-all duration-700 ${done ? "bg-primary" : "bg-slate-100"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, name, icon, ...rest }: { label: string; name: string; icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor={name}>{label}</label>
      <div className="relative group">
        <i className={`fas ${icon} absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors`} />
        <Input
          id={name}
          name={name}
          className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-12 pr-5 font-bold focus-visible:ring-primary transition-all"
          {...rest}
        />
      </div>
    </div>
  );
}

function TextareaField({ label, name, icon, ...rest }: { label: string; name: string; icon: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor={name}>{label}</label>
      <div className="relative group">
        <i className={`fas ${icon} absolute left-5 top-4 text-slate-300 group-focus-within:text-primary transition-colors`} />
        <Textarea
          id={name}
          name={name}
          className="bg-slate-50 border-slate-200 rounded-xl pl-12 pr-5 py-4 font-bold focus-visible:ring-primary transition-all min-h-[120px] resize-none"
          {...rest}
        />
      </div>
    </div>
  );
}

function FileField({ label, name, icon, onChange }: { label: string; name: string; icon: string; onChange?: (file: File | null) => void }) {
  const [filename, setFilename] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFilename(file ? file.name : null);
    if (onChange) onChange(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor={name}>{label}</label>
      <label
        htmlFor={name}
        className="flex items-center gap-5 border-2 border-dashed border-slate-200 rounded-2xl px-6 py-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
      >
        <div className="grid place-items-center w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
          <i className={`fas ${icon} text-slate-400 group-hover:text-white`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="block text-sm font-black text-slate-900 truncate">
            {filename ?? "Select Document"}
          </span>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, JPG (Max 10MB)</span>
        </div>
        <div className="text-[10px] font-[900] text-primary uppercase tracking-[0.2em] border border-primary/20 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
          Browse
        </div>
        <input
          id={name}
          name={name}
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
