import { createHash, timingSafeEqual } from "node:crypto";
export const md5 = value => createHash("md5").update(value).digest("hex").toUpperCase();
export const toMinor = value => {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0 || number > 10000000)
        throw new Error("Invalid payment amount");
    return Math.round(number * 100);
};
export function checkoutHash(merchant, order, amount, secret) { return md5(merchant + order + amount + "LKR" + md5(secret)); }
export function validNotification(body, merchant, secret) {
    if (body.merchant_id !== merchant || body.payhere_currency !== "LKR" || !/^[A-Fa-f0-9]{32}$/.test(body.md5sig ?? ""))
        return false;
    const expected = md5(merchant + body.order_id + body.payhere_amount + body.payhere_currency + body.status_code + md5(secret));
    return timingSafeEqual(Buffer.from(expected), Buffer.from(body.md5sig.toUpperCase()));
}
export function canSettle(booking, payment) { return booking.status === "completed" && !!booking.buyerApprovedAt && !payment.test && payment.status === "paid" && payment.method === "payhere" && !payment.released; }
