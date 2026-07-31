import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [logoPath, setLogoPath] = useState('');
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;
    axios.get(`${API}/settings`).then(r => setLogoPath(r.data.logo_path || '')).catch(() => {});
  }, [isAdmin]);

  if (isAdmin) return null;

  const scrollToBooking = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', '/#booking');
    } else {
      navigate('/#booking');
    }
  };

  const navLinks = [
    { to: '/', label: t('Home', '首页') },
    { to: '/about', label: t('About', '关于') },
    { to: '/#booking', label: t('Performance Booking', '表演邀约'), hash: true, onClick: scrollToBooking },
    { to: '/team', label: t('Council', '理事会') },
    { to: '/join-us', label: t('Become a Drummer', '成为鼓手') },
  ];

  return (
    <nav className="sticky-nav bg-[#410C09]/80 text-white" data-testid="main-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
            {logoPath ? (
              <img
                src={`${API}/files/${logoPath}`}
                alt="UTeM 24FD Logo"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-[#D4AF37] bg-[#410C09] flex items-center justify-center font-heading text-[#D4AF37] text-sm font-bold">
                廿四
              </div>
            )}
            <span className="font-heading text-xl font-bold">
              {t('UTeM 24FD', '技大二十四节令鼓队')}
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.hash ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={link.onClick}
                  className="hover:text-[#D4AF37] transition-colors"
                  data-testid="nav-link-booking"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-[#D4AF37] transition-colors"
                  data-testid={`nav-link-${link.to.slice(1) || 'home'}`}
                >
                  {link.label}
                </Link>
              )
            ))}
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              data-testid="lang-switcher-btn"
            >
              {language === 'en' ? '中文' : 'EN'}
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#410C09] border-t border-white/10" data-testid="mobile-menu">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              link.hash ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={link.onClick}
                  className="block py-2 hover:text-[#D4AF37] transition-colors"
                  data-testid="mobile-nav-link-booking"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block py-2 hover:text-[#D4AF37] transition-colors"
                  onClick={() => setIsOpen(false)}
                  data-testid={`mobile-nav-link-${link.to.slice(1) || 'home'}`}
                >
                  {link.label}
                </Link>
              )
            ))}
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="w-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10"
              data-testid="mobile-lang-switcher-btn"
            >
              {language === 'en' ? '中文' : 'EN'}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
