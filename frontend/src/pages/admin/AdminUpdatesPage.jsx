import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Bell, Calendar, Eye, EyeOff } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    body_en: '',
    body_fr: '',
    campaign_id: '',
    images: [],
    published: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [updatesRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/admin/updates`),
        axios.get(`${API}/admin/campaigns`)
      ]);
      setUpdates(updatesRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title_en: update.title_en,
        title_fr: update.title_fr,
        body_en: update.body_en,
        body_fr: update.body_fr,
        campaign_id: update.campaign_id || '',
        images: update.images || [],
        published: update.published
      });
    } else {
      setEditingUpdate(null);
      setFormData({
        title_en: '',
        title_fr: '',
        body_en: '',
        body_fr: '',
        campaign_id: '',
        images: [],
        published: true
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        campaign_id: formData.campaign_id || null
      };

      if (editingUpdate) {
        await axios.put(`${API}/admin/updates/${editingUpdate.id}`, payload);
        toast.success('Update saved');
      } else {
        await axios.post(`${API}/admin/updates`, payload);
        toast.success('Update created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(`${API}/admin/updates/${id}`);
      toast.success('Update deleted');
      fetchData();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete');
    }
  };

  const getCampaignName = (id) => {
    if (!id) return 'General';
    const campaign = campaigns.find(c => c.id === id);
    return campaign?.title_en || 'Unknown';
  };

  return (
    <AdminLayout>
      <div data-testid="admin-updates-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">News & Updates</h1>
            <p className="text-slate-500">Manage public news updates</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()}
                className="rounded-full bg-teal-600 hover:bg-teal-700"
                data-testid="add-update-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingUpdate ? 'Edit Update' : 'New Update'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title (EN)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Title (FR)</Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Body (EN)</Label>
                    <Textarea
                      value={formData.body_en}
                      onChange={(e) => setFormData({ ...formData, body_en: e.target.value })}
                      rows={4}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Body (FR)</Label>
                    <Textarea
                      value={formData.body_fr}
                      onChange={(e) => setFormData({ ...formData, body_fr: e.target.value })}
                      rows={4}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Campaign (Optional)</Label>
                    <select
                      value={formData.campaign_id}
                      onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">General Update</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.title_en}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                    />
                    <Label>Published</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingUpdate ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-slate-500">Loading...</div>
          </div>
        ) : updates.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No updates yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <Card key={update.id} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2 text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(update.date).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${
                          update.published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {update.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{update.published ? 'Published' : 'Draft'}</span>
                        </span>
                        <span className="text-slate-400 text-xs">
                          {getCampaignName(update.campaign_id)}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-navy">
                        {update.title_en}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">{update.title_fr}</p>
                      <p className="text-slate-600 text-sm line-clamp-2">
                        {update.body_en}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(update)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(update.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
