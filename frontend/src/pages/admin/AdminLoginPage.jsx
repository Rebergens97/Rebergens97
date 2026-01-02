import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Heart, Loader2, Lock, Mail, RefreshCw, Bug } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${API_URL}/api`;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [email, setEmail] = useState('admin@drepanhope.org');
  const [password, setPassword] = useState('');
  const [devMode, setDevMode] = useState(false);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState(null);
  const [resetResult, setResetResult] = useState(null);

  // Check if dev mode is enabled
  useEffect(() => {
    const checkDevMode = async () => {
      try {
        const response = await axios.get(`${API}/config`);
        setDevMode(response.data.dev_mode === true);
      } catch (error) {
        console.log('Config check failed, assuming production mode');
        setDevMode(false);
      }
    };
    checkDevMode();
  }, []);

  const handleResetOwner = async () => {
    setResetting(true);
    setResetResult(null);
    setDebugInfo(null);
    
    const resetUrl = `${API}/dev/reset-owner`;
    
    try {
      const response = await axios.post(resetUrl);
      setResetResult({
        success: true,
        data: response.data,
        url: resetUrl
      });
      setPassword(response.data.temporary_password || 'Temp@12345!');
      toast.success(`Password reset! Use: ${response.data.temporary_password}`);
    } catch (error) {
      setResetResult({
        success: false,
        error: error.response?.data || error.message,
        url: resetUrl,
        status: error.response?.status
      });
      toast.error(`Reset failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo(null);

    const loginUrl = `${API}/auth/login`;
    console.log('[DEBUG] Login attempt:', { url: loginUrl, email });

    try {
      const user = await login(email, password);
      console.log('[DEBUG] Login success:', user);
      
      setDebugInfo({
        success: true,
        url: loginUrl,
        user: user,
        token: 'stored in localStorage'
      });
      
      toast.success('Login successful');
      
      if (user.force_password_change) {
        console.log('[DEBUG] Redirecting to change-password');
        navigate('/admin/change-password');
      } else {
        console.log('[DEBUG] Redirecting to admin dashboard');
        navigate('/admin');
      }
    } catch (error) {
      console.error('[DEBUG] Login error:', error);
      const errorDetail = error.response?.data?.detail || 'Invalid credentials';
      const debugData = error.response?.data?.debug || {};
      
      setDebugInfo({
        success: false,
        url: loginUrl,
        status: error.response?.status,
        error: errorDetail,
        debug: debugData
      });
      
      toast.error(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          {/* Dev Debug Panel */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-medium mb-2">
              <Bug className="w-4 h-4" />
              DEV DEBUG MODE
            </div>
            <p className="text-xs text-amber-600 mb-2">
              API: <code className="bg-amber-100 px-1 rounded">{API_URL}</code>
            </p>
            <Button
              type="button"
              onClick={handleResetOwner}
              disabled={resetting}
              variant="outline"
              size="sm"
              className="w-full text-amber-700 border-amber-300 hover:bg-amber-100"
              data-testid="reset-owner-btn"
            >
              {resetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Owner Password
                </>
              )}
            </Button>
            
            {/* Reset Result */}
            {resetResult && (
              <div className={`mt-2 p-2 rounded text-xs ${resetResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <p><strong>URL:</strong> {resetResult.url}</p>
                {resetResult.success ? (
                  <>
                    <p><strong>Email:</strong> {resetResult.data?.email}</p>
                    <p><strong>Temp Password:</strong> {resetResult.data?.temporary_password}</p>
                    <p><strong>Must Change:</strong> {String(resetResult.data?.must_change_password)}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Status:</strong> {resetResult.status}</p>
                    <p><strong>Error:</strong> {JSON.stringify(resetResult.error)}</p>
                  </>
                )}
              </div>
            )}
          </div>

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
                  placeholder="admin@drepanhope.org"
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

          {/* Login Debug Result */}
          {debugInfo && (
            <div className={`mt-4 p-3 rounded text-xs ${debugInfo.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <p className="font-medium mb-1">Login Debug Info:</p>
              <p><strong>URL:</strong> {debugInfo.url}</p>
              {debugInfo.success ? (
                <>
                  <p><strong>User:</strong> {debugInfo.user?.email} ({debugInfo.user?.role})</p>
                  <p><strong>Force Change:</strong> {String(debugInfo.user?.force_password_change)}</p>
                  <p><strong>Token:</strong> {debugInfo.token}</p>
                </>
              ) : (
                <>
                  <p><strong>Status:</strong> {debugInfo.status}</p>
                  <p><strong>Error:</strong> {debugInfo.error}</p>
                  {debugInfo.debug && Object.keys(debugInfo.debug).length > 0 && (
                    <>
                      <p><strong>User Found:</strong> {String(debugInfo.debug.userFound)}</p>
                      <p><strong>Password Match:</strong> {String(debugInfo.debug.passwordMatch)}</p>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
