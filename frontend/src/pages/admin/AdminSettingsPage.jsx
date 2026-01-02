import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Save, Loader2, Mail, Phone, Facebook, Twitter, Instagram, CheckCircle, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Simple email validation
const isValidEmail = (email) => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Simple URL validation (allows empty)
const isValidUrl = (url) => {
  if (!url || url.trim() === '') return true; // Empty is ok
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// WhatsApp validation (must start with +)
const isValidWhatsApp = (num) => {
  if (!num) return false;
  return num.trim().startsWith('+');
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    contact_email: '',
    whatsapp: '',
    facebook: '',
    twitter: '',
    instagram: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`);
      const data = response.data;
      setSettings({
        contact_email: data.contact_email || '',
        whatsapp: data.whatsapp || '',
        facebook: data.facebook || '',
        twitter: data.twitter || '',
        instagram: data.instagram || ''
      });
      if (data.updated_at) {
        setLastSaved(new Date(data.updated_at));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!isValidEmail(settings.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }
    
    if (!isValidWhatsApp(settings.whatsapp)) {
      newErrors.whatsapp = 'WhatsApp number must include country code (e.g., +1...)';
    }
    
    if (!isValidUrl(settings.facebook)) {
      newErrors.facebook = 'Please enter a valid URL';
    }
    
    if (!isValidUrl(settings.twitter)) {
      newErrors.twitter = 'Please enter a valid URL';
    }
    
    if (!isValidUrl(settings.instagram)) {
      newErrors.instagram = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    setSaving(true);

    try {
      const response = await axios.put(`${API}/admin/settings`, settings);
      
      // Update state with returned data
      if (response.data) {
        setSettings({
          contact_email: response.data.contact_email || '',
          whatsapp: response.data.whatsapp || '',
          facebook: response.data.facebook || '',
          twitter: response.data.twitter || '',
          instagram: response.data.instagram || ''
        });
        if (response.data.updated_at) {
          setLastSaved(new Date(response.data.updated_at));
        }
      }
      
      toast.success('Settings saved successfully');
      setErrors({});
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.detail || 'Failed to save settings');
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
          {lastSaved && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Last saved: {lastSaved.toLocaleString()}
            </p>
          )}
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
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className={`mt-1 ${errors.contact_email ? 'border-red-500' : ''}`}
                    placeholder="contact@drepanhope.org"
                    data-testid="settings-email"
                  />
                  {errors.contact_email ? (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.contact_email}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-xs mt-1">
                      Displayed on Contact page and Thank You page
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp Number *</span>
                  </Label>
                  <Input
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    className={`mt-1 ${errors.whatsapp ? 'border-red-500' : ''}`}
                    placeholder="+1 (555) 123-4567"
                    data-testid="settings-whatsapp"
                  />
                  {errors.whatsapp ? (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.whatsapp}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-xs mt-1">
                      Include country code (e.g., +1 for USA). Used for WhatsApp links.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-display text-lg">Social Media Links</CardTitle>
                <p className="text-slate-400 text-xs">Leave empty to hide from footer</p>
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
                    className={`mt-1 ${errors.facebook ? 'border-red-500' : ''}`}
                    placeholder="https://facebook.com/drepanhope"
                    data-testid="settings-facebook"
                  />
                  {errors.facebook && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.facebook}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    <span>Twitter / X</span>
                  </Label>
                  <Input
                    value={settings.twitter}
                    onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                    className={`mt-1 ${errors.twitter ? 'border-red-500' : ''}`}
                    placeholder="https://twitter.com/drepanhope"
                    data-testid="settings-twitter"
                  />
                  {errors.twitter && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.twitter}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center space-x-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span>Instagram</span>
                  </Label>
                  <Input
                    value={settings.instagram}
                    onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                    className={`mt-1 ${errors.instagram ? 'border-red-500' : ''}`}
                    placeholder="https://instagram.com/drepanhope"
                    data-testid="settings-instagram"
                  />
                  {errors.instagram && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.instagram}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full bg-teal-600 hover:bg-teal-700"
                data-testid="save-settings-btn"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={fetchSettings}
                disabled={saving}
              >
                Reset
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
