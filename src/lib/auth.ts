// ─── AuthUser interface ────────────────────────────────────────────────────────
/**
 * The site owner / developer account. Whenever this email signs in — or
 * registers, as a buyer or a seller — it is promoted to the `developer` role,
 * which carries every admin power plus developer-only tooling.
 *
 * This client-side check is for UI only. The real enforcement lives in
 * firestore.rules, which reads the email straight off the verified Firebase
 * Auth token and cannot be spoofed from the browser.
 */
export const DEVELOPER_EMAIL = "tikfese@gmail.com";
export type UserRole = "buyer" | "seller" | "admin" | "developer";
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    district: string;
    verified: boolean;
    joinedAt: string;
    bio?: string;
    sellerCategory?: string;
    /** How the seller registered — individuals and businesses verify differently */
    sellerType?: "individual" | "business";
    businessName?: string;
    avatarUrl?: string;
    status?: "active" | "suspended" | "pending";
    emailVerified?: boolean;
    website?: string;
    facebook?: string;
    instagram?: string;
    availability?: string;
    workDays?: string[];
    startTime?: string;
    endTime?: string;
    responseTime?: string;
    notificationPreferences?: Record<string, boolean>;
}
// ─── localStorage layer (sync — used by all existing components) ──────────────
const AUTH_KEY = "needly_auth_user";
// A browser cache is never proof of authentication or a source of privileges.
let sessionUser: AuthUser | null = null;
let registrationPending: Promise<void> | null = null;
export function getUser(): AuthUser | null { return sessionUser; }
export function setUser(user: AuthUser): void {
    sessionUser = user;
    localStorage.removeItem(AUTH_KEY);
    // Notify same-window listeners (Header, etc.)
    window.dispatchEvent(new CustomEvent("needly-auth-change"));
}
export function clearUser(): void {
    sessionUser = null;
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new CustomEvent("needly-auth-change"));
}
export function isLoggedIn(): boolean {
    return getUser() !== null;
}
/** True for the owner account — the only role above `admin`. */
export function isDeveloper(user = getUser()): boolean {
    return user?.role === "developer";
}
/** Developer and admin share every admin surface; developer adds more on top. */
export function hasAdminAccess(user = getUser()): boolean {
    return user?.role === "admin" || user?.role === "developer";
}
/**
 * Resolves the effective role for an email at sign-in / sign-up time.
 * The owner email always outranks whatever is stored on the profile.
 */
export function resolveRole(email: string, storedRole: UserRole, emailVerified = false): UserRole {
    return emailVerified && email.trim().toLowerCase() === DEVELOPER_EMAIL ? "developer" : storedRole === "developer" ? "buyer" : storedRole;
}
export function genUserId(): string {
    return "U" + Math.random().toString(36).substring(2, 10).toUpperCase();
}
// ─── Firebase Auth (async — used by Login, Register pages) ────────────────────
// These functions are tree-shaken if Firebase is not configured.
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { createUserProfile, ensureUserProfile } from "@/lib/firestore/users";
import { registrationSchema } from "@/lib/validation";
export async function signInWithFirebase(email: string, password: string): Promise<AuthUser> {
    if (!isFirebaseConfigured) {
        throw new Error("Sign-in is unavailable — Firebase is not configured.");
    }
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // Backfills the Firestore profile if it is missing, and applies the
    // owner-email promotion when it already exists.
    const profile = await ensureProfileForUser(cred.user, email);
    setUser(profile);
    return profile;
}
/**
 * Guarantees the signed-in account has a Firestore profile and returns it.
 *
 * Every sign-in path funnels through here, so a user whose document is missing
 * — created before profiles were written, removed by hand, or lost to a failed
 * registration — is backfilled on their next login instead of staying
 * invisible to the admin screens.
 *
 * Defaults are deliberately conservative: role "buyer" and unverified. A
 * backfilled profile must never grant privileges the user did not already have.
 */
export async function ensureProfileForUser(firebaseUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
    emailVerified: boolean;
}, fallbackEmail = ""): Promise<AuthUser> {
    if (registrationPending)
        await registrationPending;
    const email = firebaseUser.email ?? fallbackEmail;
    const seed: Omit<AuthUser, "id"> = {
        name: firebaseUser.displayName ?? email.split("@")[0] ?? "User",
        email,
        phone: firebaseUser.phoneNumber ?? "",
        role: "buyer",
        district: "Colombo",
        verified: false,
        joinedAt: new Date().toISOString().split("T")[0],
        ...(firebaseUser.photoURL ? { avatarUrl: firebaseUser.photoURL } : {}),
    };
    const { profile } = await ensureUserProfile(firebaseUser.uid, seed);
    if (profile.status === "suspended")
        throw new Error("Your account is suspended. Contact support.");
    return { ...profile, id: firebaseUser.uid, email, role: resolveRole(email, profile.role, firebaseUser.emailVerified), emailVerified: firebaseUser.emailVerified } as AuthUser;
}
// Registration creates a least-privilege profile before establishing the session.
type RegistrationData = {
    name: string;
    email: string;
    phone: string;
    password: string;
    district?: string;
    sellerCategory?: string;
    bio?: string;
    sellerType?: "individual" | "business";
    businessName?: string;
};
async function register(data: RegistrationData, role: "buyer" | "seller"): Promise<AuthUser> {
    if (!isFirebaseConfigured)
        throw new Error("Registration is unavailable — Firebase is not configured.");
    const parsed = registrationSchema.parse({ ...data, district: data.district ?? "Colombo" });
    if (role === "seller" && !data.sellerCategory?.trim())
        throw new Error("Select a primary category.");
    const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, deleteUser } = await import("firebase/auth");
    let release!: () => void;
    registrationPending = new Promise<void>(resolve => { release = resolve; });
    let account: import("firebase/auth").User | undefined;
    let persisted = false;
    try {
        const cred = await createUserWithEmailAndPassword(auth, parsed.email, parsed.password);
        account = cred.user;
        await updateProfile(account, { displayName: parsed.name });
        const { password: _password, ...fields } = parsed;
        const userData: Omit<AuthUser, "id"> = {
            name: parsed.name!, email: parsed.email!, phone: parsed.phone!, district: parsed.district!, role, verified: false, joinedAt: new Date().toISOString().split("T")[0],
            ...(role === "seller" ? { sellerCategory: data.sellerCategory, bio: data.bio ?? "", sellerType: data.sellerType ?? "individual", businessName: data.businessName ?? "" } : {}),
        };
        await createUserProfile(account.uid, userData);
        persisted = true;
        // Delivery can be retried from account security if mail is temporarily unavailable.
        await sendEmailVerification(account).catch(() => undefined);
        const profile = { id: account.uid, ...userData, emailVerified: account.emailVerified };
        setUser(profile);
        return profile;
    }
    catch (error) {
        if (account && !persisted) {
            await deleteUser(account).catch(() => signOut(auth));
            clearUser();
        }
        throw error;
    }
    finally {
        release();
        registrationPending = null;
    }
}
export function signUpBuyer(data: RegistrationData): Promise<AuthUser> { return register(data, "buyer"); }
export function signUpSeller(data: RegistrationData): Promise<AuthUser> { return register(data, "seller"); }
export async function changePassword(current: string, next: string, confirm: string) {
    if (!auth.currentUser?.email)
        throw new Error("Please sign in again.");
    if (next.length < 8 || next.length > 128)
        throw new Error("Use 8–128 characters for your password.");
    if (next !== confirm)
        throw new Error("Passwords do not match.");
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth");
    await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, current));
    await updatePassword(auth.currentUser, next);
}
export async function resendVerification() {
    if (!auth.currentUser)
        throw new Error("Please sign in again.");
    const { sendEmailVerification } = await import("firebase/auth");
    await sendEmailVerification(auth.currentUser);
}
export async function signInWithGoogle(): Promise<AuthUser> {
    if (!isFirebaseConfigured) {
        throw new Error("Google Sign-In requires Firebase configuration.");
    }
    const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    const cred = await signInWithPopup(auth, provider);
    // Same guarantee as email sign-in: a Google account always ends up with a
    // Firestore profile, created on first sign-in and backfilled if it went missing.
    const profile = await ensureProfileForUser(cred.user);
    setUser(profile);
    return profile;
}
export async function signOutFirebase(): Promise<void> {
    if (isFirebaseConfigured) {
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
    }
    clearUser();
}
export async function sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured) {
        throw new Error("Password reset requires Firebase configuration.");
    }
    const { sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(auth, email);
}
