import { StoredBooking, StatusEvent } from "@/lib/store";
import { timeAgo } from "@/lib/format";

const STEPS: { key: StoredBooking["status"]; label: string; icon: string; desc: string }[] = [
  { key: "pending", label: "Booking Placed", icon: "fa-clock", desc: "Waiting for the seller to respond" },
  { key: "confirmed", label: "Confirmed", icon: "fa-circle-check", desc: "Seller accepted your booking" },
  { key: "in_progress", label: "In Progress", icon: "fa-hammer", desc: "Work is underway" },
  { key: "completed", label: "Completed", icon: "fa-flag-checkered", desc: "Service delivered" },
];

function fmt(at: string): string {
  try {
    const d = new Date(at);
    return d.toLocaleDateString("en-LK", { day: "numeric", month: "short" }) +
      " · " + d.toLocaleTimeString("en-LK", { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function OrderTimeline({ booking }: { booking: StoredBooking }) {
  const history: StatusEvent[] = booking.statusHistory ?? [
    { status: booking.status, at: booking.createdAt },
  ];
  const eventFor = (status: StoredBooking["status"]) =>
    history.find((h) => h.status === status);

  const order = ["pending", "confirmed", "in_progress", "completed"];
  const currentIdx = order.indexOf(booking.status);

  // Cancelled path
  if (booking.status === "cancelled") {
    const cancelEvt = eventFor("cancelled");
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-2">
          <i className="fas fa-route text-primary" /> Order Timeline
        </h3>
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-full bg-red-100 text-red-500 grid place-items-center shrink-0">
            <i className="fas fa-ban text-sm" />
          </span>
          <div>
            <div className="font-bold text-slate-900 text-sm">Booking Cancelled</div>
            {cancelEvt && (
              <div className="text-xs text-slate-400 font-semibold mt-0.5">
                {fmt(cancelEvt.at)} · {timeAgo(new Date(cancelEvt.at))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6">
      <h3 className="text-sm font-black text-slate-900 mb-5 flex items-center gap-2">
        <i className="fas fa-route text-primary" /> Order Timeline
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
        </span>
      </h3>

      <div className="relative">
        {STEPS.map((step, i) => {
          const stepIdx = order.indexOf(step.key);
          const isDone = stepIdx < currentIdx;
          const isCurrent = stepIdx === currentIdx;
          const isFuture = stepIdx > currentIdx;
          const evt = eventFor(step.key);
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className="flex gap-3 relative">
              {/* Connector line */}
              {!isLast && (
                <span
                  className={`absolute left-[17px] top-9 w-0.5 h-[calc(100%-1rem)] ${
                    stepIdx < currentIdx ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />
              )}
              {/* Node */}
              <span
                className={`w-9 h-9 rounded-full grid place-items-center shrink-0 z-10 border-2 ${
                  isCurrent
                    ? "border-primary bg-primary text-white animate-pulse"
                    : isDone
                    ? "border-emerald-400 bg-emerald-400 text-white"
                    : "border-slate-200 bg-white text-slate-300"
                }`}
              >
                <i className={`fas ${isDone ? "fa-check" : step.icon} text-xs`} />
              </span>
              {/* Content */}
              <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                <div className={`font-bold text-sm ${isFuture ? "text-slate-400" : "text-slate-900"}`}>
                  {step.label}
                </div>
                <div className={`text-xs font-semibold mt-0.5 ${isFuture ? "text-slate-300" : "text-slate-500"}`}>
                  {step.desc}
                </div>
                {evt && (
                  <div className="text-[11px] text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                    <i className="fas fa-clock text-[9px]" />
                    {fmt(evt.at)} · {timeAgo(new Date(evt.at))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
