import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { Heart, Shield, Users, ArrowRight, Calendar, Stethoscope, Baby, CheckCircle, Syringe, AlertTriangle, Pill, BookOpen } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const { t, language } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [summary, setSummary] = useState({ total_raised: 0, total_spent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, postsRes, updatesRes, summaryRes] = await Promise.all([
          axios.get(`${API}/campaigns`),
          axios.get(`${API}/posts?limit=3`),
          axios.get(`${API}/updates?published_only=true`),
          axios.get(`${API}/transparency/summary`)
        ]);
        setCampaigns(campaignsRes.data);
        setPosts(postsRes.data);
        setUpdates(updatesRes.data.slice(0, 2));
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg"
            alt="Healthcare support"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl animate-fade-in-up">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg sm:text-xl text-slate-200 mb-6 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            {/* Hero Trust Line */}
            <p className="text-teal-300 text-sm font-medium mb-8 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              {t('hero.trustLine')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/donate">
                <Button 
                  size="lg" 
                  className="rounded-full bg-coral hover:bg-coral-600 text-white font-bold shadow-xl hover:shadow-coral/40 px-8 py-6 text-lg"
                  data-testid="hero-donate-btn"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link to="/transparency">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full border-2 border-white/50 text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  {t('nav.transparency')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="py-20 bg-white" data-testid="featured-campaigns-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
              {t('campaigns.featuredTitle')}
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              {t('campaigns.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredCampaigns.map((campaign) => {
              const Icon = getCampaignIcon(campaign.slug);
              return (
                <Card 
                  key={campaign.id} 
                  className="overflow-hidden card-lift border-0 shadow-lg"
                  data-testid={`campaign-card-${campaign.slug}`}
                >
                  <div className="relative h-64">
                    <img
                      src={campaign.cover_image}
                      alt={language === 'en' ? campaign.title_en : campaign.title_fr}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-white">
                          {language === 'en' ? campaign.title_en : campaign.title_fr}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-slate-600 mb-4 line-clamp-2">
                      {language === 'en' ? campaign.summary_en : campaign.summary_fr}
                    </p>
                    <Link to={`/campaign/${campaign.slug}`}>
                      <Button className="w-full rounded-full bg-teal-600 hover:bg-teal-700 text-white">
                        {t('campaigns.supportCampaign')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* More Programs Section */}
      {otherCampaigns.length > 0 && (
        <section className="py-20 bg-slate-50" data-testid="more-programs-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
                {t('campaigns.morePrograms')}
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                {t('campaigns.moreProgramsSubtitle')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {otherCampaigns.map((campaign) => {
                const Icon = getCampaignIcon(campaign.slug);
                return (
                  <Card 
                    key={campaign.id} 
                    className="card-lift border-0 shadow-md bg-white h-full"
                    data-testid={`program-card-${campaign.slug}`}
                  >
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-teal-600" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-navy mb-2">
                        {language === 'en' ? campaign.title_en : campaign.title_fr}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
                        {language === 'en' ? campaign.summary_en : campaign.summary_fr}
                      </p>
                      <Link to={`/donate?campaign=${campaign.slug}`} className="mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full rounded-full border-teal-200 text-teal-600 hover:bg-teal-50"
                        >
                          {t('campaigns.supportCampaign')}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Impact Section */}
      <section className="py-20 bg-white" data-testid="impact-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-4">
              {t('impact.title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 border-0 shadow-md card-lift bg-white">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-4">
                <Stethoscope className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">
                {t('impact.screening')}
              </h3>
              <p className="text-slate-600">
                {t('impact.screeningDesc')}
              </p>
            </Card>

            <Card className="p-6 border-0 shadow-md card-lift bg-white">
              <div className="w-14 h-14 rounded-2xl bg-coral/10 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-coral" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">
                {t('impact.treatment')}
              </h3>
              <p className="text-slate-600">
                {t('impact.treatmentDesc')}
              </p>
            </Card>

            <Card className="p-6 border-0 shadow-md card-lift bg-white">
              <div className="w-14 h-14 rounded-2xl bg-navy/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-navy" />
              </div>
              <h3 className="font-display text-xl font-semibold text-navy mb-2">
                {t('impact.awareness')}
              </h3>
              <p className="text-slate-600">
                {t('impact.awarenessDesc')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      {updates.length > 0 && (
        <section className="py-20 bg-slate-50" data-testid="updates-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy">
                {t('updates.title')}
              </h2>
              <Link to="/transparency" className="text-teal-600 hover:text-teal-700 font-medium flex items-center">
                {t('common.viewAll')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {updates.map((update) => (
                <Card key={update.id} className="p-6 border-0 shadow-md card-lift">
                  <div className="flex items-center space-x-2 text-slate-500 text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-navy mb-2">
                    {language === 'en' ? update.title_en : update.title_fr}
                  </h3>
                  <p className="text-slate-600 line-clamp-3">
                    {language === 'en' ? update.body_en : update.body_fr}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Transparency Preview */}
      <section className="py-20 bg-navy" data-testid="transparency-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
                {t('transparency.title')}
              </h2>
              <p className="text-slate-300 text-lg mb-8">
                {t('transparency.subtitle')}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 rounded-2xl p-6">
                  <p className="text-teal-400 font-mono text-3xl font-bold mb-1">
                    ${(summary.total_raised || 0).toLocaleString()}
                  </p>
                  <p className="text-slate-300 text-sm">{t('transparency.totalRaised')}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6">
                  <p className="text-coral font-mono text-3xl font-bold mb-1">
                    ${Math.min(summary.total_spent || 0, summary.total_raised || 0).toLocaleString()}
                  </p>
                  <p className="text-slate-300 text-sm">{t('transparency.totalSpent')}</p>
                </div>
              </div>
              <Link to="/transparency">
                <Button className="rounded-full bg-teal-600 hover:bg-teal-700 text-white px-8">
                  {t('common.viewAll')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-teal-600/20 absolute -top-4 -left-4" />
                <div className="w-64 h-64 rounded-full bg-coral/20 absolute -bottom-4 -right-4" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-400" />
                      <span className="text-white">{language === 'en' ? 'Transparent reporting' : 'Rapports transparents'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-400" />
                      <span className="text-white">{language === 'en' ? 'Detailed impact reports' : 'Rapports d\'impact détaillés'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-teal-400" />
                      <span className="text-white">{language === 'en' ? 'Verified local partners' : 'Partenaires locaux vérifiés'}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-teal-400" />
                      <span className="text-white">{language === 'en' ? 'Secure donations' : 'Dons sécurisés'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
            {language === 'en' ? 'Ready to Make a Difference?' : 'Prêt à Faire la Différence?'}
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            {language === 'en' 
              ? 'Your donation today can save a life tomorrow. Join us in our mission to fight sickle cell disease.'
              : 'Votre don aujourd\'hui peut sauver une vie demain. Rejoignez-nous dans notre mission contre la drépanocytose.'}
          </p>
          <Link to="/donate">
            <Button 
              size="lg"
              className="rounded-full bg-white text-teal-700 hover:bg-slate-100 font-bold shadow-xl px-10 py-6 text-lg"
              data-testid="cta-donate-btn"
            >
              <Heart className="w-5 h-5 mr-2" />
              {t('hero.cta')}
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
