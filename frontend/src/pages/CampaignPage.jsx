import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { Heart, ArrowRight, Calendar, CheckCircle, Target } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CampaignPage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const [campaign, setCampaign] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignRes, updatesRes, reportsRes] = await Promise.all([
          axios.get(`${API}/campaigns/${slug}`),
          axios.get(`${API}/updates`),
          axios.get(`${API}/reports`)
        ]);
        
        setCampaign(campaignRes.data);
        
        // Filter updates and reports by campaign
        const campaignId = campaignRes.data.id;
        setUpdates(updatesRes.data.filter(u => u.campaign_id === campaignId).slice(0, 3));
        setReports(reportsRes.data.filter(r => r.campaign_id === campaignId).slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch campaign:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-slate-500">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-navy mb-4">
              {language === 'en' ? 'Campaign not found' : 'Campagne introuvable'}
            </h1>
            <Link to="/">
              <Button className="rounded-full">{t('nav.home')}</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const title = language === 'en' ? campaign.title_en : campaign.title_fr;
  const summary = language === 'en' ? campaign.summary_en : campaign.summary_fr;
  const body = language === 'en' ? campaign.body_en : campaign.body_fr;

  return (
    <Layout>
      <div data-testid="campaign-page">
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px]">
          <img
            src={campaign.cover_image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                  {title}
                </h1>
                <p className="text-xl text-slate-200 mb-6">
                  {summary}
                </p>
                <Link to={`/donate?campaign=${campaign.slug}`}>
                  <Button 
                    size="lg" 
                    className="rounded-full bg-coral hover:bg-coral-600 text-white font-bold shadow-xl px-8"
                    data-testid="campaign-donate-btn"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    {t('campaigns.supportCampaign')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Goal Progress */}
        {campaign.goal_amount > 0 && (
          <section className="bg-white py-8 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-teal-600" />
                  <span className="font-medium text-navy">
                    {language === 'en' ? 'Campaign Goal' : 'Objectif de la Campagne'}
                  </span>
                </div>
                <span className="font-mono font-bold text-2xl text-teal-600">
                  ${campaign.goal_amount.toLocaleString()}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="font-display text-2xl font-bold text-navy mb-6">
                      {t('campaigns.whyMatters')}
                    </h2>
                    <div className="prose prose-slate max-w-none">
                      {body.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-slate-600 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* What Donations Fund */}
                    <h2 className="font-display text-2xl font-bold text-navy mt-10 mb-6">
                      {t('campaigns.whatFunds')}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {campaign.amount_cards?.map((card) => (
                        <div 
                          key={card.amount}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-teal-600" />
                            <span className="font-bold text-teal-600">${card.amount}</span>
                          </div>
                          <p className="text-slate-600 text-sm">
                            {language === 'en' ? card.impact_en : card.impact_fr}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Results & Updates */}
                {(updates.length > 0 || reports.length > 0) && (
                  <Card className="border-0 shadow-lg mt-8">
                    <CardContent className="p-8">
                      <h2 className="font-display text-2xl font-bold text-navy mb-6">
                        {t('campaigns.resultsUpdates')}
                      </h2>
                      
                      {updates.length > 0 && (
                        <div className="space-y-4 mb-8">
                          {updates.map((update) => (
                            <div 
                              key={update.id}
                              className="p-4 bg-slate-50 rounded-xl"
                            >
                              <div className="flex items-center space-x-2 text-slate-500 text-sm mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(update.date).toLocaleDateString()}</span>
                              </div>
                              <h3 className="font-semibold text-navy mb-1">
                                {language === 'en' ? update.title_en : update.title_fr}
                              </h3>
                              <p className="text-slate-600 text-sm">
                                {language === 'en' ? update.body_en : update.body_fr}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {reports.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-navy">{t('transparency.reportsTitle')}</h3>
                          {reports.map((report) => (
                            <div 
                              key={report.id}
                              className="p-4 bg-teal-50 rounded-xl border border-teal-100"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-navy">
                                    {language === 'en' ? report.title_en : report.title_fr}
                                  </h4>
                                  <p className="text-slate-600 text-sm mt-1">
                                    {language === 'en' ? report.description_en : report.description_fr}
                                  </p>
                                </div>
                                <span className="font-mono font-bold text-teal-600">
                                  ${report.amount_spent.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <Link to="/transparency" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium mt-6">
                        {t('common.viewAll')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Donate Card */}
                <Card className="border-0 shadow-lg sticky top-24">
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-bold text-navy mb-4">
                      {language === 'en' ? 'Support This Campaign' : 'Soutenir Cette Campagne'}
                    </h3>
                    <p className="text-slate-600 text-sm mb-6">
                      {language === 'en' 
                        ? 'Your donation directly supports our mission and helps those in need.'
                        : 'Votre don soutient directement notre mission et aide ceux qui en ont besoin.'}
                    </p>
                    <Link to={`/donate?campaign=${campaign.slug}`}>
                      <Button className="w-full rounded-full bg-coral hover:bg-coral-600 text-white font-bold h-12">
                        <Heart className="w-5 h-5 mr-2" />
                        {t('nav.donate')}
                      </Button>
                    </Link>
                    
                    <div className="mt-6 pt-6 border-t space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        <span>{language === 'en' ? 'Secure donation' : 'Don sécurisé'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        <span>{language === 'en' ? 'Transparent reporting' : 'Rapports transparents'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        <span>{language === 'en' ? 'Tax deductible' : 'Déductible des impôts'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
