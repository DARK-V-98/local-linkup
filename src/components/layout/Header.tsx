import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/feed", label: "Feed" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-700 ${
        scrolled 
          ? "py-4 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-glass" 
          : "py-6 bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Needlyy" 
              className="h-10 md:h-12 w-auto object-contain group-hover:scale-110 transition-transform" 
            />
            <span className={`text-2xl font-[950] tracking-tighter transition-colors ${scrolled ? "text-slate-900" : "text-slate-800"}`}>
              Needlyy
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-5 py-2.5 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : `hover:bg-slate-50 ${scrolled ? "text-slate-500 hover:text-slate-900" : "text-slate-600 hover:text-slate-900"}`
                  }`
                }
                end
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
             <Link 
               to="/register/seller" 
               className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${scrolled ? "text-slate-400 hover:text-primary" : "text-slate-500 hover:text-primary"}`}
             >
               Become a Seller
             </Link>
          </div>

          {loading ? (
            <div className="w-11 h-11 rounded-2xl bg-slate-100 animate-pulse" />
          ) : !user ? (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className={`rounded-2xl font-black text-[11px] uppercase tracking-widest px-6 h-11 ${scrolled ? "text-slate-600 hover:bg-slate-50" : "text-slate-600 hover:bg-slate-50"}`}>
                  Sign in
                </Button>
              </Link>
              <Link to="/role-selection?mode=register">
                <Button className="bg-slate-900 text-white rounded-2xl px-8 h-11 font-black text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 hover:bg-slate-800 transition-all">
                  Join Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <div className="hidden sm:block text-right">
                  <div className={`text-[10px] font-black uppercase tracking-widest ${scrolled ? "text-slate-400" : "text-slate-500"}`}>{userData?.role || 'User'}</div>
                  <div className={`text-sm font-black ${scrolled ? "text-slate-900" : "text-slate-800"}`}>{userData?.name || user.displayName || 'Account'}</div>
               </div>
               
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-brand text-white font-black shadow-glow grid place-items-center cursor-pointer hover:scale-105 transition-transform">
                      {(userData?.name || user.displayName || 'U')[0]}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-3 rounded-[2rem] border-slate-200 shadow-2xl mt-4">
                    <DropdownMenuLabel className="px-4 py-3">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</div>
                       <div className="text-sm font-black text-slate-900">{userData?.name || user.displayName || 'User'}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2 bg-slate-50" />
                    <DropdownMenuItem className="rounded-xl px-4 py-3 font-bold text-sm focus:bg-primary/5 focus:text-primary cursor-pointer transition-colors" onClick={() => navigate(userData?.role === 'Admin' ? '/admin' : `/dashboard/${userData?.role?.toLowerCase() || 'buyer'}`)}>
                       <i className="fas fa-chart-pie mr-3 opacity-50" /> Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl px-4 py-3 font-bold text-sm focus:bg-primary/5 focus:text-primary cursor-pointer transition-colors" onClick={() => navigate('/settings')}>
                       <i className="fas fa-sliders mr-3 opacity-50" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-slate-50" />
                    <DropdownMenuItem className="rounded-xl px-4 py-3 font-bold text-sm focus:bg-red-50 focus:text-red-600 cursor-pointer text-red-500 transition-colors" onClick={handleLogout}>
                       <i className="fas fa-right-from-bracket mr-3 opacity-50" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className={`lg:hidden grid place-items-center w-11 h-11 rounded-2xl transition-colors ${scrolled ? "bg-slate-100 text-slate-900" : "bg-slate-100 text-slate-900"}`}
          >
            <i className={`fas ${open ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="container mx-auto py-10 flex flex-col gap-2 px-6">
            {navItems.map((n) => (
              <Link 
                key={n.to} 
                to={n.to} 
                onClick={() => setOpen(false)} 
                className="px-6 py-4 rounded-2xl hover:bg-slate-50 font-[900] text-lg transition-all text-slate-900"
              >
                {n.label}
              </Link>
            ))}
            <div className="h-px bg-slate-50 my-6" />
            
            {!user ? (
               <>
                <Link to="/login" onClick={() => setOpen(false)} className="px-6 py-4 rounded-2xl hover:bg-slate-50 font-black text-slate-600">
                  Sign in
                </Link>
                <Link
                  to="/role-selection?mode=register"
                  onClick={() => setOpen(false)}
                  className="mt-4 text-center bg-slate-950 text-white px-8 py-5 rounded-2xl font-[900] shadow-xl text-lg"
                >
                  Join Needlyy
                </Link>
               </>
            ) : (
               <Link
                  to={userData?.role === 'Admin' ? '/admin' : `/dashboard/${userData?.role?.toLowerCase() || 'buyer'}`}
                  onClick={() => setOpen(false)}
                  className="text-center bg-primary text-white px-8 py-5 rounded-2xl font-[900] shadow-glow text-lg"
               >
                 Go to Dashboard
               </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
