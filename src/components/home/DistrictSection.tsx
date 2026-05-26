import { useNavigate } from "react-router-dom";

const FEATURED_DISTRICTS = [
  { name: "Colombo", icon: "fa-city", count: 840 },
  { name: "Gampaha", icon: "fa-house-chimney", count: 320 },
  { name: "Kandy", icon: "fa-mountain", count: 280 },
  { name: "Galle", icon: "fa-umbrella-beach", count: 195 },
  { name: "Matara", icon: "fa-water", count: 142 },
  { name: "Anuradhapura", icon: "fa-landmark", count: 98 },
  { name: "Kurunegala", icon: "fa-seedling", count: 115 },
  { name: "Jaffna", icon: "fa-compass", count: 87 },
  { name: "Online", icon: "fa-wifi", count: 620 },
];

export default function DistrictSection() {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto py-12 md:py-20">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
            <i className="fas fa-map-location-dot text-primary" /> Browse by location
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight">Services near you</h2>
          <p className="mt-2 text-sm text-muted-foreground">Find local pros in your district or book online.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3">
        {FEATURED_DISTRICTS.map((d) => (
          <button
            key={d.name}
            onClick={() => navigate(`/browse?district=${encodeURIComponent(d.name)}`)}
            className="group flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-2xl hover:border-primary hover:bg-primary/5 hover:-translate-y-1 transition-all"
          >
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-foreground/5 group-hover:bg-primary/10 transition text-primary">
              <i className={`fas ${d.icon} text-lg`} />
            </span>
            <span className="text-xs font-bold text-center leading-tight">{d.name}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">{d.count}+</span>
          </button>
        ))}
      </div>
    </section>
  );
}
