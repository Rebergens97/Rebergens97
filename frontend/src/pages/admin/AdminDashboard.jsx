import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import axios from 'axios';
import { DollarSign, TrendingUp, Calendar, Users, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, donationsRes, campaignsRes] = await Promise.all([
          axios.get(`${API}/admin/stats`),
          axios.get(`${API}/admin/donations`),
          axios.get(`${API}/admin/campaigns`)
        ]);
        setStats(statsRes.data);
        setDonations(donationsRes.data.slice(0, 10));
        setCampaigns(campaignsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to get campaign name by ID
  const getCampaignName = (campaignId) => {
    if (!campaignId) return 'General';
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.title_en || campaignId.slice(0, 8) + '...';
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
      <div data-testid="admin-dashboard">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's your overview.</p>
        </div>

        {/* Revenue Stats Grid - PAID ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-md border-l-4 border-l-teal-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Today's Revenue
                  </p>
                  <p className="font-mono font-bold text-2xl text-teal-600">
                    ${stats?.amounts?.today?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats?.donations?.today || 0} paid donations
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md border-l-4 border-l-navy">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    This Month Revenue
                  </p>
                  <p className="font-mono font-bold text-2xl text-navy">
                    ${stats?.amounts?.month?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats?.donations?.month || 0} paid donations
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-navy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md border-l-4 border-l-coral">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    All Time Revenue
                  </p>
                  <p className="font-mono font-bold text-2xl text-coral">
                    ${stats?.amounts?.total?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats?.donations?.total || 0} paid donations
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-coral" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Card */}
          <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    Pending
                  </p>
                  <p className="font-mono font-bold text-2xl text-amber-600">
                    ${stats?.pending?.amount?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats?.pending?.count || 0} awaiting payment
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        {stats?.by_status?.length > 0 && (
          <Card className="border-0 shadow-md mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {stats.by_status.map((status) => (
                  <div 
                    key={status._id || 'unknown'} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                      status._id === 'paid' ? 'bg-green-50' :
                      status._id === 'pending' ? 'bg-amber-50' : 'bg-slate-50'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      status._id === 'paid' ? 'bg-green-500' :
                      status._id === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                    <div>
                      <p className="font-medium text-navy capitalize">{status._id || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">
                        {status.count} donations · ${status.total?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Breakdown - PAID ONLY */}
        {stats?.by_campaign?.length > 0 && (
          <Card className="border-0 shadow-md mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg">Revenue by Campaign</CardTitle>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Paid only
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {stats.by_campaign.map((campaign) => (
                  <div key={campaign._id} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm font-medium truncate max-w-[200px]">
                        {getCampaignName(campaign._id)}
                      </span>
                      <span className="font-mono font-bold text-teal-600">
                        ${campaign.total?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{campaign.count} paid donations</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Donation Types - PAID ONLY */}
        {stats?.by_type?.length > 0 && (
          <Card className="border-0 shadow-md mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg">Donation Types</CardTitle>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Paid only
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {stats.by_type.map((type) => (
                  <div key={type._id} className="text-center">
                    <p className="font-bold text-2xl text-navy">{type.count}</p>
                    <p className="text-slate-400 text-sm capitalize">{type._id?.replace('_', ' ') || 'Unknown'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Donations - All statuses */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg">Recent Donations</CardTitle>
              <p className="text-xs text-slate-400 mt-1">All statuses shown</p>
            </div>
            <Link to="/admin/donations">
              <Button variant="ghost" size="sm" className="text-teal-600">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Donor</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Campaign</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No donations yet
                      </td>
                    </tr>
                  ) : (
                    donations.map((donation) => (
                      <tr key={donation.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-navy">
                              {donation.donor_first_name} {donation.donor_last_name}
                            </p>
                            <p className="text-slate-400 text-xs">{donation.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-600">
                            {getCampaignName(donation.campaign_id)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-teal-600">
                            ${donation.amount?.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize text-sm text-slate-600">
                            {donation.donation_type?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donation.status === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : donation.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
