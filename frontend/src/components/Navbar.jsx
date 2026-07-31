import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  const navLinks = [
    { to: '/', label: t('Home', '首页') },
    { to: '/about', label: t('About', '关于') },
    { to: '/history', label: t('History', '历史') },
    { to: '/performances', label: t('Performances', '演出') },
    { to: '/packages', label: t('Packages', '配套') },
    { to: '/team', label: t('Team', '团队') },
    { to: '/contact', label: t('Contact', '联系') },
  ];

  return (
    <nav className="sticky-nav bg-[#410C09]/80 text-white" data-testid="main-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-heading text-xl font-bold" data-testid="nav-logo">
            {t('UTeM 24FD', 'UTeM 24FD')}
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-[#D4AF37] transition-colors"
                data-testid={`nav-link-${link.to.slice(1) || 'home'}`}
              >
                {link.label}
              </Link>
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
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 hover:text-[#D4AF37] transition-colors"
                onClick={() => setIsOpen(false)}
                data-testid={`mobile-nav-link-${link.to.slice(1) || 'home'}`}
              >
                {link.label}
              </Link>
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