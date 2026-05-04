import { Link } from "react-router-dom";

export default function PostComposer() {
  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-bold">
          <i className="fas fa-user" />
        </div>
        <Link
          to="/login"
          className="flex-1 text-left px-5 py-3 rounded-full bg-muted text-muted-foreground hover:bg-foreground/5 transition"
        >
          Share a service you offer…
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-border">
        <Link to="/login" className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-foreground/5 text-sm font-semibold text-muted-foreground">
          <i className="fas fa-image text-emerald-500" /> Photo
        </Link>
        <Link to="/login" className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-foreground/5 text-sm font-semibold text-muted-foreground">
          <i className="fas fa-tag text-blue-500" /> Service
        </Link>
        <Link to="/login" className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-foreground/5 text-sm font-semibold text-muted-foreground">
          <i className="fas fa-location-dot text-rose-500" /> Location
        </Link>
      </div>
    </div>
  );
}
