import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Download, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    campaign_id: 'all',
    donation_type: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donationsRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/admin/donations`),
        axios.get(`${API}/admin/campaigns`)
      ]);
      setDonations(donationsRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await axios.put(`${API}/admin/donations/${donationId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API}/admin/donations/export`);
      const csvContent = convertToCSV(response.data.donations);
      downloadCSV(csvContent, 'donations.csv');
      toast.success('Export downloaded');
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredDonations = donations.filter(d => {
    if (filters.status && filters.status !== 'all' && d.status !== filters.status) return false;
    if (filters.campaign_id && filters.campaign_id !== 'all' && d.campaign_id !== filters.campaign_id) return false;
    if (filters.donation_type && filters.donation_type !== 'all' && d.donation_type !== filters.donation_type) return false;
    return true;
  });

  const getCampaignName = (id) => {
    const campaign = campaigns.find(c => c.id === id);
    return campaign?.title_en || 'Unknown';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div data-testid="admin-donations-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">Donations</h1>
            <p className="text-slate-500">Manage and track all donations</p>
          </div>
          <Button 
            onClick={handleExport}
            variant="outline"
            className="rounded-full"
            data-testid="export-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <Filter className="w-5 h-5 text-slate-400" />
              <Select 
                value={filters.status} 
                onValueChange={(v) => setFilters({ ...filters, status: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.campaign_id} 
                onValueChange={(v) => setFilters({ ...filters, campaign_id: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.filter(c => c.id).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.donation_type} 
                onValueChange={(v) => setFilters({ ...filters, donation_type: v })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>

              {(filters.status !== 'all' || filters.campaign_id !== 'all' || filters.donation_type !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFilters({ status: 'all', campaign_id: 'all', donation_type: 'all' })}
                >
                  Clear
                </Button>
              )}

              <span className="text-slate-500 text-sm ml-auto">
                {filteredDonations.length} donation(s)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Donations Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-slate-500">Loading...</div>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No donations found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Donor</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Amount</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Campaign</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Type</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Date</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-navy">
                              {donation.donor_first_name} {donation.donor_last_name}
                            </p>
                            <p className="text-slate-400 text-xs">{donation.email}</p>
                            <p className="text-slate-400 text-xs">{donation.country}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-teal-600 text-lg">
                            ${donation.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-slate-600 text-sm">
                            {getCampaignName(donation.campaign_id)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="capitalize text-slate-600 text-sm">
                            {donation.donation_type?.replace('_', '-')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(donation.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              donation.status === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : donation.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {donation.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-sm">
                          {new Date(donation.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          {donation.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(donation.id, 'paid')}
                              className="bg-green-600 hover:bg-green-700 text-white rounded-full text-xs"
                            >
                              Mark Paid
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
