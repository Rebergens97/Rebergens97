import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, FileText, Calendar, DollarSign } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title_en: '',
    title_fr: '',
    description_en: '',
    description_fr: '',
    amount_spent: 0,
    campaign_id: '',
    attachments: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/admin/reports`),
        axios.get(`${API}/admin/campaigns`)
      ]);
      setReports(reportsRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (report = null) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        title_en: report.title_en,
        title_fr: report.title_fr,
        description_en: report.description_en,
        description_fr: report.description_fr,
        amount_spent: report.amount_spent,
        campaign_id: report.campaign_id || '',
        attachments: report.attachments || []
      });
    } else {
      setEditingReport(null);
      setFormData({
        title_en: '',
        title_fr: '',
        description_en: '',
        description_fr: '',
        amount_spent: 0,
        campaign_id: '',
        attachments: []
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

      if (editingReport) {
        await axios.put(`${API}/admin/reports/${editingReport.id}`, payload);
        toast.success('Report updated');
      } else {
        await axios.post(`${API}/admin/reports`, payload);
        toast.success('Report created');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save report:', error);
      toast.error('Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await axios.delete(`${API}/admin/reports/${id}`);
      toast.success('Report deleted');
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
      <div data-testid="admin-reports-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">Transparency Reports</h1>
            <p className="text-slate-500">Manage public transparency reports</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()}
                className="rounded-full bg-teal-600 hover:bg-teal-700"
                data-testid="add-report-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingReport ? 'Edit Report' : 'New Report'}
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
                    <Label>Description (EN)</Label>
                    <Textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      rows={4}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description (FR)</Label>
                    <Textarea
                      value={formData.description_fr}
                      onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                      rows={4}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount Spent ($)</Label>
                    <Input
                      type="number"
                      value={formData.amount_spent}
                      onChange={(e) => setFormData({ ...formData, amount_spent: parseFloat(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Campaign (Optional)</Label>
                    <select
                      value={formData.campaign_id}
                      onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">General Report</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.title_en}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    {editingReport ? 'Update' : 'Create'}
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
        ) : reports.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No reports yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-slate-500 text-sm mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-navy mb-1">
                        {report.title_en}
                      </h3>
                      <p className="text-slate-400 text-sm mb-2">{report.title_fr}</p>
                      <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                        {report.description_en}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-teal-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-mono font-bold">
                            ${report.amount_spent.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-slate-400 text-sm">
                          {getCampaignName(report.campaign_id)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(report)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(report.id)}
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
