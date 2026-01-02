import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Target } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_fr: '',
    summary_en: '',
    summary_fr: '',
    body_en: '',
    body_fr: '',
    goal_amount: 0,
    active: true,
    cover_image: '',
    amount_cards: []
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/admin/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        slug: campaign.slug,
        title_en: campaign.title_en,
        title_fr: campaign.title_fr,
        summary_en: campaign.summary_en,
        summary_fr: campaign.summary_fr,
        body_en: campaign.body_en,
        body_fr: campaign.body_fr,
        goal_amount: campaign.goal_amount,
        active: campaign.active,
        cover_image: campaign.cover_image,
        amount_cards: campaign.amount_cards || []
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        slug: '',
        title_en: '',
        title_fr: '',
        summary_en: '',
        summary_fr: '',
        body_en: '',
        body_fr: '',
        goal_amount: 0,
        active: true,
        cover_image: '',
        amount_cards: [
          { amount: 25, impact_en: '', impact_fr: '' },
          { amount: 50, impact_en: '', impact_fr: '' },
          { amount: 100, impact_en: '', impact_fr: '' },
          { amount: 250, impact_en: '', impact_fr: '' },
          { amount: 500, impact_en: '', impact_fr: '' }
        ]
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCampaign) {
        await axios.put(`${API}/admin/campaigns/${editingCampaign.id}`, formData);
        toast.success('Campaign updated successfully');
      } else {
        await axios.post(`${API}/admin/campaigns`, formData);
        toast.success('Campaign created successfully');
      }
      setDialogOpen(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to save campaign:', error);
      toast.error('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await axios.delete(`${API}/admin/campaigns/${id}`);
      toast.success('Campaign deleted');
      fetchCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const updateAmountCard = (index, field, value) => {
    const newCards = [...formData.amount_cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setFormData({ ...formData, amount_cards: newCards });
  };

  return (
    <AdminLayout>
      <div data-testid="admin-campaigns-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">Campaigns</h1>
            <p className="text-slate-500">Manage your fundraising campaigns</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()} 
                className="rounded-full bg-teal-600 hover:bg-teal-700"
                data-testid="add-campaign-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingCampaign ? 'Edit Campaign' : 'New Campaign'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="sickle-cell"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Goal Amount ($)</Label>
                    <Input
                      type="number"
                      value={formData.goal_amount}
                      onChange={(e) => setFormData({ ...formData, goal_amount: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>

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
                    <Label>Summary (EN)</Label>
                    <Textarea
                      value={formData.summary_en}
                      onChange={(e) => setFormData({ ...formData, summary_en: e.target.value })}
                      rows={2}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Summary (FR)</Label>
                    <Textarea
                      value={formData.summary_fr}
                      onChange={(e) => setFormData({ ...formData, summary_fr: e.target.value })}
                      rows={2}
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

                <div>
                  <Label>Cover Image URL</Label>
                  <Input
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                {/* Amount Cards */}
                <div>
                  <Label className="text-lg font-semibold">Donation Amount Cards</Label>
                  <div className="mt-3 space-y-4">
                    {formData.amount_cards.map((card, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-teal-600">${card.amount}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Impact (EN)</Label>
                            <Input
                              value={card.impact_en}
                              onChange={(e) => updateAmountCard(index, 'impact_en', e.target.value)}
                              placeholder="Impact description..."
                              className="mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Impact (FR)</Label>
                            <Input
                              value={card.impact_fr}
                              onChange={(e) => updateAmountCard(index, 'impact_fr', e.target.value)}
                              placeholder="Description de l'impact..."
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingCampaign ? 'Update' : 'Create'}
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
        ) : campaigns.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No campaigns yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="border-0 shadow-md overflow-hidden">
                <div className="flex">
                  {campaign.cover_image && (
                    <img 
                      src={campaign.cover_image} 
                      alt={campaign.title_en}
                      className="w-48 h-32 object-cover hidden sm:block"
                    />
                  )}
                  <CardContent className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-display text-xl font-semibold text-navy">
                            {campaign.title_en}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            campaign.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {campaign.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">{campaign.title_fr}</p>
                        <p className="text-slate-600 text-sm mt-2 line-clamp-2">{campaign.summary_en}</p>
                        <p className="text-teal-600 font-mono font-bold mt-2">
                          Goal: ${campaign.goal_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenDialog(campaign)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
