import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Save, Loader2, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    contact_email: 'contact@drepanhope.org',
    whatsapp: '+1 (000) 000-0000',
    facebook: '',
    twitter: '',
    instagram: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/admin/settings`, settings);
      toast.success('Settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div data-testid="admin-settings-page">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy">Settings</h1>
          <p className="text-slate-500">Manage site-wide settings and contact information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 max-w-2xl">
            {/* Contact Information */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-teal-600" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="mt-1"
                    placeholder="contact@drepanhope.org"
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    This email will be displayed on the Contact page and Thank You page
                  </p>
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Number</span>
                  </Label>
                  <Input
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="mt-1"
                    placeholder="+1 (000) 000-0000"
                  />
                  <p className="text-slate-400 text-xs mt-1">
                    Include country code. Used for WhatsApp contact links.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-lg">Social Media Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center space-x-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span>Facebook</span>
                  </Label>
                  <Input
                    value={settings.facebook}
                    onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                    className="mt-1"
                    placeholder="https://facebook.com/drepanhope"
                  />
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    <span>Twitter / X</span>
                  </Label>
                  <Input
                    value={settings.twitter}
                    onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                    className="mt-1"
                    placeholder="https://twitter.com/drepanhope"
                  />
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span>Instagram</span>
                  </Label>
                  <Input
                    value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    className="mt-1"
                    placeholder="https://instagram.com/drepanhope"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-teal-600 hover:bg-teal-700 w-fit"
              data-testid="save-settings-btn"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
