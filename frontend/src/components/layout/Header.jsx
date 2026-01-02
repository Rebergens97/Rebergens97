import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu, Heart, Globe } from 'lucide-react';

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/campaigns', label: t('nav.campaigns') },
    { href: '/transparency', label: t('nav.transparency') },
    { href: '/faq', label: t('nav.faq') },
    { href: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center group-hover:bg-teal-700 transition-colors">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-navy text-lg hidden sm:block">
              DrepanHope
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-colors text-sm font-medium text-slate-600"
              data-testid="language-switcher"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'EN' : 'FR'}</span>
            </button>

            {/* Donate Button */}
            <Link to="/donate">
              <Button 
                className="rounded-full bg-coral hover:bg-coral-600 text-white font-semibold shadow-lg hover:shadow-coral/30 px-6"
                data-testid="header-donate-btn"
              >
                {t('nav.donate')}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col space-y-2 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive(link.href)
                          ? 'text-teal-600 bg-teal-50'
                          : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    to="/donate"
                    onClick={() => setIsOpen(false)}
                    className="mt-4"
                  >
                    <Button className="w-full rounded-full bg-coral hover:bg-coral-600 text-white font-semibold">
                      {t('nav.donate')}
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
