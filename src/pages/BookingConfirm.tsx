import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getBookingById } from "@/lib/store";
import { formatPrice } from "@/lib/format";

const STATUS_CONFIG = {
  pending: { label: "Pending Confirmation", color: "text-amber-600 bg-amber-50 border-amber-200", icon: "fa-clock" },
  confirmed: { label: "Confirmed", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: "fa-circle-check" },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-50 border-blue-200", icon: "fa-spinner" },
  completed: { label: "Completed", color: "text-slate-600 bg-slate-50 border-slate-200", icon: "fa-flag-checkered" },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: "fa-xmark" },
};

export default function BookingConfirm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(id ? getBookingById(id) : null);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (id) setBooking(getBookingById(id));
  }, [id]);

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
