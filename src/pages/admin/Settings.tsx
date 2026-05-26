import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";

const adminSidebarItems = [
  { label: "Overview", to: "/admin", icon: "fa-chart-pie" },
  { label: "Verifications", to: "/admin/verifications", icon: "fa-user-check" },
  { label: "User Management", to: "/admin/users", icon: "fa-users" },
  { label: "Service Catalog", to: "/admin/services", icon: "fa-layer-group" },
  { label: "Disputes", to: "/admin/disputes", icon: "fa-circle-exclamation" },
  { label: "System Settings", to: "/admin/settings", icon: "fa-gears" },
];

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);

  // Platform settings state
  const [platform, setPlatform] = useState({
    siteName: "Needlyy",
    supportEmail: "support@needlyy.lk",
    supportPhone: "+94 11 234 5678",
    whatsappNumber: "94771234567",
    commissionRate: 10,
    minPayout: 1000,
    maxBookingDays: 30,
    emergencySurge: 1.5,
  });

  const [features, setFeatures] = useState({
    emergencyDispatch: true,
    postRequest: true,
    overseasPackages: true,
    sellerVerification: true,
    buyerProtection: true,
    walletPayments: true,
    reviewSystem: true,
    multiLanguage: true,
  });

  const [maintenance, setMaintenance] = useState({
    maintenanceMode: false,
    registrationOpen: true,
    newSellerApplications: true,
    allowGuestBrowse: true,
  });

  const [seo, setSeo] = useState({
    metaTitle: "Needlyy — Sri Lanka's Local Service Marketplace",
    metaDescription: "Find verified plumbers, electricians, designers and more. Book trusted local services across Sri Lanka in seconds.",
    googleAnalytics: "G-XXXXXXXXXX",
    fbPixel: "",
  });

  const save = (section: string) => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`${section} settings saved.`);
    }, 800);
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div onClick={onChange} className={`w-12 h-6 rounded-full transition cursor-pointer relative shrink-0 ${checked ? "bg-slate-900" : "bg-slate-200"}`}>
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-7" : "left-1"}`} />
    </div>
  );

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">System Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Configure platform-wide settings and feature flags.</p>
      </div>

      <div className="max-w-3xl space-y-8">

        {/* Platform settings */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="font-black text-slate-900 text-lg mb-5">Platform Configuration</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label="Platform Name" value={platform.siteName} onChange={(v) => setPlatform({ ...platform, siteName: v })} />
              <AdminField label="Support Email" value={platform.supportEmail} onChange={(v) => setPlatform({ ...platform, supportEmail: v })} type="email" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label="Support Phone" value={platform.supportPhone} onChange={(v) => setPlatform({ ...platform, supportPhone: v })} />
              <AdminField label="WhatsApp Number" value={platform.whatsappNumber} onChange={(v) => setPlatform({ ...platform, whatsappNumber: v })} />
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Commission Rate (%)</label>
                <input type="number" value={platform.commissionRate} onChange={(e) => setPlatform({ ...platform, commissionRate: +e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Min. Payout (Rs.)</label>
                <input type="number" value={platform.minPayout} onChange={(e) => setPlatform({ ...platform, minPayout: +e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Max Booking Days</label>
                <input type="number" value={platform.maxBookingDays} onChange={(e) => setPlatform({ ...platform, maxBookingDays: +e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Emergency Surge (×)</label>
                <input type="number" step="0.1" value={platform.emergencySurge} onChange={(e) => setPlatform({ ...platform, emergencySurge: +e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
            </div>
          </div>
          <button onClick={() => save("Platform")} disabled={saving}
            className="mt-5 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition disabled:opacity-60 flex items-center gap-2">
            {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-floppy-disk" />} Save Changes
          </button>
        </div>

        {/* Feature flags */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="font-black text-slate-900 text-lg mb-5">Feature Flags</h2>
          <div className="space-y-4">
            {(Object.entries(features) as [keyof typeof features, boolean][]).map(([key, val]) => {
              const labels: Record<string, { label: string; desc: string }> = {
                emergencyDispatch: { label: "Emergency Dispatch", desc: "24/7 emergency service booking" },
                postRequest: { label: "Post a Request", desc: "Thumbtack-style job board" },
                overseasPackages: { label: "Overseas Packages", desc: "Property & family management vertical" },
                sellerVerification: { label: "Seller Verification", desc: "Require ID verification for sellers" },
                buyerProtection: { label: "Buyer Protection", desc: "Rs. 20,000 dispute protection" },
                walletPayments: { label: "Wallet Payments", desc: "Needlyy wallet top-up and cashback" },
                reviewSystem: { label: "Review System", desc: "Allow buyers to leave seller reviews" },
                multiLanguage: { label: "Multi-Language", desc: "EN / Sinhala / Tamil toggle" },
              };
              const info = labels[key];
              return (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{info.label}</div>
                    <div className="text-xs text-slate-400">{info.desc}</div>
                  </div>
                  <Toggle checked={val} onChange={() => setFeatures({ ...features, [key]: !val })} />
                </div>
              );
            })}
          </div>
          <button onClick={() => save("Feature flags")} disabled={saving}
            className="mt-5 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition disabled:opacity-60 flex items-center gap-2">
            {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-floppy-disk" />} Save Flags
          </button>
        </div>

        {/* Access control */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="font-black text-slate-900 text-lg mb-5">Access Control</h2>
          <div className="space-y-4">
            {(Object.entries(maintenance) as [keyof typeof maintenance, boolean][]).map(([key, val]) => {
              const labels: Record<string, { label: string; desc: string; danger?: boolean }> = {
                maintenanceMode: { label: "Maintenance Mode", desc: "Show maintenance page to all visitors", danger: true },
                registrationOpen: { label: "New Registrations", desc: "Allow new buyers and sellers to sign up" },
                newSellerApplications: { label: "Seller Applications", desc: "Accept new seller verification applications" },
                allowGuestBrowse: { label: "Guest Browsing", desc: "Allow non-logged-in users to browse services" },
              };
              const info = labels[key];
              return (
                <div key={key} className={`flex items-center justify-between p-3 rounded-xl ${info.danger && val ? "bg-rose-50 border border-rose-200" : ""}`}>
                  <div>
                    <div className={`text-sm font-bold ${info.danger && val ? "text-rose-700" : "text-slate-900"}`}>{info.label}</div>
                    <div className={`text-xs ${info.danger && val ? "text-rose-500" : "text-slate-400"}`}>{info.desc}</div>
                  </div>
                  <Toggle checked={val} onChange={() => setMaintenance({ ...maintenance, [key]: !val })} />
                </div>
              );
            })}
          </div>
          <button onClick={() => save("Access control")} disabled={saving}
            className="mt-5 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition disabled:opacity-60 flex items-center gap-2">
            {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-floppy-disk" />} Save Access Settings
          </button>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h2 className="font-black text-slate-900 text-lg mb-5">SEO & Analytics</h2>
          <div className="space-y-4">
            <AdminField label="Meta Title" value={seo.metaTitle} onChange={(v) => setSeo({ ...seo, metaTitle: v })} />
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Meta Description</label>
              <textarea value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} rows={2}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label="Google Analytics ID" value={seo.googleAnalytics} onChange={(v) => setSeo({ ...seo, googleAnalytics: v })} placeholder="G-XXXXXXXXXX" />
              <AdminField label="Facebook Pixel ID" value={seo.fbPixel} onChange={(v) => setSeo({ ...seo, fbPixel: v })} placeholder="1234567890" />
            </div>
          </div>
          <button onClick={() => save("SEO")} disabled={saving}
            className="mt-5 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition disabled:opacity-60 flex items-center gap-2">
            {saving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-floppy-disk" />} Save SEO Settings
          </button>
        </div>

        {/* System info */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white">
          <h2 className="font-black text-lg mb-4">System Information</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "Platform Version", val: "v2.4.0" },
              { label: "Database", val: "PostgreSQL 15" },
              { label: "Environment", val: "Production" },
              { label: "Uptime", val: "99.98%" },
              { label: "Last Backup", val: "Today 03:00 AM" },
              { label: "Total Users", val: "18,240" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-white/10 last:border-0">
                <span className="text-slate-400 font-semibold">{r.label}</span>
                <span className="font-bold">{r.val}</span>
              </div>
            ))}
          </div>
          <button onClick={() => toast.info("Backup initiated.")}
            className="mt-4 px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition">
            <i className="fas fa-database mr-1.5" /> Trigger Manual Backup
          </button>
        </div>

      </div>
    </DashboardShell>
  );
}

function AdminField({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
    </div>
  );
}
