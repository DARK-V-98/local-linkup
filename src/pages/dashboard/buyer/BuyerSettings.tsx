import { useState, useRef } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getUser, setUser } from "@/lib/auth";
import { SL_DISTRICTS } from "@/data/mock";
import { toast } from "sonner";
import { isFirebaseConfigured, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateUserProfile } from "@/lib/firestore/users";

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Payment Methods", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Account Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];

export default function BuyerSettings() {
  const user = getUser();
  const [tab, setTab] = useState<"profile" | "notifications" | "security">("profile");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    district: user?.district ?? "Colombo",
    bio: user?.bio ?? "",
  });

  const [notifs, setNotifs] = useState({
    bookingConfirmed: true,
    bookingComplete: true,
    newQuotes: true,
    promo: false,
    whatsapp: true,
    email: true,
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB."); return; }
    setUploading(true);
    try {
      if (isFirebaseConfigured && user && !user.id.startsWith("UDEMO")) {
        const storageRef = ref(storage, `avatars/${user.id}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setAvatarUrl(url);
        setUser({ ...user, avatarUrl: url });
        await updateUserProfile(user.id, { avatarUrl: url });
        toast.success("Photo updated!");
      } else {
        // Local preview only for demo accounts
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
        toast.success("Photo updated (local preview).");
      }
    } catch {
      toast.error("Failed to upload photo. Please try again.");
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
          email: profile.email,
          phone: profile.phone,
          district: profile.district,
          bio: profile.bio,
        };
        setUser({ ...user, ...updates });
        if (isFirebaseConfigured && !user.id.startsWith("UDEMO")) {
          await updateUserProfile(user.id, updates);
        }
        window.dispatchEvent(new Event("needly-auth-change"));
      }
      toast.success("Profile updated.");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell role="Buyer" sidebarItems={buyerSidebarItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Account Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your profile and preferences.</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit mb-8">
        {(["profile", "notifications", "security"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition ${tab === t ? "bg-white text-slate-900 shadow-soft" : "text-slate-400 hover:text-slate-600"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="grid lg:grid-cols-3 gap-8 max-w-4xl">
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-900 mb-5">Profile Photo</h3>
              <div className="flex items-center gap-5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-soft border border-slate-200" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-brand grid place-items-center text-primary-foreground text-3xl font-black shadow-soft">
                    {profile.name.charAt(0).toUpperCase() || "B"}
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
                  <p className="text-xs text-slate-400 mt-2">JPG or PNG · Max 2MB</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
              <h3 className="font-black text-slate-900">Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <SettingsField label="Full Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} placeholder="Your name" icon="fa-user" />
                <SettingsField label="Phone / WhatsApp" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} placeholder="+94 77 123 4567" icon="fa-phone" />
              </div>
              <SettingsField label="Email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} placeholder="you@example.com" icon="fa-envelope" type="email" />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">District</label>
                <div className="relative">
                  <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <select
                    value={profile.district}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none"
                  >
                    {SL_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
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

          {/* Summary card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 h-fit sticky top-24">
            <h3 className="font-black text-slate-900 mb-4 text-sm">Account Summary</h3>
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-brand text-primary-foreground text-2xl font-black grid place-items-center mx-auto mb-2 shadow-soft">
                {profile.name.charAt(0).toUpperCase() || "B"}
              </div>
              <div className="font-black text-slate-900">{profile.name || "Your Name"}</div>
              <div className="text-xs text-slate-400">{profile.district}</div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Member since", val: user?.joinedAt ?? "—" },
                { label: "Total Bookings", val: "8" },
                { label: "Reviews Left", val: "5" },
                { label: "Verified", val: user?.verified ? "Yes ✓" : "No" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-slate-400 font-semibold">{row.label}</span>
                  <span className="font-bold text-slate-900">{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="max-w-xl space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 mb-5">Notify me when...</h3>
            <div className="space-y-4">
              {[
                { key: "bookingConfirmed", label: "Booking confirmed by seller", desc: "When a pro accepts your booking" },
                { key: "bookingComplete", label: "Job marked as complete", desc: "Reminder to leave a review" },
                { key: "newQuotes", label: "New quote received", desc: "For requests you posted on the job board" },
                { key: "promo", label: "Deals & promotions", desc: "Weekly offers from local sellers" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                  <div
                    onClick={() => setNotifs({ ...notifs, [item.key]: !notifs[item.key as keyof typeof notifs] })}
                    className={`w-12 h-6 rounded-full transition cursor-pointer relative shrink-0 ${notifs[item.key as keyof typeof notifs] ? "bg-slate-900" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${notifs[item.key as keyof typeof notifs] ? "left-7" : "left-1"}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="font-black text-slate-900 mb-5">How to reach me</h3>
            <div className="space-y-4">
              {[
                { key: "whatsapp", label: "WhatsApp", icon: "fa-whatsapp fab" },
                { key: "email", label: "Email", icon: "fa-envelope" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-4 cursor-pointer">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-slate-500 shrink-0">
                    <i className={`${item.icon} text-sm`} />
                  </span>
                  <span className="flex-1 text-sm font-bold text-slate-900">{item.label}</span>
                  <div
                    onClick={() => setNotifs({ ...notifs, [item.key]: !notifs[item.key as keyof typeof notifs] })}
                    className={`w-12 h-6 rounded-full transition cursor-pointer relative shrink-0 ${notifs[item.key as keyof typeof notifs] ? "bg-slate-900" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${notifs[item.key as keyof typeof notifs] ? "left-7" : "left-1"}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
          <button onClick={() => toast.success("Preferences saved.")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition">
            Save Preferences
          </button>
        </div>
      )}

      {tab === "security" && (
        <div className="max-w-xl space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-black text-slate-900">Change Password</h3>
            {["Current Password", "New Password", "Confirm New Password"].map((l) => (
              <div key={l}>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">{l}</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input type="password" placeholder="••••••••" className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
              </div>
            ))}
            <button onClick={() => toast.success("Password updated.")} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
              Update Password
            </button>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6">
            <h3 className="font-black text-rose-700 mb-2">Danger Zone</h3>
            <button onClick={() => toast.error("Please contact support to delete your account.")} className="px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition">
              <i className="fas fa-trash mr-1.5" /> Delete Account
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function SettingsField({ label, value, onChange, placeholder, icon, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <i className={`fas ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm`} />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
      </div>
    </div>
  );
}
