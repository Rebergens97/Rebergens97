import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import axios from 'axios';
import { DollarSign, TrendingUp, Calendar, FileText, ExternalLink } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TransparencyPage() {
  const { t, language } = useLanguage();
  const [summary, setSummary] = useState({ total_raised: 0, total_spent: 0, last_updated: null });
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, reportsRes] = await Promise.all([
          axios.get(`${API}/transparency/summary`),
          axios.get(`${API}/reports`)
        ]);
        setSummary(summaryRes.data);
        setReports(reportsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50" data-testid="transparency-page">
        {/* Header */}
        <section className="bg-navy py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('transparency.title')}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {t('transparency.subtitle')}
            </p>
          </div>
        </section>

        {/* Summary Stats */}
        <section className="py-12 -mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">{t('transparency.totalRaised')}</p>
                      <p className="font-mono font-bold text-2xl text-teal-600">
                        ${summary.total_raised?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-coral" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">{t('transparency.totalSpent')}</p>
                      <p className="font-mono font-bold text-2xl text-coral">
                        ${summary.total_spent?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-navy" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-sm">{t('transparency.lastUpdated')}</p>
                      <p className="font-semibold text-navy">
                        {summary.last_updated 
                          ? new Date(summary.last_updated).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Reports */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-navy mb-8">
              {t('transparency.reportsTitle')}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-slate-500">{t('common.loading')}</div>
              </div>
            ) : reports.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">
                    {language === 'en' ? 'No reports available yet.' : 'Aucun rapport disponible pour le moment.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {reports.map((report) => (
                  <Card 
                    key={report.id} 
                    className="border-0 shadow-lg card-lift cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                    data-testid={`report-card-${report.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2 text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(report.date).toLocaleDateString()}</span>
                        </div>
                        <span className="font-mono font-bold text-teal-600">
                          ${report.amount_spent.toLocaleString()}
                        </span>
                      </div>
                      
                      <h3 className="font-display text-xl font-semibold text-navy mb-2">
                        {language === 'en' ? report.title_en : report.title_fr}
                      </h3>
                      
                      <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                        {language === 'en' ? report.description_en : report.description_fr}
                      </p>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full"
                        onClick={() => setSelectedReport(report)}
                      >
                        {t('transparency.viewDetails')}
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Report Detail Modal */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {selectedReport && (language === 'en' ? selectedReport.title_en : selectedReport.title_fr)}
              </DialogTitle>
            </DialogHeader>
            
            {selectedReport && (
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedReport.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">{t('transparency.spent')}:</span>
                    <span className="font-mono font-bold text-xl text-teal-600">
                      ${selectedReport.amount_spent.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-600 leading-relaxed">
                  {language === 'en' ? selectedReport.description_en : selectedReport.description_fr}
                </p>

                {selectedReport.attachments?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-navy mb-3">
                      {language === 'en' ? 'Attachments' : 'Pièces jointes'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedReport.attachments.map((url, idx) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img 
                            src={url} 
                            alt={`Attachment ${idx + 1}`} 
                            className="rounded-lg w-full h-32 object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
