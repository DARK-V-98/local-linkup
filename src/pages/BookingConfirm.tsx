import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getBookingById } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "sonner";
import { openPayHereCheckout } from "@/lib/payhere";
import { getWalletBalance, payFromWallet, addTransaction } from "@/lib/wallet";
import { getUser } from "@/lib/auth";
import OrderTimeline from "@/components/OrderTimeline";

type PayStatus = "unpaid" | "paying" | "paid";
const PAYMENT_KEY = "needly_paid_bookings";

const STATUS_CONFIG = {
  pending: { label: "Pending Confirmation", color: "text-amber-600 bg-amber-50 border-amber-200", icon: "fa-clock" },
  confirmed: { label: "Confirmed", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: "fa-circle-check" },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", icon: "fa-spinner" },
  completed: { label: "Completed", color: "text-slate-600 bg-slate-50 border-slate-200", icon: "fa-flag-checkered" },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: "fa-xmark" },
};

function getPaidBookings(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(PAYMENT_KEY) ?? "[]")); } catch { return new Set(); }
}
function markPaid(bookingId: string) {
  const paid = [...getPaidBookings(), bookingId];
  localStorage.setItem(PAYMENT_KEY, JSON.stringify(paid));
}

export default function BookingConfirm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(id ? getBookingById(id) : null);
  const [showFull, setShowFull] = useState(false);
  const [payStatus, setPayStatus] = useState<PayStatus>(() => id && getPaidBookings().has(id) ? "paid" : "unpaid");
  const [payMethod, setPayMethod] = useState<"payhere" | "wallet" | "cash">("payhere");
  const [walletBalance, setWalletBalance] = useState(getWalletBalance());
  usePageTitle(booking ? `Booking #${booking.id}` : "Booking Confirmed");

  useEffect(() => {
    if (id) setBooking(getBookingById(id));
    setWalletBalance(getWalletBalance());
    // Live status updates (cross-tab + same-tab) for real-time timeline
    const onChange = () => { if (id) setBooking(getBookingById(id)); };
    window.addEventListener("needly-bookings-change", onChange);
    window.addEventListener("storage", onChange);
    let bc: BroadcastChannel | undefined;
    try {
      bc = new BroadcastChannel("needly-sync");
      bc.onmessage = (e) => { if (e.data?.type === "bookings-change") onChange(); };
    } catch { /* unsupported */ }
    return () => {
      window.removeEventListener("needly-bookings-change", onChange);
      window.removeEventListener("storage", onChange);
      bc?.close();
    };
  }, [id]);

  const handlePay = async () => {
    if (!booking) return;
    const user = getUser();
    setPayStatus("paying");

    if (payMethod === "wallet") {
      const ok = payFromWallet(booking.price, `Payment for ${booking.serviceTitle}`, booking.id);
      if (ok) {
        markPaid(booking.id);
        setPayStatus("paid");
        setWalletBalance(getWalletBalance());
        toast.success("Payment successful from your Needly Wallet!");
      } else {
        setPayStatus("unpaid");
        toast.error("Insufficient wallet balance. Please top up or use PayHere.");
      }
      return;
    }

    if (payMethod === "cash") {
      markPaid(booking.id);
      setPayStatus("paid");
      toast.success("Cash payment noted. Pay your service provider directly.");
      return;
    }

    // PayHere
    try {
      await openPayHereCheckout({
        orderId: booking.id,
        amount: booking.price * 100, // in cents
        description: booking.serviceTitle,
        customerName: booking.customerName,
        customerEmail: user?.email ?? "customer@needlyy.lk",
        customerPhone: booking.customerPhone,
        district: booking.district,
        onSuccess: (orderId) => {
          markPaid(orderId);
          addTransaction({ type: "payment", desc: `Payment for ${booking.serviceTitle}`, amount: -booking.price, status: "completed", bookingId: orderId });
          setPayStatus("paid");
          toast.success("Payment successful via PayHere! 🎉");
        },
        onDismissed: () => {
          setPayStatus("unpaid");
          toast.info("Payment was cancelled.");
        },
        onError: (err) => {
          setPayStatus("unpaid");
          toast.error(`Payment failed: ${err}`);
        },
      });
    } catch {
      setPayStatus("unpaid");
      toast.error("Could not open PayHere. Please try again.");
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <i className="fas fa-receipt text-5xl text-muted-foreground" />
        <h2 className="text-2xl font-black">Booking not found</h2>
        <p className="text-muted-foreground text-sm text-center">This booking may have expired or the link is invalid.</p>
        <Link to="/browse" className="bg-gradient-brand text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-glow">Browse Services</Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[booking.status];
  const whatsappMsg = encodeURIComponent(`Hi ${booking.vendorName}, I've placed a booking on Needly (Ref: ${booking.id}) for ${booking.serviceTitle} on ${booking.date}${booking.time ? ` at ${booking.time}` : ""}. Please confirm.`);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="pt-20">
        {/* Success banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-10 md:py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-20" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur mb-5">
              <i className="fas fa-circle-check text-4xl" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black">Booking Request Sent!</h1>
            <p className="mt-2 text-emerald-100 text-sm md:text-base">
              {booking.vendorName} will confirm your booking via WhatsApp shortly.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-5 py-2 text-sm font-bold">
              <i className="fas fa-hashtag text-xs" /> Booking ID: {booking.id}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-3xl">
          {/* Status pill */}
          <div className="flex justify-center mb-8">
            <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border ${status.color}`}>
              <i className={`fas ${status.icon}`} /> {status.label}
            </span>
          </div>

          {/* Main booking card */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-glass mb-6">
            <div className="bg-slate-900 text-white p-6 flex items-start gap-4 relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern-light opacity-20" />
              <div className="relative w-14 h-14 rounded-2xl bg-white/10 grid place-items-center shrink-0">
                <i className={`fas ${booking.categoryIcon} text-2xl`} />
              </div>
              <div className="relative">
                <div className="text-xs font-bold text-slate-400 uppercase mb-1">{booking.category}</div>
                <h2 className="text-lg md:text-xl font-black leading-tight">{booking.serviceTitle}</h2>
                <div className="text-sm text-slate-400 mt-1">{booking.district}</div>
              </div>
              <div className="relative ml-auto text-right">
                <div className="text-xs text-slate-400 font-bold">Total</div>
                <div className="text-2xl font-black text-primary">{formatPrice(booking.price)}</div>
              </div>
            </div>

            <div className="p-6 grid sm:grid-cols-2 gap-5">
              {[
                { icon: "fa-calendar", label: "Date", val: booking.date || "To be confirmed" },
                { icon: "fa-clock", label: "Time", val: booking.time || "To be confirmed" },
                { icon: "fa-user", label: "Your Name", val: booking.customerName },
                { icon: "fa-phone", label: "Your Phone", val: booking.customerPhone },
                { icon: "fa-location-dot", label: "District", val: booking.district },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <span className="grid place-items-center w-8 h-8 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <i className={`fas ${r.icon} text-xs`} />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground">{r.label}</div>
                    <div className="text-sm font-bold mt-0.5">{r.val}</div>
                  </div>
                </div>
              ))}

              {booking.notes && (
                <div className="sm:col-span-2 flex items-start gap-3">
                  <span className="grid place-items-center w-8 h-8 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <i className="fas fa-note-sticky text-xs" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground">Notes</div>
                    <div className="text-sm font-bold mt-0.5">{booking.notes}</div>
                  </div>
                </div>
              )}

              {/* Extra fields */}
              {Object.entries(booking.extraData ?? {}).length > 0 && (
                <div className="sm:col-span-2">
                  <button
                    onClick={() => setShowFull(!showFull)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {showFull ? "Hide" : "Show"} additional details
                    <i className={`fas fa-chevron-${showFull ? "up" : "down"} ml-1.5 text-[10px]`} />
                  </button>
                  {showFull && (
                    <div className="mt-3 space-y-2">
                      {Object.entries(booking.extraData).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-semibold">{k}</span>
                          <span className="font-bold">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Vendor contact card */}
          <div className="bg-card border border-border rounded-3xl p-6 mb-6">
            <h3 className="font-black text-base mb-4">Your Service Provider</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="grid place-items-center w-14 h-14 rounded-2xl bg-gradient-brand text-primary-foreground text-xl font-black">
                  {booking.vendorInitial}
                </span>
                {booking.vendorVerified && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground grid place-items-center">
                    <i className="fas fa-check text-[8px]" />
                  </span>
                )}
              </div>
              <div>
                <div className="font-black">{booking.vendorName}</div>
                {booking.vendorVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
                    <i className="fas fa-shield-halved text-[10px]" /> Verified Seller
                  </span>
                )}
              </div>
              <a
                href={`https://wa.me/${booking.vendorPhone.replace(/\D/g, "")}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#20ba5a] transition"
              >
                <i className="fab fa-whatsapp text-lg" /> Chat
              </a>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden mb-6">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-black text-base">Payment</h3>
              {payStatus === "paid" && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black">
                  <i className="fas fa-circle-check" /> Paid
                </span>
              )}
            </div>

            {payStatus === "paid" ? (
              <div className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 grid place-items-center">
                  <i className="fas fa-receipt text-emerald-600 text-lg" />
                </div>
                <div>
                  <div className="font-black text-slate-900">Payment Confirmed</div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    {formatPrice(booking.price)} paid · Ref: {booking.id}
                  </div>
                </div>
                <div className="ml-auto font-black text-emerald-600 text-lg">{formatPrice(booking.price)}</div>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Method selector */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "payhere" as const, label: "PayHere", icon: "fa-mobile-screen", desc: "Card / Bank" },
                    { key: "wallet" as const, label: "Wallet", icon: "fa-wallet", desc: `Rs. ${walletBalance.toLocaleString()}` },
                    { key: "cash" as const, label: "Cash", icon: "fa-money-bills", desc: "Pay on site" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPayMethod(m.key)}
                      className={`p-4 rounded-2xl border-2 text-center transition ${payMethod === m.key ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <i className={`fas ${m.icon} text-xl block mb-1.5 ${payMethod === m.key ? "text-primary" : "text-slate-400"}`} />
                      <div className={`text-xs font-black ${payMethod === m.key ? "text-primary" : "text-slate-900"}`}>{m.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {/* PayHere info */}
                {payMethod === "payhere" && (
                  <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
                    <i className="fas fa-shield-halved text-violet-600 text-lg mt-0.5" />
                    <div className="text-xs text-violet-800">
                      <strong>Secure payment via PayHere.</strong> Supports Visa, Mastercard, Sampath iPay, HNB SOLO, and all major Sri Lankan bank portals. You'll be redirected to PayHere's secure checkout.
                    </div>
                  </div>
                )}

                {/* Wallet info */}
                {payMethod === "wallet" && (
                  <div className={`rounded-2xl p-4 flex items-start gap-3 border ${walletBalance >= booking.price ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                    <i className={`fas ${walletBalance >= booking.price ? "fa-circle-check text-emerald-600" : "fa-triangle-exclamation text-rose-500"} text-lg mt-0.5`} />
                    <div className={`text-xs ${walletBalance >= booking.price ? "text-emerald-800" : "text-rose-700"}`}>
                      {walletBalance >= booking.price
                        ? <><strong>Sufficient balance.</strong> Rs. {walletBalance.toLocaleString()} available. Rs. {booking.price.toLocaleString()} will be deducted.</>
                        : <><strong>Insufficient balance.</strong> You need Rs. {(booking.price - walletBalance).toLocaleString()} more. <Link to="/dashboard/buyer/payments" className="underline font-bold">Top up your wallet →</Link></>}
                    </div>
                  </div>
                )}

                {/* Cash info */}
                {payMethod === "cash" && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                    <i className="fas fa-info-circle text-amber-600 text-lg mt-0.5" />
                    <div className="text-xs text-amber-800">
                      <strong>Pay directly to your service provider.</strong> Bring cash on the day of service. Confirm with them over WhatsApp beforehand.
                    </div>
                  </div>
                )}

                {/* Total row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-sm font-semibold text-slate-500">Total to pay</div>
                  <div className="text-xl font-black text-slate-900">{formatPrice(booking.price)}</div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={payStatus === "paying"}
                  className="w-full bg-gradient-brand text-primary-foreground py-4 rounded-2xl font-bold text-sm shadow-glow hover:scale-[1.02] transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {payStatus === "paying" ? (
                    <><i className="fas fa-spinner fa-spin" /> Processing Payment...</>
                  ) : payMethod === "payhere" ? (
                    <><i className="fas fa-mobile-screen" /> Pay Rs. {booking.price.toLocaleString()} via PayHere</>
                  ) : payMethod === "wallet" ? (
                    <><i className="fas fa-wallet" /> Pay from Wallet</>
                  ) : (
                    <><i className="fas fa-check" /> Confirm Cash Payment</>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Live Order Timeline */}
          <div className="mb-6">
            <OrderTimeline booking={booking} />
          </div>

          {/* What happens next */}
          <div className="bg-card border border-border rounded-3xl p-6 mb-6">
            <h3 className="font-black text-base mb-5">What happens next</h3>
            <div className="space-y-4">
              {[
                { step: 1, icon: "fa-whatsapp fab", color: "bg-[#25D366]", title: "WhatsApp Confirmation", desc: `${booking.vendorName} will send you a WhatsApp confirmation within 30 minutes.` },
                { step: 2, icon: "fa-calendar-check", color: "bg-primary", title: "Day-Before Reminder", desc: "You'll receive an automatic reminder the day before your booking." },
                { step: 3, icon: "fa-handshake", color: "bg-violet-500", title: "Service Completed", desc: "After the job, confirm completion via WhatsApp to release payment." },
                { step: 4, icon: "fa-star", color: "bg-amber-500", title: "Leave a Review", desc: "Rate your experience to help the community find great sellers." },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <span className={`grid place-items-center w-9 h-9 rounded-xl ${s.color} text-white shrink-0`}>
                    <i className={`${s.icon} text-sm`} />
                  </span>
                  <div>
                    <div className="font-bold text-sm">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protection box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden mb-8">
            <div className="absolute inset-0 dot-pattern-light opacity-20" />
            <div className="relative flex items-start gap-4">
              <i className="fas fa-shield-halved text-primary text-3xl shrink-0" />
              <div>
                <h4 className="font-black">Needly Customer Protection</h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  This booking is covered up to <strong className="text-white">Rs. 20,000</strong>. If the service is not delivered as promised, contact us within 72 hours for a full review and refund.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard/buyer/orders" className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition">
              <i className="fas fa-list-check" /> View All Bookings
            </Link>
            <Link to="/browse" className="flex-1 flex items-center justify-center gap-2 bg-card border border-border py-3.5 rounded-2xl font-bold hover:bg-foreground/5 transition">
              <i className="fas fa-magnifying-glass" /> Browse More Services
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
