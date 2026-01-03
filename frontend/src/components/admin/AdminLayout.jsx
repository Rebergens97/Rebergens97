import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Toaster } from '../ui/sonner';
import { Helmet } from 'react-helmet';
import { 
  Heart, LayoutDashboard, Target, DollarSign, FileText, 
  Bell, Users, Settings, LogOut, Menu, ChevronRight, BookOpen 
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['owner', 'admin', 'editor', 'viewer'] },
    { href: '/admin/campaigns', icon: Target, label: 'Campaigns', roles: ['owner', 'admin'] },
    { href: '/admin/donations', icon: DollarSign, label: 'Donations', roles: ['owner', 'admin'] },
    { href: '/admin/posts', icon: BookOpen, label: 'Blog Posts', roles: ['owner', 'admin', 'editor'] },
    { href: '/admin/reports', icon: FileText, label: 'Reports', roles: ['owner', 'admin', 'editor'] },
    { href: '/admin/updates', icon: Bell, label: 'Updates', roles: ['owner', 'admin', 'editor'] },
    { href: '/admin/users', icon: Users, label: 'Users', roles: ['owner'] },
    { href: '/admin/settings', icon: Settings, label: 'Settings', roles: ['owner', 'admin'] },
  ];

  const isActive = (href) => {
    if (href === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* SEO: Prevent admin pages from being indexed by search engines */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-display font-semibold text-white">DrepanHope</span>
                  <p className="text-slate-400 text-xs">Admin Panel</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.filter(item => hasRole(item.roles)).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.href)
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-teal-600/30 flex items-center justify-center">
                <span className="text-teal-400 font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name}</p>
                <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full mt-2 text-slate-300 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>

            <div className="flex items-center space-x-4">
              <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                View Site
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
    </>
  );
};
