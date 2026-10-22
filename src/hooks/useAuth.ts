import { clearUser, ensureProfileForUser, getUser, resolveRole, setUser, type AuthUser } from "@/lib/auth";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase";
import { onIdTokenChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useSyncExternalStore } from "react";
let snapshot: {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
} = { user: null, loading: isFirebaseConfigured, error: null };
const listeners = new Set<() => void>();
let started = false;
function emit(user: AuthUser | null, loading = false, error: string | null = null) {
    snapshot = { user, loading, error };
    listeners.forEach(listener => listener());
}
function start() {
    if (started)
        return;
    started = true;
    if (!isFirebaseConfigured) {
        clearUser();
        emit(null, false, "Authentication is not configured.");
        return;
    }
    let stopProfile: (() => void) | undefined;
    let generation = 0;
    window.addEventListener("needly-auth-change", () => {
        if (!snapshot.loading && auth.currentUser?.uid === getUser()?.id)
            emit(getUser());
    });
    onIdTokenChanged(auth, async (account) => {
        const version = ++generation;
        stopProfile?.();
        emit(null, true);
        if (!account) {
            clearUser();
            emit(null);
            return;
        }
        try {
            const profile = await ensureProfileForUser(account);
            if (version !== generation)
                return;
            setUser(profile);
            emit(profile);
            stopProfile = onSnapshot(doc(db, "users", account.uid), document => {
                if (version !== generation)
                    return;
                if (!document.exists() || document.data().status === "suspended") {
                    clearUser();
                    emit(null, false, "Your account is unavailable. Contact support.");
                    return;
                }
                const data = document.data() as AuthUser;
                const user = { ...data, id: account.uid, email: account.email ?? "", emailVerified: account.emailVerified, role: resolveRole(account.email ?? "", data.role, account.emailVerified) };
                setUser(user);
                emit(user);
            }, () => { clearUser(); emit(null, false, "Could not verify your account. Please sign in again."); });
        }
        catch (error) {
            if (version !== generation)
                return;
            clearUser();
            emit(null, false, error instanceof Error ? error.message : "Could not verify your account.");
        }
    });
}
export function useAuth() {
    useEffect(start, []);
    return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => snapshot);
}
