import { changePassword, getUser, resendVerification } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { submitRequest } from "@/lib/firestore/workflows";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
export default function AccountSecurity() {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [busy, setBusy] = useState(false);
    const run = async (action: () => Promise<unknown>, message: string) => {
        setBusy(true);
        try {
            await action();
            toast.success(message);
        }
        catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not complete this action.");
        }
        finally {
            setBusy(false);
        }
    };
    return <div className="max-w-xl space-y-6">
    <form className="bg-white border rounded-3xl p-6 space-y-4" onSubmit={e => { e.preventDefault(); void run(async () => { await changePassword(current, next, confirm); setCurrent(""); setNext(""); setConfirm(""); }, "Password updated."); }}>
      <h3 className="font-black">Change password</h3>
      {([{ label: "Current password", value: current, set: setCurrent, auto: "current-password" }, { label: "New password", value: next, set: setNext, auto: "new-password" }, { label: "Confirm new password", value: confirm, set: setConfirm, auto: "new-password" }]).map(field => <label key={field.label} className="block text-sm font-semibold">{field.label}<input type="password" required autoComplete={field.auto} value={field.value} onChange={e => field.set(e.target.value)} className="block w-full mt-2 rounded-xl border p-3"/></label>)}
      <p className="text-xs text-slate-500">Google accounts can manage their password through Google.</p>
      <button disabled={busy} className="bg-slate-900 text-white rounded-xl p-3 font-bold disabled:opacity-50">Update password</button>
    </form>
    <section className="bg-white border rounded-3xl p-6 space-y-3"><h3 className="font-black">Verification</h3><p>Email: {auth.currentUser?.emailVerified ? "Verified" : "Not verified"}</p><p>Seller identity: {getUser()?.verified ? "Approved" : "Not approved"}</p>
      {!auth.currentUser?.emailVerified && <button disabled={busy} onClick={() => void run(resendVerification, "Verification email sent. Check your inbox.")} className="text-primary font-bold">Send verification email</button>}
      {getUser()?.role === "seller" && <Link to="/dashboard/seller/verification" className="block text-primary font-bold">Manage seller documents</Link>}
      <button disabled={busy} onClick={() => void run(async () => { await auth.currentUser?.reload(); await auth.currentUser?.getIdToken(true); }, "Verification status refreshed.")} className="block text-primary font-bold">Refresh email status</button>
    </section>
    <section className="bg-rose-50 border rounded-3xl p-6 space-y-3"><h3 className="font-black">Account requests</h3><p className="text-sm">Support reviews these requests and any open orders before making changes.</p>
      <button disabled={busy} onClick={() => void run(() => submitRequest("account_deletion", { request: "Please delete my account and review data retention obligations." }), "Deletion request saved for support review.")} className="text-rose-700 font-bold">Request account deletion</button>
    </section>
  </div>;
}
