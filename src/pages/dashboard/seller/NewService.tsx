import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { MOCK_CATEGORIES, SL_DISTRICTS } from "@/data/mock";
import { addService, generateId } from "@/lib/store";
import { toast } from "sonner";
import { isFirebaseConfigured } from "@/lib/firebase";
import { addFirestoreService } from "@/lib/firestore/services";
import { getUser } from "@/lib/auth";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Technology": "fa-laptop-code",
  "Home Services": "fa-tools",
  "Education": "fa-book-reader",
  "Creative": "fa-paint-brush",
  "Repairs": "fa-wrench",
  "Delivery": "fa-shipping-fast",
  "Agriculture": "fa-seedling",
  "Vehicle Service": "fa-car",
  "Tuition": "fa-graduation-cap",
  "Ayurveda Service": "fa-leaf",
};

const SERVICE_TYPES = ["Fixed Price", "Hourly Service", "Booking Service", "Local Service", "Online Service"];
const PRICE_UNITS = ["project", "hour", "day", "session", "month", "delivery", "unit", "piece", "visit", "person"];

const STEPS = ["Category & Title", "Description", "Pricing & Location", "Preview & Publish"];

export default function NewService() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("project");
  const [type, setType] = useState("Fixed Price");
  const [district, setDistrict] = useState("Colombo");
  const [publishAs, setPublishAs] = useState<"active" | "draft">("active");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const canNext = [
    category && title.trim().length >= 10,
    description.trim().length >= 50,
    price && Number(price) > 0 && district,
    true,
  ][step];

  const handlePublish = async () => {
    if (!category || !title || !description || !price) {
      toast.error("Please complete all required fields.");
      return;
    }
    setSaving(true);
    const user = getUser();
    const serviceId = generateId("SVC");
    const serviceData = {
      id: serviceId,
      title: title.trim(),
      category,
      categoryIcon: `fas ${CATEGORY_ICONS[category] ?? "fa-star"}`,
      description: description.trim(),
      price: Number(price),
      priceUnit,
      type,
      tags,
      district,
      status: publishAs,
      views: 0,
      orders: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
    };
    try {
      // Always write to localStorage
      addService(serviceData);
      // Dual-write to Firestore if Firebase is configured
      if (isFirebaseConfigured && user) {
        await addFirestoreService({
          ...serviceData,
          sellerId: user.id,
          sellerName: user.name,
          sellerPhone: user.phone ?? "",
          sellerVerified: user.verified ?? false,
          badge: user.verified ? "verified" : undefined,
          imageUrl: "",
          reviewCount: 0,
          sellerDistrict: user.district ?? district,
        });
      }
      toast.success(publishAs === "active" ? "Service published! Customers can now find you." : "Service saved as draft.");
      navigate("/dashboard/seller/services");
    } catch (err) {
      console.error("Failed to save service:", err);
      toast.success(publishAs === "active" ? "Service published locally." : "Service saved as draft.");
      navigate("/dashboard/seller/services");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50 transition">
          <i className="fas fa-arrow-left text-slate-500" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Post a New Service</h1>
          <p className="text-slate-500 text-sm">Fill in the details to start getting bookings.</p>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => i < step && setStep(i)}
              className="flex items-center gap-2 group"
            >
              <span className={`w-8 h-8 rounded-full grid place-items-center text-xs font-black transition
                ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"}`}>
                {i < step ? <i className="fas fa-check text-[10px]" /> : i + 1}
              </span>
              <span className={`text-xs font-bold hidden sm:block ${i === step ? "text-slate-900" : "text-slate-400"}`}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-3 ${i < step ? "bg-primary" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        {/* Step 0: Category & Title */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-lg font-black text-slate-900 mb-5">What service are you offering?</h2>
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-wide">Select a Category *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MOCK_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.name)}
                      className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 text-left transition font-semibold text-sm
                        ${category === c.name ? "border-primary bg-primary/5 text-primary" : "border-slate-200 hover:border-primary/40 text-slate-600"}`}
                    >
                      <i className={`${c.icon} text-sm w-4 text-center`} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Service Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Professional WordPress Website Development"
                  className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-slate-400">Minimum 10 characters. Be specific.</span>
                  <span className={`text-xs font-bold ${title.length >= 10 ? "text-emerald-500" : "text-slate-400"}`}>{title.length}/100</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Description & Tags */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-lg font-black text-slate-900 mb-5">Describe your service</h2>

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers exactly what you offer, your experience, what's included, and why they should choose you..."
                  rows={7}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-slate-400">Minimum 50 characters. More detail = more bookings.</span>
                  <span className={`text-xs font-bold ${description.length >= 50 ? "text-emerald-500" : "text-slate-400"}`}>{description.length}/1000</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Tags (optional, max 8)</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={addTag} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition">
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
                        {t}
                        <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500 transition">
                          <i className="fas fa-xmark text-[10px]" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pricing & Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-lg font-black text-slate-900 mb-5">Pricing & availability</h2>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Base Price (Rs.) *</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 5000"
                    type="number"
                    min="0"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Price Unit</label>
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {PRICE_UNITS.map((u) => <option key={u} value={u}>per {u}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-wide">Service Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold border-2 transition
                        ${type === t ? "border-primary bg-primary/5 text-primary" : "border-slate-200 hover:border-primary/40 text-slate-600"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">Service District *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SL_DISTRICTS.filter((d) => d !== "All Districts").map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h2 className="text-lg font-black text-slate-900 mb-5">Preview your listing</h2>

              <div className="border-2 border-primary/20 rounded-3xl overflow-hidden mb-6">
                <div className="relative h-36 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden">
                  <i className={`fas ${CATEGORY_ICONS[category] ?? "fa-star"} text-[6rem] text-slate-200`} />
                  <span className="absolute top-3 left-3 bg-white/95 text-foreground text-xs font-bold px-3 py-1 rounded-full">{category}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-slate-900 text-lg">{title}</h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{description}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-semibold">
                    <i className="fas fa-location-dot text-primary" />{district}
                    <span className="mx-1">·</span>
                    {type}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tags.map((t) => <span key={t} className="bg-foreground/5 text-xs font-semibold px-2.5 py-1 rounded-full">{t}</span>)}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">From</div>
                      <div className="font-black text-slate-900">Rs. {Number(price || 0).toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">per {priceUnit}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-wide">Publish as</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPublishAs("active")}
                    className={`p-4 rounded-2xl border-2 text-left transition
                      ${publishAs === "active" ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-circle-check text-emerald-500" />
                      <span className="font-black text-sm text-slate-900">Live Now</span>
                    </div>
                    <p className="text-xs text-slate-500">Customers can find and book immediately.</p>
                  </button>
                  <button
                    onClick={() => setPublishAs("draft")}
                    className={`p-4 rounded-2xl border-2 text-left transition
                      ${publishAs === "draft" ? "border-slate-500 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <i className="fas fa-pen text-slate-500" />
                      <span className="font-black text-sm text-slate-900">Save as Draft</span>
                    </div>
                    <p className="text-xs text-slate-500">Save and publish later when you're ready.</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3.5 border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              <i className="fas fa-arrow-left text-xs" /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <i className="fas fa-arrow-right text-xs" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground py-3.5 rounded-2xl font-bold text-sm shadow-glow hover:scale-[1.02] transition disabled:opacity-70 disabled:scale-100"
            >
              {saving ? (
                <><i className="fas fa-spinner fa-spin" /> Publishing...</>
              ) : (
                <><i className="fas fa-rocket" /> {publishAs === "active" ? "Publish Service" : "Save Draft"}</>
              )}
            </button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
