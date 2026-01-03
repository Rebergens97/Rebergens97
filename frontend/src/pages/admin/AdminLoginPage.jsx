import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Heart, Loader2, Lock, Mail } from 'lucide-react';
import { Helmet } from 'react-helmet';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success('Login successful');
      
      if (user.force_password_change) {
        navigate('/admin/change-password');
      } else {
        navigate('/admin');
      }
    } catch (error) {
      const errorDetail = error.response?.data?.detail || 'Invalid credentials';
      toast.error(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SEO: Prevent admin pages from being indexed */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin Login - DrepanHope Foundation</title>
      </Helmet>
      
      <div className="min-h-screen bg-navy flex items-center justify-center p-4" data-testid="admin-login-page">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl text-navy">
              Admin Login
            </CardTitle>
            <p className="text-slate-500 text-sm mt-1">
              DrepanHope Foundation
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    placeholder="Enter your email"
                    required
                    data-testid="admin-email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    placeholder="••••••••"
                    required
                    data-testid="admin-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold mt-6"
                data-testid="admin-login-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
