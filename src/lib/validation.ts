import { z } from "zod";
export const registrationSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
    phone: z.string().trim().transform(value => value.replace(/[\s()-]/g, "")).refine(value => /^(\+94|0)\d{9}$/.test(value), "Enter a valid Sri Lankan phone number."),
    password: z.string().min(8, "Use at least 8 characters for your password.").max(128),
    district: z.string().trim().min(2).max(200),
});
export function safeRedirect(value: string | null): string {
    if (!value)
        return "/";
    try {
        const decoded = decodeURIComponent(value);
        return decoded.startsWith("/") && !decoded.startsWith("//") && !decoded.includes("\\") && !Array.from(decoded).some(character => character.charCodeAt(0) < 32) ? value : "/";
    }
    catch {
        return "/";
    }
}
export function validateUpload(file: File, maxMB = 5, pdf = true) {
    if (!file.size || file.size > maxMB * 1024 * 1024)
        throw new Error(`Files must be between 1 byte and ${maxMB}MB.`);
    if (!["image/jpeg", "image/png", ...(pdf ? ["application/pdf"] : [])].includes(file.type))
        throw new Error("Use a JPG, PNG" + (pdf ? " or PDF file." : " file."));
}
