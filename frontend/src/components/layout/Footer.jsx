import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Heart, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-semibold text-xl">
                DrepanHope Foundation
              </span>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed max-w-md">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/campaigns" className="text-slate-300 hover:text-teal-400 transition-colors text-sm">
                  {t('nav.campaigns')}
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-slate-300 hover:text-teal-400 transition-colors text-sm">
                  {t('nav.transparency')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-300 hover:text-teal-400 transition-colors text-sm">
                  {t('nav.faq')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-teal-400 transition-colors text-sm">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">{t('contact.title')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-slate-300 text-sm">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>contact@drepanhope.org</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-300 text-sm">
                <Phone className="w-4 h-4 text-teal-400" />
                <span>+1 (000) 000-0000</span>
              </li>
            </ul>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-700 hover:bg-teal-600 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-700 hover:bg-teal-600 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-700 hover:bg-teal-600 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © {currentYear} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};
