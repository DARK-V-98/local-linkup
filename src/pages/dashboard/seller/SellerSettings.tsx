import AccountSecurity from "@/components/auth/AccountSecurity";
import NotificationSettings from "@/components/auth/NotificationSettings";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { SL_DISTRICTS } from "@/data/catalog";
import { useCategories } from "@/hooks/useCategories";
import { getUser,setUser } from "@/lib/auth";
import { isFirebaseConfigured,storage } from "@/lib/firebase";
import { updateUserProfile } from "@/lib/firestore/users";
import { validateUpload } from "@/lib/validation";
import { getDownloadURL,ref,uploadBytes } from "firebase/storage";
import { useRef,useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-layer-group" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-shopping" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-gear" },
];

const AVAILABILITY_OPTIONS = [
  { val: "available", label: "Available", desc: "Accepting new bookings", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { val: "busy", label: "Busy", desc: "Limited availability", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { val: "away", label: "Away", desc: "Not taking bookings", color: "text-rose-600 bg-rose-50 border-rose-200" },
];

export default function SellerSettings() {
  const { categories } = useCategories();
  const user = getUser();

  const [tab, setTab] = useState<"profile" | "availability" | "notifications" | "security">("profile");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    district: user?.district ?? "Colombo",
    bio: user?.bio ?? "",
    sellerCategory: user?.sellerCategory ?? "",
    website: user?.website ?? "",
    facebook: user?.facebook ?? "",
    instagram: user?.instagram ?? "",
  });

  // Availability
  const [availability, setAvailability] = useState(user?.availability ?? "available");
  const [workDays, setWorkDays] = useState(user?.workDays ?? ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [startTime, setStartTime] = useState(user?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(user?.endTime ?? "18:00");
  const [responseTime, setResponseTime] = useState(user?.responseTime ?? "within_hour");

  // Notifications
  const [notifs, setNotifs] = useState({
    newBooking: true,
    bookingUpdate: true,
    review: true,
    promo: false,
    whatsapp: true,
    email: true,
    sms: false,
    ...user?.notificationPreferences,
  });

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day: string) => {
    setWorkDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { validateUpload(file,2,false); } catch(error) { toast.error(error instanceof Error ? error.message : "Invalid image."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB."); return; }
    setUploading(true);
    try {
      if (isFirebaseConfigured && user) {
        const storageRef = ref(storage, `avatars/${user.id}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setAvatarUrl(url);
        await updateUserProfile(user.id, { avatarUrl: url });
        setUser({ ...user, avatarUrl: url });
        toast.success("Photo updated!");
      } else { throw new Error("Please sign in and reconnect before uploading.");
      }
    } catch {
      toast.error("Failed to upload photo.");
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (user) {
        const updates = {
          name: profile.name,
          phone: profile.phone,
          district: profile.district,
          bio: profile.bio,
          sellerCategory: profile.sellerCategory,
          website:profile.website, facebook:profile.facebook, instagram:profile.instagram,
        };
        if (!isFirebaseConfigured) throw new Error("Database is unavailable.");
        await updateUserProfile(user.id, updates);
        setUser({ ...user, ...updates });
        window.dispatchEvent(new Event("needly-auth-change"));
      }
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const persist = async (updates: Parameters<typeof updateUserProfile>[1]) => {
    setSaving(true);
    try { if (!user || !isFirebaseConfigured) throw new Error("Please sign in and reconnect."); await updateUserProfile(user.id,updates);setUser({...user,...updates});toast.success("Settings saved."); }
    catch(error){toast.error(error instanceof Error?error.message:"Could not save settings.");} finally{setSaving(false);}
  };
  const saveAvailability=()=>{if(startTime>=endTime){toast.error("End time must be after start time.");return;} return persist({availability,workDays,startTime,endTime,responseTime});};
  const saveNotifications=()=>persist({notificationPreferences:notifs});

  return (
    <DashboardShell role="Seller" sidebarItems={sellerSidebarItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your profile, availability, and preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 flex-wrap">
        {(["profile", "availability", "notifications", "security"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition ${tab === t ? "bg-white text-slate-900 shadow-soft" : "text-slate-400 hover:text-slate-600"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-900 mb-5">Profile Photo</h3>
              <div className="flex items-center gap-5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-soft border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-brand grid place-items-center text-primary-foreground text-3xl font-black shadow-soft">
                    {profile.name.charAt(0).toUpperCase() || "S"}
                  </div>
                )}
                <div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoChange} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {uploading ? <><i className="fas fa-spinner fa-spin" /> Uploading...</> : <><i className="fas fa-upload" /> Upload Photo</>}
                  </button>
                  <p className="text-xs text-slate-400 mt-2">JPG or PNG · Max 2MB · Square crop recommended</p>
                </div>
              </div>
            </div>

            {/* Basic info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-black text-slate-900">Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} placeholder="Your full name" icon="fa-user" />
                <Field label="Phone / WhatsApp" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} placeholder="+94 77 123 4567" icon="fa-phone" />
              </div>
              <Field label="Email" value={profile.email} onChange={() => toast.info("Your sign-in email is managed by Firebase Authentication.")} placeholder="you@example.com" icon="fa-envelope" type="email" />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">District</label>
                <div className="relative">
                  <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <select
                    value={profile.district}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full bg-background border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none"
                  >
                    {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Primary Service Category</label>
                <div className="relative">
                  <i className="fas fa-layer-group absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <select
                    value={profile.sellerCategory}
                    onChange={(e) => setProfile({ ...profile, sellerCategory: e.target.value })}
                    className="w-full bg-background border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-900 mb-4">About You</h3>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell buyers what makes your service special. Mention your experience, skills, and what you're passionate about..."
                rows={5}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Buyers read this before booking you.</span>
                <span>{profile.bio.length} / 400</span>
              </div>
            </div>

            {/* Social / Links */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-black text-slate-900">Links (optional)</h3>
              <Field label="Website" value={profile.website} onChange={(v) => setProfile({ ...profile, website: v })} placeholder="https://yourbusiness.lk" icon="fa-globe" type="url" />
              <Field label="Facebook" value={profile.facebook} onChange={(v) => setProfile({ ...profile, facebook: v })} placeholder="facebook.com/yourpage" icon="fa-facebook fab" />
              <Field label="Instagram" value={profile.instagram} onChange={(v) => setProfile({ ...profile, instagram: v })} placeholder="@yourhandle" icon="fa-instagram fab" />
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-floppy-disk" />}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {/* Sidebar preview */}
          <div>
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sticky top-24">
              <h3 className="font-black text-slate-900 mb-4 text-sm">Profile Preview</h3>
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-brand text-primary-foreground text-2xl font-black grid place-items-center mx-auto mb-2 shadow-soft">
                  {profile.name.charAt(0).toUpperCase() || "S"}
                </div>
                <div className="font-black text-slate-900">{profile.name || "Your Name"}</div>
                <div className="text-xs text-slate-400">{profile.sellerCategory || "Service Category"}</div>
                <div className="text-xs text-slate-400">{profile.district}</div>
              </div>
              {profile.bio && (
                <p className="text-xs text-slate-600 text-center leading-relaxed border-t border-slate-100 pt-4">
                  {profile.bio.slice(0, 120)}{profile.bio.length > 120 ? "..." : ""}
                </p>
              )}
              <div className="mt-4 flex justify-center gap-3 text-xs font-bold text-slate-500">
                <span><i className="fas fa-circle-check text-emerald-500 mr-1" />Verified</span>
                <span><i className="fas fa-star text-amber-400 mr-1" />New Seller</span>
              </div>
              <Link
                to={`/vendor/${(profile.name || "seller").toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                className="mt-5 block text-center text-xs font-bold text-primary hover:underline"
              >
                View Public Profile <i className="fas fa-arrow-right ml-1" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AVAILABILITY TAB */}
      {tab === "availability" && (
        <div className="max-w-2xl space-y-6">
          {/* Status */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 mb-4">Current Status</h3>
            <div className="grid grid-cols-3 gap-3">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setAvailability(opt.val)}
                  className={`p-4 rounded-2xl border-2 text-left transition ${availability === opt.val ? opt.color + " border-current" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <div className={`text-sm font-black ${availability === opt.val ? "" : "text-slate-900"}`}>{opt.label}</div>
                  <div className={`text-[10px] font-semibold mt-0.5 ${availability === opt.val ? "" : "text-slate-400"}`}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Work days */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 mb-4">Working Days</h3>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`w-12 h-12 rounded-xl font-bold text-sm transition ${workDays.includes(day) ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 mb-4">Working Hours</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <span className="text-slate-400 font-bold mt-4">to</span>
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
            </div>
          </div>

          {/* Response time */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 mb-1">Typical Response Time</h3>
            <p className="text-xs text-slate-400 mb-4">Shown on your profile. Set it honestly — buyers will hold you to this.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: "within_hour", label: "Within 1 hour" },
                { val: "few_hours", label: "Within a few hours" },
                { val: "same_day", label: "Same day" },
                { val: "next_day", label: "Next day" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setResponseTime(opt.val)}
                  className={`py-3 rounded-xl border-2 font-bold text-sm transition ${responseTime === opt.val ? "bg-slate-900 border-slate-900 text-white" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={saveAvailability}
            disabled={saving}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-floppy-disk" />}
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {tab === "notifications" && <NotificationSettings />}

      {tab === "security" && <AccountSecurity />}

    </DashboardShell>
  );
}

function Field({
  label, value, onChange, placeholder, icon, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <i className={`${icon.includes("fab") ? icon : "fas " + icon} absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm`} />
        <input
          type={type}
          value={value}
          readOnly={type === "email"}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-background"
        />
      </div>
    </div>
  );
}
