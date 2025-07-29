import { useEffect, useState } from 'react';
// Pastikan Anda mengimpor NavLink
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';

const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- INI BAGIAN PENTINGNYA ---
  // Fungsi ini akan dipanggil oleh setiap NavLink.
  // Ia menerima { isActive } dan mengembalikan string kelas CSS.
  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    const commonClasses = "py-1 transition-colors duration-300";
    const activeClasses = "text-rose-500 border-b-2 border-rose-500"; // Kelas untuk link aktif
    const inactiveClasses = "text-slate-700 border-b-2 border-transparent hover:text-rose-500"; // Kelas untuk link tidak aktif

    return `${commonClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold font-serif text-rose-800">Amishaalazis</Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/blog" className={navLinkClass}>My Blog</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          {session && <NavLink to="/admin" className={navLinkClass}>Dashboard</NavLink>}
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <button onClick={handleLogout} className="bg-slate-200 text-slate-800 px-5 py-2 rounded-full hover:bg-slate-300">Logout</button>
          ) : (
            <Link to="/login" className="bg-rose-500 text-white px-5 py-2 rounded-full hover:bg-rose-600">Login</Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-700">
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            {/* Menggunakan fungsi yang sama untuk mobile */}
            <NavLink to="/" className={navLinkClass + " block"} onClick={closeMobileMenu}>Home</NavLink>
            <NavLink to="/blog" className={navLinkClass + " block"} onClick={closeMobileMenu}>My Blog</NavLink>
            <NavLink to="/contact" className={navLinkClass + " block"} onClick={closeMobileMenu}>Contact</NavLink>
            {session && <NavLink to="/admin" className={navLinkClass + " block"} onClick={closeMobileMenu}>Dashboard</NavLink>}
            <div className="mt-4">
              {session ? (
                <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="w-full bg-slate-200 text-slate-800 px-5 py-2 rounded-full">Logout</button>
              ) : (
                <Link to="/login" onClick={closeMobileMenu} className="w-full block bg-rose-500 text-white px-5 py-2 rounded-full">Login</Link>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;