import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import axios from 'axios';
import { Calendar, Tag, ArrowRight, Search, Heart, BookOpen } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPage() {
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    fetchTags();
  }, [selectedTag]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedTag) params.append('tag', selectedTag);
      const response = await axios.get(`${API}/posts?${params.toString()}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API}/posts/tags/all`);
      setAllTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const title = language === 'en' ? post.title_en : post.title_fr;
    const excerpt = language === 'en' ? post.excerpt_en : post.excerpt_fr;
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || excerpt.toLowerCase().includes(query);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-navy py-16" data-testid="blog-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder={t('blog.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
                data-testid="blog-search"
              />
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-slate-500 text-sm">{t('blog.filterByTag')}:</span>
                <Button
                  variant={selectedTag === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag('')}
                  className="rounded-full"
                >
                  {t('blog.allPosts')}
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className="rounded-full"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 bg-white" data-testid="blog-posts">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-slate-500">{t('common.loading')}</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{t('blog.noPosts')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <Card 
                  key={post.id} 
                  className="card-lift border-0 shadow-md overflow-hidden"
                  data-testid={`blog-post-${post.slug}`}
                >
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={language === 'en' ? post.title_en : post.title_fr}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map(tag => (
                          <span 
                            key={tag}
                            className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Date */}
                    <div className="flex items-center text-slate-500 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(post.published_at)}
                    </div>
                    
                    {/* Title */}
                    <h2 className="font-display text-xl font-semibold text-navy mb-3 line-clamp-2">
                      {language === 'en' ? post.title_en : post.title_fr}
                    </h2>
                    
                    {/* Excerpt */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {language === 'en' ? post.excerpt_en : post.excerpt_fr}
                    </p>
                    
                    {/* Read More */}
                    <Link to={`/blog/${post.slug}`}>
                      <Button 
                        variant="ghost" 
                        className="text-teal-600 hover:text-teal-700 p-0 h-auto font-medium"
                      >
                        {t('blog.readMore')}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donate CTA */}
      <section className="py-16 bg-teal-600" data-testid="blog-donate-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            {t('blog.ctaTitle')}
          </h2>
          <p className="text-teal-100 text-lg mb-8">
            {t('blog.ctaSubtitle')}
          </p>
          <Link to="/donate">
            <Button 
              size="lg"
              className="rounded-full bg-coral hover:bg-coral-600 text-white font-bold px-8 shadow-xl"
              data-testid="blog-donate-btn"
            >
              <Heart className="w-5 h-5 mr-2" />
              {t('nav.donate')}
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
