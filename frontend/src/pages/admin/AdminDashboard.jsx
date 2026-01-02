import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import axios from 'axios';
import { DollarSign, TrendingUp, Calendar, Users, ArrowRight, FileText, Bell } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, donationsRes] = await Promise.all([
          axios.get(`${API}/admin/stats`),
          axios.get(`${API}/admin/donations`)
        ]);
        setStats(statsRes.data);
        setDonations(donationsRes.data.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Today's Donations</p>
                  <p className="font-mono font-bold text-2xl text-teal-600">
                    ${stats?.amounts?.today?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats?.donations?.today || 0} donations
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">This Month</p>
                  <p className="font-mono font-bold text-2xl text-navy">
                    ${stats?.amounts?.month?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats?.donations?.month || 0} donations
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-navy/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-navy" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">All Time</p>
                  <p className="font-mono font-bold text-2xl text-coral">
                    ${stats?.amounts?.total?.toLocaleString() || 0}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {stats?.donations?.total || 0} total donations
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-coral" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Donation Types</p>
                  <div className="flex items-center space-x-4 mt-2">
                    {stats?.by_type?.map((type) => (
                      <div key={type._id}>
                        <p className="font-bold text-navy">{type.count}</p>
                        <p className="text-slate-400 text-xs capitalize">{type._id?.replace('_', '-')}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Breakdown */}
        {stats?.by_campaign?.length > 0 && (
          <Card className="border-0 shadow-md mb-8">
            <CardHeader>
              <CardTitle className="font-display text-lg">By Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {stats.by_campaign.map((campaign) => (
                  <div key={campaign._id} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm font-medium truncate max-w-[200px]">
                        {campaign._id || 'Unknown Campaign'}
                      </span>
                      <span className="font-mono font-bold text-teal-600">
                        ${campaign.total?.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{campaign.count} donations</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Donations */}
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-lg">Recent Donations</CardTitle>
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
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-500 text-sm font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
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
                        <span className="font-mono font-bold text-teal-600">
                          ${donation.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize text-sm text-slate-600">
                          {donation.donation_type?.replace('_', '-')}
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
