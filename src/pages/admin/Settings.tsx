import DashboardShell from "@/components/dashboard/DashboardShell";
import { FIRESTORE_DATABASE_ID, isFirebaseConfigured } from "@/lib/firebase";
import { defaultSettings, getPlatformSettings, savePlatformSettings } from "@/lib/firestore/workflows";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export default function Settings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => { getPlatformSettings().then(setSettings).catch(() => setError("Could not load settings. Reconnect before saving.")).finally(() => setBusy(false)); }, []);
    return <DashboardShell><div className="max-w-2xl space-y-6"><h1 className="text-3xl font-black">System settings</h1><p className="text-slate-500">Registration policies are enforced by database security rules.</p>{error && <p role="alert" className="text-red-600">{error}</p>}<form className="bg-white border rounded-3xl p-6 space-y-5" onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
                await savePlatformSettings(settings);
                toast.success("Platform settings saved.");
            }
            catch {
                toast.error("Could not save settings.");
            }
            finally {
                setBusy(false);
            }
        }}>{(["siteName", "supportEmail", "supportPhone", "whatsappNumber"] as const).map(key => <label key={key} className="block text-sm font-bold">{key.replace(/([A-Z])/g, " $1")}<input required={key === "siteName" || key === "supportEmail"} maxLength={254} type={key === "supportEmail" ? "email" : "text"} value={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.value })} className="block w-full rounded-xl border p-3 mt-2"/></label>)}{(["registrationOpen", "newSellerApplications"] as const).map(key => <label key={key} className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.checked })}/>{key === "registrationOpen" ? "Accept new registrations" : "Accept new seller applications"}</label>)}<button disabled={busy || !!error} className="rounded-xl bg-slate-900 text-white p-3 font-bold disabled:opacity-50">Save settings</button></form><section className="border rounded-2xl p-6 text-sm space-y-2"><p>Database: Cloud Firestore · {FIRESTORE_DATABASE_ID}</p><p>Firebase configured: {isFirebaseConfigured ? "Yes" : "No"}</p><p>Payments and private document access use Firebase Functions. Secrets and backups are managed in the Firebase console.</p></section></div></DashboardShell>;
}
