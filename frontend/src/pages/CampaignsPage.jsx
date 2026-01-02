import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { Heart, ArrowRight, Stethoscope, Baby, Syringe, AlertTriangle, Pill, BookOpen, Star } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CampaignsPage() {
  const { t, language } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(`${API}/campaigns`);
        setCampaigns(response.data);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const getCampaignIcon = (slug) => {
    const icons = {
      'sickle-cell': Stethoscope,
      'pregnancy-testing': Baby,
      'newborn-screening': Syringe,
      'emergency-relief': AlertTriangle,
      'medication-access': Pill,
      'patient-education': BookOpen
    };
    return icons[slug] || Heart;
  };

  const featuredCampaigns = campaigns.filter(c => c.featured);
  const otherCampaigns = campaigns.filter(c => !c.featured);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50" data-testid="campaigns-page">
        {/* Header */}
        <section className="bg-navy py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('campaigns.title')}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {t('campaigns.subtitle')}
            </p>
          </div>
        </section>

        {loading ? (
          <section className="py-16">
            <div className="text-center py-12">
              <div className="animate-pulse text-slate-500">{t('common.loading')}</div>
            </div>
          </section>
        ) : (
          <>
            {/* Featured Campaigns */}
            {featuredCampaigns.length > 0 && (
              <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center space-x-2 mb-8">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <h2 className="font-display text-2xl font-bold text-navy">
                      {t('campaigns.featuredTitle')}
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredCampaigns.map((campaign) => {
                      const Icon = getCampaignIcon(campaign.slug);
                      const title = language === 'en' ? campaign.title_en : campaign.title_fr;
                      const summary = language === 'en' ? campaign.summary_en : campaign.summary_fr;
                      
                      return (
                        <Card 
                          key={campaign.id}
                          className="overflow-hidden border-0 shadow-lg card-lift"
                          data-testid={`campaign-card-${campaign.slug}`}
                        >
                          <div className="relative h-64">
                            <img
                              src={campaign.cover_image}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 rounded-full bg-yellow-500 text-white text-xs font-medium flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </span>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-white">
                                  {title}
                                </h3>
                              </div>
                            </div>
                          </div>
                          
                          <CardContent className="p-6">
                            <p className="text-slate-600 mb-6 leading-relaxed">
                              {summary}
                            </p>
                            
                            {/* Impact Preview */}
                            {campaign.amount_cards?.slice(0, 2).map((card) => (
                              <div 
                                key={card.amount}
                                className="flex items-start space-x-3 mb-3 p-3 bg-slate-50 rounded-lg"
                              >
                                <span className="font-bold text-teal-600">${card.amount}</span>
                                <span className="text-slate-600 text-sm">
                                  {language === 'en' ? card.impact_en : card.impact_fr}
                                </span>
                              </div>
                            ))}
                            
                            <div className="flex gap-4 mt-6">
                              <Link to={`/campaign/${campaign.slug}`} className="flex-1">
                                <Button 
                                  variant="outline" 
                                  className="w-full rounded-full border-slate-200 hover:border-teal-500 hover:text-teal-600"
                                >
                                  {t('common.learnMore')}
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                              <Link to={`/donate?campaign=${campaign.slug}`} className="flex-1">
                                <Button className="w-full rounded-full bg-coral hover:bg-coral-600 text-white">
                                  <Heart className="w-4 h-4 mr-2" />
                                  {t('nav.donate')}
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Other Programs */}
            {otherCampaigns.length > 0 && (
              <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="font-display text-2xl font-bold text-navy mb-2">
                    {t('campaigns.morePrograms')}
                  </h2>
                  <p className="text-slate-500 mb-8">
                    {t('campaigns.moreProgramsSubtitle')}
                  </p>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {otherCampaigns.map((campaign) => {
                      const Icon = getCampaignIcon(campaign.slug);
                      const title = language === 'en' ? campaign.title_en : campaign.title_fr;
                      const summary = language === 'en' ? campaign.summary_en : campaign.summary_fr;
                      
                      return (
                        <Card 
                          key={campaign.id}
                          className="card-lift border-0 shadow-md"
                          data-testid={`campaign-card-${campaign.slug}`}
                        >
                          <CardContent className="p-6">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                              <Icon className="w-6 h-6 text-teal-600" />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-navy mb-2">
                              {title}
                            </h3>
                            <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                              {summary}
                            </p>
                            <div className="space-y-2">
                              <Link to={`/campaign/${campaign.slug}`}>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="w-full rounded-full border-slate-200 hover:border-teal-500"
                                >
                                  {t('common.learnMore')}
                                </Button>
                              </Link>
                              <Link to={`/donate?campaign=${campaign.slug}`}>
                                <Button 
                                  size="sm"
                                  className="w-full rounded-full bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                  {t('campaigns.supportCampaign')}
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
