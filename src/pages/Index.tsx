import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Search, MapPin, ShieldCheck, MessageCircle, CalendarCheck, ChevronRight, Heart, Star, SlidersHorizontal, Check } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { usePageTitle } from "@/lib/usePageTitle";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import { SL_DISTRICTS } from "@/data/catalog";
import { formatPrice } from "@/lib/format";
import { getSaved, toggleSaved } from "@/lib/saved";
import { getUser } from "@/lib/auth";
import CategoryIcon from "@/components/CategoryIcon";
import ServiceImage from "@/components/ServiceImage";

export default function Index() {
  usePageTitle("Find your people. Get it done. | Needlyy");
  const navigate = useNavigate();
  const { categories } = useCategories({ withCounts: true });
  const { services, loading, error } = useServices();
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [saved, setSaved] = useState(() => new Set(getSaved()));
  const user = getUser();
  const featured = useMemo(() => [...services].sort((a, b) => b.reviews - a.reviews || b.rating - a.rating).slice(0, 4), [services]);
  return <AppShell fullBleed contentClassName="discovery-content">
    <div className="discovery-page">
      <div className="page-intro"><div><p className="eyebrow">LOCAL TALENT. REAL POSSIBILITIES.</p><p className="intro-line">{user ? `Good to see you, ${user.name.split(" ")[0]}.` : "A little help goes a long way."}</p></div><Link to="/browse" className="location-link"><MapPin size={16} /> Explore Sri Lanka <ChevronRight size={14} /></Link></div>
      <section className="discovery-hero">
        <div className="hero-copy"><span className="hero-kicker"><span /> Your everyday, made easier</span><h1>Find your people.<br /><span>Get it done.</span></h1><p>From a better home to your next big idea. Find the right local professional for whatever life needs.</p><Link to="/browse" className="hero-link">Explore services <ArrowUpRight size={19} /></Link><div className="hero-assurance"><ShieldCheck size={17} /> Local services, all in one place</div></div>
        <div className="hero-art"><img src="/images/hero-professionals.png" alt="Illustration of local professionals working together" loading="eager" /><div className="art-caption"><span className="caption-icon"><Check size={17} /></span><div><strong>Good work starts with good people.</strong><span>Discover your next connection.</span></div></div></div>
      </section>
      <form className="discovery-search" onSubmit={e => { e.preventDefault(); const p = new URLSearchParams(); if(query.trim()) p.set("q", query.trim()); if(district !== "All Districts") p.set("district", district); navigate(`/browse?${p}`); }}>
        <label className="search-field"><Search size={21} /><span><span className="field-label">WHAT DO YOU NEED?</span><input aria-label="Search services" placeholder="Try cleaning, photography, web design…" value={query} onChange={e => setQuery(e.target.value)} /></span></label>
        <label className="district-field"><MapPin size={20} /><span><span className="field-label">WHERE?</span><select aria-label="Choose district" value={district} onChange={e => setDistrict(e.target.value)}>{SL_DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></span></label>
        <button type="submit">Find a professional <ArrowRight size={18} /></button>
      </form>
      <div className="popular-searches"><span>A good place to start</span>{["Cleaning", "Web Development", "Photography", "Home Tutor"].map(t => <Link key={t} to={`/browse?q=${encodeURIComponent(t)}`}>{t}<ArrowUpRight size={12} /></Link>)}</div>
      <section className="discovery-section"><div className="section-heading"><div><p className="eyebrow">A WORLD OF LOCAL EXPERTISE</p><h2>What’s on your to-do list?</h2></div><Link to="/browse">All categories <ArrowRight size={16} /></Link></div><div className="category-grid">{categories.slice(0, 8).map((c, i) => <Link key={c.id} to={`/browse?category=${encodeURIComponent(c.name)}`} className={`category-tile category-tone-${i % 4}`}><CategoryIcon category={c.name} size={25} /><span>{c.name}</span><ArrowUpRight size={15} className="category-arrow" /></Link>)}</div></section>
      <section className="discovery-section"><div className="section-heading"><div><p className="eyebrow">DISCOVER YOUR NEXT CONNECTION</p><h2>Services worth a closer look</h2></div><Link to="/browse">Explore all <ArrowRight size={16} /></Link></div><div className="service-grid">{loading ? Array.from({length: 4}, (_, i) => <div key={i} className="service-skeleton animate-pulse" />) : featured.map(s => <Link to={`/service/${s.id}`} key={s.id} className="discovery-service"><div className="service-picture"><ServiceImage imageUrl={s.imageUrl} category={s.category} /><span className="service-category">{s.category}</span><button type="button" className="save-service" aria-label={saved.has(s.id) ? "Remove saved service" : "Save service"} aria-pressed={saved.has(s.id)} onClick={e => { e.preventDefault(); toggleSaved(s.id); setSaved(new Set(getSaved())); }}><Heart size={18} fill={saved.has(s.id) ? "currentColor" : "none"} /></button></div><div className="service-copy"><div className="service-meta"><span><MapPin size={13} />{s.district}</span><span><Star size={13} />{s.reviews ? s.rating.toFixed(1) : "New"}</span></div><h3>{s.title}</h3><p>{s.seller}{s.sellerVerified && <ShieldCheck size={14} />}</p><div className="service-price"><span>From <strong>{formatPrice(s.price)}</strong></span><ArrowUpRight size={18} /></div></div></Link>)}</div>{!loading && !featured.length && <div className="discovery-empty"><SlidersHorizontal size={28} /><div><h3>{error ? "Let’s try again in a moment" : "Your next connection is on its way"}</h3><p>{error ? "We couldn’t load services. You can still explore categories or post your request." : "New services will appear as professionals publish them. Tell us what you need to get started."}</p></div><Link to="/post-request">Post a request <ArrowRight size={16} /></Link></div>}</section>
      <section className="request-banner"><div className="request-mark"><MessageCircle size={30} /></div><div><p className="eyebrow">YOUR NEED. THEIR KNOW-HOW.</p><h2>Can’t find exactly what you need?</h2><p>Post a request and start a conversation with local professionals.</p></div><Link to="/post-request">Tell us what you need <ArrowUpRight size={18} /></Link></section>
      <section className="discovery-section"><div className="section-heading"><div><p className="eyebrow">LESS EFFORT. MORE DONE.</p><h2>From “I need” to “all done”.</h2></div><Link to="/about">How it works <ArrowRight size={16} /></Link></div><div className="steps-grid">{[{icon: Search, title:"Find your fit", text:"Explore services and compare professionals for your task."}, {icon: MessageCircle, title:"Make a connection", text:"Chat about the details, your timing, and what matters to you."}, {icon: CalendarCheck, title:"Make it happen", text:"Book your service and manage everything in one place."}].map((s, i) => <div className="step" key={s.title}><div className="step-top"><s.icon size={25} /><span>0{i + 1}</span></div><h3>{s.title}</h3><p>{s.text}</p></div>)}</div></section>
      <section className="seller-banner"><div><p className="eyebrow">PUT YOUR SKILLS TO WORK</p><h2>You do great work.<br />Let’s help people find it.</h2><p>Build your profile, share your services, and connect with your next client.</p><Link to="/register/seller">Become a seller <ArrowUpRight size={18} /></Link></div><div className="seller-visual"><img src="/images/join-seller.png" alt="Grow your service business with Needlyy" loading="lazy" /></div></section>
    </div>
  </AppShell>;
}
