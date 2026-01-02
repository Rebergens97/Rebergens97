import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { CheckCircle, Heart, Mail, MessageCircle, ArrowRight, Home, Loader2, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ThankYouPage() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [settings, setSettings] = useState({});
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get data from state (mock mode) or URL params (Stripe mode)
  const stateData = location.state || {};
  const sessionId = searchParams.get('session_id');
  const donationId = searchParams.get('donation_id');

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

  // Poll payment status if we have a session_id from Stripe
  useEffect(() => {
    if (!sessionId) return;

    let pollCount = 0;
    const maxPolls = 10;
    const pollInterval = 2000;

    const pollStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/donations/status/${sessionId}`);
        setPaymentStatus(response.data);
        
        if (response.data.payment_status === 'paid') {
          setLoading(false);
          return; // Stop polling
        }
        
        if (response.data.status === 'expired') {
          setLoading(false);
          return; // Stop polling
        }
        
        // Continue polling if still pending
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(pollStatus, pollInterval);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        setLoading(false);
      }
    };

    pollStatus();
  }, [sessionId]);

  const amount = stateData.amount || (paymentStatus?.amount_total ? paymentStatus.amount_total / 100 : null);
  const campaign = stateData.campaign;
  const isMonthly = stateData.isMonthly || paymentStatus?.metadata?.interval === 'monthly';
  const isPaid = paymentStatus?.payment_status === 'paid';
  const isMockMode = stateData.mockMode;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-16" data-testid="thank-you-page">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center mb-8">
              <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">
                {language === 'en' ? 'Confirming your payment...' : 'Confirmation de votre paiement...'}
              </p>
            </div>
          )}

          {/* Success Icon */}
          {!loading && (
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
                isPaid || isMockMode ? 'bg-teal-100' : 'bg-amber-100'
              }`}>
                {isPaid || isMockMode ? (
                  <CheckCircle className="w-10 h-10 text-teal-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
                {isPaid || isMockMode ? t('thankYou.title') : (
                  language === 'en' ? 'Payment Processing' : 'Paiement en cours'
                )}
              </h1>
              <p className="text-slate-600 text-lg">
                {isPaid ? t('thankYou.subtitle') : isMockMode ? (
                  language === 'en' 
                    ? 'Your donation has been recorded. We will contact you to confirm.' 
                    : 'Votre don a été enregistré. Nous vous contacterons pour confirmer.'
                ) : (
                  language === 'en' 
                    ? 'Your payment is being processed. Please wait...' 
                    : 'Votre paiement est en cours de traitement. Veuillez patienter...'
                )}
              </p>
              
              {/* Mock mode notice */}
              {isMockMode && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-700 text-sm">
                    {language === 'en' 
                      ? '⚠️ Test Mode: This is a simulated donation. No payment was processed.'
                      : '⚠️ Mode Test : Ceci est un don simulé. Aucun paiement n\'a été effectué.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Donation Summary */}
          {amount && !loading && (
            <Card className="border-0 shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-slate-500 mb-2">
                    {language === 'en' ? 'Your donation' : 'Votre don'}
                  </p>
                  <p className="font-mono font-bold text-4xl text-teal-600 mb-2">
                    ${typeof amount === 'number' ? amount.toLocaleString() : amount}
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
                  {paymentStatus?.metadata?.campaign_name && (
                    <p className="text-slate-500 mt-2">
                      {paymentStatus.metadata.campaign_name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {!loading && (
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
          )}

          {/* Contact Info */}
          {!loading && (
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
          )}

          {/* Actions */}
          {!loading && (
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
          )}
        </div>
      </div>
    </Layout>
  );
}
