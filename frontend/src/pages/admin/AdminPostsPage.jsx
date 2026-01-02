import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Calendar, ExternalLink, Tag } from 'lucide-react';
import ImageUpload from '../../components/ImageUpload';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_fr: '',
    excerpt_en: '',
    excerpt_fr: '',
    content_en: '',
    content_fr: '',
    cover_image: '',
    tags: '',
    published: false,
    campaign_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/admin/posts`),
        axios.get(`${API}/admin/campaigns`)
      ]);
      setPosts(postsRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title_en: '',
      title_fr: '',
      excerpt_en: '',
      excerpt_fr: '',
      content_en: '',
      content_fr: '',
      cover_image: '',
      tags: '',
      published: false,
      campaign_id: ''
    });
    setEditingPost(null);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      slug: post.slug,
      title_en: post.title_en,
      title_fr: post.title_fr,
      excerpt_en: post.excerpt_en,
      excerpt_fr: post.excerpt_fr,
      content_en: post.content_en,
      content_fr: post.content_fr,
      cover_image: post.cover_image || '',
      tags: post.tags?.join(', ') || '',
      published: post.published,
      campaign_id: post.campaign_id || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      campaign_id: formData.campaign_id || null
    };

    try {
      if (editingPost) {
        await axios.put(`${API}/admin/posts/${editingPost.id}`, payload);
        toast.success('Post updated successfully');
      } else {
        await axios.post(`${API}/admin/posts`, payload);
        toast.success('Post created successfully');
      }
      fetchData();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save post:', error);
      toast.error(error.response?.data?.detail || 'Failed to save post');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await axios.delete(`${API}/admin/posts/${postId}`);
      toast.success('Post deleted');
      fetchData();
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      await axios.put(`${API}/admin/posts/${post.id}/publish?published=${!post.published}`);
      toast.success(post.published ? 'Post unpublished' : 'Post published');
      fetchData();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      toast.error('Failed to update post');
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getCampaignName = (id) => {
    const campaign = campaigns.find(c => c.id === id);
    return campaign?.title_en || '-';
  };

  return (
    <AdminLayout>
      <div data-testid="admin-posts-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy">Blog Posts</h1>
            <p className="text-slate-500">Manage blog articles and news</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-teal-600 hover:bg-teal-700" data-testid="new-post-btn">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="my-blog-post"
                      required
                      data-testid="post-slug"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title_en) })}
                    >
                      Generate from Title
                    </Button>
                  </div>
                </div>

                {/* Titles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title_en">Title (English)</Label>
                    <Input
                      id="title_en"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                      data-testid="post-title-en"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title_fr">Title (French)</Label>
                    <Input
                      id="title_fr"
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      required
                      data-testid="post-title-fr"
                    />
                  </div>
                </div>

                {/* Excerpts */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                    <Textarea
                      id="excerpt_en"
                      value={formData.excerpt_en}
                      onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                      rows={2}
                      required
                      data-testid="post-excerpt-en"
                    />
                  </div>
                  <div>
                    <Label htmlFor="excerpt_fr">Excerpt (French)</Label>
                    <Textarea
                      id="excerpt_fr"
                      value={formData.excerpt_fr}
                      onChange={(e) => setFormData({ ...formData, excerpt_fr: e.target.value })}
                      rows={2}
                      required
                      data-testid="post-excerpt-fr"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content_en">Content (English)</Label>
                    <Textarea
                      id="content_en"
                      value={formData.content_en}
                      onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                      rows={8}
                      required
                      data-testid="post-content-en"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content_fr">Content (French)</Label>
                    <Textarea
                      id="content_fr"
                      value={formData.content_fr}
                      onChange={(e) => setFormData({ ...formData, content_fr: e.target.value })}
                      rows={8}
                      required
                      data-testid="post-content-fr"
                    />
                  </div>
                </div>

                {/* Cover Image & Tags */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <ImageUpload
                      value={formData.cover_image}
                      onChange={(url) => setFormData({ ...formData, cover_image: url })}
                      label="Cover Image"
                      folder="blog"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="health, news, updates"
                      data-testid="post-tags"
                    />
                  </div>
                </div>

                {/* Campaign & Published */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Related Campaign (Optional)</Label>
                    <Select 
                      value={formData.campaign_id || 'none'} 
                      onValueChange={(v) => setFormData({ ...formData, campaign_id: v === 'none' ? '' : v })}
                    >
                      <SelectTrigger data-testid="post-campaign">
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Campaign</SelectItem>
                        {campaigns.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                      data-testid="post-published"
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Publish immediately
                    </Label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" data-testid="save-post-btn">
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Posts Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-slate-500">Loading...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No blog posts yet</p>
                <p className="text-slate-400 text-sm">Create your first post to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Title</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Tags</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Campaign</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Date</th>
                      <th className="text-left py-4 px-6 text-slate-600 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {post.cover_image && (
                              <img 
                                src={post.cover_image} 
                                alt="" 
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-navy">{post.title_en}</p>
                              <p className="text-slate-400 text-xs">/{post.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {post.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {post.tags?.length > 3 && (
                              <span className="text-slate-400 text-xs">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 text-sm">
                          {getCampaignName(post.campaign_id)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            post.published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-sm">
                          {post.published_at 
                            ? new Date(post.published_at).toLocaleDateString()
                            : new Date(post.created_at).toLocaleDateString()
                          }
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePublish(post)}
                              title={post.published ? 'Unpublish' : 'Publish'}
                            >
                              {post.published ? (
                                <EyeOff className="w-4 h-4 text-slate-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            {post.published && (
                              <a 
                                href={`/blog/${post.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm" title="View">
                                  <ExternalLink className="w-4 h-4 text-teal-600" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(post)}
                              data-testid={`edit-post-${post.slug}`}
                            >
                              <Edit className="w-4 h-4 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                              data-testid={`delete-post-${post.slug}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
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
