import { useServices } from "@/hooks/useServices";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const DISTRICT_ICONS: Record<string, string> = {
  Colombo: "fa-city", Gampaha: "fa-house-chimney", Kandy: "fa-mountain",
  Galle: "fa-umbrella-beach", Matara: "fa-water", Anuradhapura: "fa-landmark",
  Kurunegala: "fa-seedling", Jaffna: "fa-compass", Online: "fa-wifi",
};

export default function DistrictSection() {
  const navigate = useNavigate();
  const {services}=useServices();
  const counts=useMemo(()=>services.reduce<Record<string,number>>((result,service)=>{result[service.district]=(result[service.district]??0)+1;return result;},Object.fromEntries(Object.keys(DISTRICT_ICONS).map(key=>[key,0]))),[services]);

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
        {Object.keys(DISTRICT_ICONS).map((name) => (
          <button
            key={name}
            onClick={() => navigate(`/browse?district=${encodeURIComponent(name)}`)}
            className="group flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-2xl hover:border-primary hover:bg-primary/5 hover:-translate-y-1 transition-all"
          >
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-foreground/5 group-hover:bg-primary/10 transition text-primary">
              <i className={`fas ${DISTRICT_ICONS[name]} text-lg`} />
            </span>
            <span className="text-xs font-bold text-center leading-tight">{name}</span>
            <span className="text-[10px] text-muted-foreground font-semibold">{counts[name]} services</span>
          </button>
        ))}
      </div>
    </section>
  );
}
