import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit, Trash2, Loader2, Users, Shield, User, Eye, Ban, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin'
  });

  const roles = [
    { value: 'owner', label: 'Owner', icon: Shield, color: 'text-coral' },
    { value: 'admin', label: 'Admin', icon: Users, color: 'text-teal-600' },
    { value: 'editor', label: 'Editor', icon: Edit, color: 'text-navy' },
    { value: 'viewer', label: 'Viewer', icon: Eye, color: 'text-slate-500' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    setNewUserPassword('');
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'admin'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingUser) {
        await axios.put(`${API}/admin/users/${editingUser.id}`, formData);
        toast.success('User updated');
        setDialogOpen(false);
      } else {
        const response = await axios.post(`${API}/admin/users`, formData);
        setNewUserPassword(response.data.temporary_password);
        toast.success('User created! Copy the temporary password.');
      }
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(error.response?.data?.detail || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`${API}/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await axios.put(`${API}/admin/users/${userId}/status?status=${newStatus}`);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'disabled'}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update status');
    }
  };

  const getRoleInfo = (role) => roles.find(r => r.value === role) || roles[3];

  return (
    <AdminLayout>
      <div data-testid="admin-users-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">Users</h1>
            <p className="text-slate-500">Manage admin users and roles</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setNewUserPassword('');
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()}
                className="rounded-full bg-teal-600 hover:bg-teal-700"
                data-testid="add-user-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingUser ? 'Edit User' : 'New User'}
                </DialogTitle>
              </DialogHeader>
              
              {newUserPassword ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-700 font-medium mb-2">User created successfully!</p>
                    <p className="text-sm text-green-600 mb-3">Copy this temporary password - it won't be shown again:</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-3 bg-white rounded-lg font-mono text-lg">
                        {newUserPassword}
                      </code>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(newUserPassword);
                          toast.success('Password copied!');
                        }}
                        variant="outline"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Button onClick={() => setDialogOpen(false)} className="w-full">
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>

                  {!editingUser && (
                    <p className="text-sm text-slate-500">
                      A temporary password will be generated. The user must change it on first login.
                    </p>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      {editingUser ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-slate-500">Loading...</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const RoleIcon = roleInfo.icon;
              
              return (
                <Card key={user.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-navy">{user.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${
                              user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-50 ${roleInfo.color}`}>
                          <RoleIcon className="w-4 h-4" />
                          <span className="text-sm font-medium capitalize">{user.role}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={user.status === 'active' ? 'text-red-600' : 'text-green-600'}
                          >
                            {user.status === 'active' ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
