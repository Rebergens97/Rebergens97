import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Send, Loader2, MessageCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactPage() {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/contact`, formData);
      toast.success(t('contact.success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50" data-testid="contact-page">
        {/* Header */}
        <section className="bg-navy py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                            {t('contact.name')} *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1 h-12 rounded-xl"
                            required
                            data-testid="contact-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                            {t('contact.email')} *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 h-12 rounded-xl"
                            required
                            data-testid="contact-email"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                          {t('contact.subject')} *
                        </Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="mt-1 h-12 rounded-xl"
                          required
                          data-testid="contact-subject"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                          {t('contact.message')} *
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="mt-1 rounded-xl"
                          rows={6}
                          required
                          data-testid="contact-message"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                        data-testid="contact-submit"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            {t('contact.send')}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold text-navy mb-4">
                      {t('contact.emailUs')}
                    </h3>
                    <a 
                      href={`mailto:${settings.contact_email}`}
                      className="flex items-center space-x-3 text-slate-600 hover:text-teal-600 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-teal-600" />
                      </div>
                      <span>{settings.contact_email || 'contact@drepanhope.org'}</span>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold text-navy mb-4">
                      {t('contact.whatsapp')}
                    </h3>
                    <a 
                      href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-slate-600 hover:text-teal-600 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <span>{settings.whatsapp || '+1 (000) 000-0000'}</span>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-display text-lg font-semibold text-navy mb-4">
                      {t('contact.followUs')}
                    </h3>
                    <div className="flex space-x-3">
                      <a 
                        href={settings.facebook || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-100 flex items-center justify-center transition-colors group"
                      >
                        <Facebook className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
                      </a>
                      <a 
                        href={settings.twitter || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-sky-100 flex items-center justify-center transition-colors group"
                      >
                        <Twitter className="w-5 h-5 text-slate-600 group-hover:text-sky-600" />
                      </a>
                      <a 
                        href={settings.instagram || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-pink-100 flex items-center justify-center transition-colors group"
                      >
                        <Instagram className="w-5 h-5 text-slate-600 group-hover:text-pink-600" />
                      </a>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-navy text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <MapPin className="w-5 h-5 text-teal-400" />
                      <span className="font-medium">
                        {language === 'en' ? 'Based in the USA' : 'Basée aux États-Unis'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm">
                      {language === 'en' 
                        ? 'Global mission • Transparent reporting • Local partners worldwide'
                        : 'Mission globale • Transparence • Partenaires locaux dans le monde entier'}
                    </p>
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
