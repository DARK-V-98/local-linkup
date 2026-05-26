import { useState } from "react";
import { toast } from "sonner";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  vendorName: string;
  serviceName: string;
  bookingId: string;
}

export default function ReviewModal({ open, onClose, vendorName, serviceName, bookingId }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const QUICK_TAGS = ["Great quality", "On time", "Professional", "Good value", "Would hire again", "Friendly", "Clean work"];

  const toggleTag = (tag: string) => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const STAR_LABELS = ["", "Poor", "Below Average", "Good", "Very Good", "Excellent"];

  const submit = () => {
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 1000);
  };

  const handleClose = () => {
    setRating(0);
    setHover(0);
    setComment("");
    setTags([]);
    setDone(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {!done ? (
          <>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-slate-900 text-lg">Leave a Review</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Booking #{bookingId}</p>
                </div>
                <button onClick={handleClose} className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center hover:bg-slate-200 transition">
                  <i className="fas fa-xmark text-slate-500 text-sm" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Seller info */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-brand text-primary-foreground grid place-items-center font-black text-sm shadow-soft">
                  {vendorName[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{vendorName}</div>
                  <div className="text-xs text-slate-400 truncate max-w-[220px]">{serviceName}</div>
                </div>
              </div>

              {/* Stars */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">How would you rate this service?</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      <i className={`${(hover || rating) >= star ? "fas" : "far"} fa-star ${(hover || rating) >= star ? "text-amber-400" : "text-slate-200"}`} />
                    </button>
                  ))}
                  {(hover || rating) > 0 && (
                    <span className="ml-2 text-sm font-bold text-slate-600">{STAR_LABELS[hover || rating]}</span>
                  )}
                </div>
              </div>

              {/* Quick tags */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">What stood out? <span className="font-normal text-slate-400">(optional)</span></label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${tags.includes(tag) ? "bg-slate-900 border-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
                    >
                      {tags.includes(tag) && <i className="fas fa-check mr-1 text-[9px]" />}{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Written review */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Write a review <span className="font-normal text-slate-400">(optional)</span></label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience — what went well, what could be improved..."
                  rows={3}
                  maxLength={400}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
                <div className="text-right text-[10px] text-slate-400 mt-1">{comment.length} / 400</div>
              </div>

              <button
                onClick={submit}
                disabled={submitting || rating === 0}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <><i className="fas fa-spinner fa-spin" /> Submitting...</> : <><i className="fas fa-paper-plane" /> Submit Review</>}
              </button>
            </div>
          </>
        ) : (
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 grid place-items-center mx-auto mb-5">
              <i className="fas fa-circle-check text-emerald-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Thank you!</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-2">
              Your review helps other buyers choose trusted professionals.
            </p>
            <div className="flex justify-center gap-0.5 mb-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <i key={s} className={`fas fa-star text-lg ${s <= rating ? "text-amber-400" : "text-slate-200"}`} />
              ))}
            </div>
            <button onClick={handleClose} className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
