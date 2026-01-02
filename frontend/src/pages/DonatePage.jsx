import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import axios from 'axios';
import { Heart, Shield, Users, CheckCircle, Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DonatePage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    message: ''
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API}/campaigns`);
        setCampaigns(response.data);
        
        // Check for campaign param in URL
        const campaignSlug = searchParams.get('campaign');
        if (campaignSlug && response.data.length > 0) {
          const campaign = response.data.find(c => c.slug === campaignSlug);
          if (campaign) {
            setSelectedCampaign(campaign);
          }
        } else if (response.data.length > 0) {
          setSelectedCampaign(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
        toast.error('Failed to load campaigns');
      }
    };
    fetchCampaigns();
  }, [searchParams]);

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = () => {
    if (customAmount) return parseInt(customAmount);
    return selectedAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = getFinalAmount();
    if (!amount || amount < 1) {
      toast.error(language === 'en' ? 'Please select or enter a donation amount' : 'Veuillez sélectionner ou entrer un montant');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.country) {
      toast.error(language === 'en' ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/donations`, {
        donor_first_name: formData.firstName,
        donor_last_name: formData.lastName,
        email: formData.email,
        country: formData.country,
        amount: amount,
        campaign_id: selectedCampaign?.id,
        donation_type: isMonthly ? 'monthly' : 'one_time',
        message: formData.message || null
      });

      navigate('/thank-you', { 
        state: { 
          amount, 
          campaign: selectedCampaign,
          isMonthly 
        } 
      });
    } catch (error) {
      console.error('Donation failed:', error);
      toast.error(language === 'en' ? 'Failed to process donation. Please try again.' : 'Échec du traitement du don. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 py-12" data-testid="donate-page">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              {t('donate.title')}
            </h1>
            <p className="text-slate-600 text-lg">
              {t('donate.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  {/* Campaign Tabs */}
                  {campaigns.length > 0 && (
                    <Tabs 
                      value={selectedCampaign?.slug || campaigns[0]?.slug}
                      onValueChange={(slug) => {
                        const campaign = campaigns.find(c => c.slug === slug);
                        setSelectedCampaign(campaign);
                        setSelectedAmount(null);
                      }}
                      className="mb-8"
                    >
                      <TabsList className="w-full grid grid-cols-2 h-auto p-1 bg-slate-100 rounded-xl">
                        {campaigns.map((campaign) => (
                          <TabsTrigger 
                            key={campaign.slug} 
                            value={campaign.slug}
                            className="rounded-lg py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            data-testid={`campaign-tab-${campaign.slug}`}
                          >
                            <span className="text-sm font-medium">
                              {language === 'en' ? campaign.title_en : campaign.title_fr}
                            </span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}

                  {/* Amount Selection */}
                  <div className="mb-8">
                    <Label className="text-base font-semibold text-navy mb-4 block">
                      {t('donate.selectAmount')}
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                      {selectedCampaign?.amount_cards?.map((card) => (
                        <button
                          key={card.amount}
                          type="button"
                          onClick={() => handleAmountSelect(card.amount)}
                          className={`donation-card p-4 rounded-xl border-2 text-center transition-all ${
                            selectedAmount === card.amount
                              ? 'selected border-teal-500 bg-teal-50'
                              : 'border-slate-200 hover:border-teal-300 bg-white'
                          }`}
                          data-testid={`amount-${card.amount}`}
                        >
                          <span className="font-bold text-lg text-navy">${card.amount}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                      <Input
                        type="text"
                        placeholder={t('donate.customAmount')}
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className="pl-8 h-12 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                        data-testid="custom-amount-input"
                      />
                    </div>

                    {/* Impact Text */}
                    {(selectedAmount || customAmount) && selectedCampaign?.amount_cards && (
                      <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                        <p className="text-teal-700 text-sm">
                          {selectedCampaign.amount_cards.find(c => c.amount === (selectedAmount || parseInt(customAmount)))
                            ? (language === 'en' 
                              ? selectedCampaign.amount_cards.find(c => c.amount === selectedAmount)?.impact_en
                              : selectedCampaign.amount_cards.find(c => c.amount === selectedAmount)?.impact_fr)
                            : (language === 'en' 
                              ? 'Your custom donation makes a meaningful impact.'
                              : 'Votre don personnalisé a un impact significatif.')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* One-time / Monthly Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-8">
                    <div>
                      <p className="font-medium text-navy">{t('donate.oneTime')}</p>
                    </div>
                    <Switch
                      checked={isMonthly}
                      onCheckedChange={setIsMonthly}
                      data-testid="monthly-toggle"
                    />
                    <div>
                      <p className="font-medium text-navy">{t('donate.monthly')}</p>
                    </div>
                  </div>

                  {/* Donor Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                          {t('donate.firstName')} *
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="mt-1 h-12 rounded-xl"
                          required
                          data-testid="first-name-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                          {t('donate.lastName')} *
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="mt-1 h-12 rounded-xl"
                          required
                          data-testid="last-name-input"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        {t('donate.email')} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 h-12 rounded-xl"
                        required
                        data-testid="email-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                        {t('donate.country')} *
                      </Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="mt-1 h-12 rounded-xl"
                        required
                        data-testid="country-input"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                        {t('donate.message')}
                      </Label>
                      <Textarea
                        id="message"
                        placeholder={t('donate.messagePlaceholder')}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="mt-1 rounded-xl"
                        rows={3}
                        data-testid="message-input"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 rounded-full bg-coral hover:bg-coral-600 text-white font-bold text-lg shadow-xl hover:shadow-coral/30"
                      data-testid="donate-submit-btn"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('donate.processing')}
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5 mr-2" />
                          {t('donate.donateNow')} {getFinalAmount() ? `- $${getFinalAmount()}` : ''}
                        </>
                      )}
                    </Button>

                    {/* Trust Line */}
                    <p className="text-center text-slate-500 text-sm">
                      {t('donate.trustLine')}
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trust Signals */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold text-navy mb-4">
                    {language === 'en' ? 'Why Donate?' : 'Pourquoi Donner?'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-navy text-sm">
                          {language === 'en' ? 'Secure & Safe' : 'Sécurisé'}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {language === 'en' ? 'Your data is protected' : 'Vos données sont protégées'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-navy text-sm">
                          {language === 'en' ? 'Transparent' : 'Transparent'}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {language === 'en' ? 'See where funds go' : 'Voyez où vont les fonds'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-navy text-sm">
                          {language === 'en' ? 'Local Partners' : 'Partenaires Locaux'}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {language === 'en' ? 'Trusted organizations' : 'Organisations de confiance'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Info */}
              {selectedCampaign && (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <img 
                    src={selectedCampaign.cover_image} 
                    alt={language === 'en' ? selectedCampaign.title_en : selectedCampaign.title_fr}
                    className="w-full h-32 object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="font-display font-semibold text-navy mb-2">
                      {language === 'en' ? selectedCampaign.title_en : selectedCampaign.title_fr}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-3">
                      {language === 'en' ? selectedCampaign.summary_en : selectedCampaign.summary_fr}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
