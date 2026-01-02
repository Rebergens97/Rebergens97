import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { CheckCircle, Heart, Mail, MessageCircle, ArrowRight, Home } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ThankYouPage() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [settings, setSettings] = useState({});
  
  const { amount, campaign, isMonthly } = location.state || {};

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings/public`);
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-16" data-testid="thank-you-page">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 mb-6">
              <CheckCircle className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
              {t('thankYou.title')}
            </h1>
            <p className="text-slate-600 text-lg">
              {t('thankYou.subtitle')}
            </p>
          </div>

          {/* Donation Summary */}
          {amount && (
            <Card className="border-0 shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-slate-500 mb-2">
                    {language === 'en' ? 'Your donation' : 'Votre don'}
                  </p>
                  <p className="font-mono font-bold text-4xl text-teal-600 mb-2">
                    ${amount.toLocaleString()}
                  </p>
                  {isMonthly && (
                    <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                      {language === 'en' ? 'Monthly' : 'Mensuel'}
                    </span>
                  )}
                  {campaign && (
                    <p className="text-slate-500 mt-2">
                      {language === 'en' ? campaign.title_en : campaign.title_fr}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold text-navy mb-4">
                {t('thankYou.nextSteps')}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 font-bold text-sm">1</span>
                  </div>
                  <p className="text-slate-600">{t('thankYou.step1')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 font-bold text-sm">2</span>
                  </div>
                  <p className="text-slate-600">{t('thankYou.step2')}</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-teal-600 font-bold text-sm">3</span>
                  </div>
                  <p className="text-slate-600">{t('thankYou.step3')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold text-navy mb-4">
                {t('thankYou.contactTitle')}
              </h2>
              <div className="space-y-3">
                <a 
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-teal-600" />
                  </div>
                  <span className="text-slate-700">{settings.contact_email || 'contact@drepanhope.org'}</span>
                </a>
                <a 
                  href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-slate-700">
                    {language === 'en' ? 'WhatsApp Us' : 'Contactez-nous sur WhatsApp'}
                  </span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-full border-slate-200"
                data-testid="back-home-btn"
              >
                <Home className="w-5 h-5 mr-2" />
                {t('thankYou.backHome')}
              </Button>
            </Link>
            <Link to="/transparency" className="flex-1">
              <Button className="w-full h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white">
                {t('nav.transparency')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
