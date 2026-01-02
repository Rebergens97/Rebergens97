import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';
import { Calendar, Tag, ArrowLeft, Heart, Share2, BookOpen } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/posts/${slug}`);
      setPost(response.data);
      
      // Fetch related campaign if exists
      if (response.data.campaign_id) {
        try {
          const campaignsRes = await axios.get(`${API}/campaigns`);
          const linkedCampaign = campaignsRes.data.find(c => c.id === response.data.campaign_id);
          if (linkedCampaign) setCampaign(linkedCampaign);
        } catch (e) {
          console.error('Failed to fetch campaign:', e);
        }
      }
      
      // Fetch related posts with same tags
      if (response.data.tags && response.data.tags.length > 0) {
        try {
          const allPostsRes = await axios.get(`${API}/posts`);
          const related = allPostsRes.data
            .filter(p => p.slug !== slug && p.tags?.some(t => response.data.tags.includes(t)))
            .slice(0, 3);
          setRelatedPosts(related);
        } catch (e) {
          console.error('Failed to fetch related posts:', e);
        }
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      if (error.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = language === 'en' ? post.title_en : post.title_fr;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (e) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert(t('blog.linkCopied'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-slate-500">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (notFound || !post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center py-20">
          <BookOpen className="w-16 h-16 text-slate-300 mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-4">{t('blog.notFound')}</h1>
          <Link to="/blog">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.backToBlog')}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const title = language === 'en' ? post.title_en : post.title_fr;
  const content = language === 'en' ? post.content_en : post.content_fr;

  return (
    <Layout>
      {/* Hero/Header */}
      <section className="bg-navy py-12" data-testid="blog-post-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link 
            to="/blog" 
            className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.backToBlog')}
          </Link>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <Link 
                  key={tag}
                  to={`/blog?tag=${tag}`}
                  className="px-3 py-1 bg-teal-600/30 text-teal-300 text-sm rounded-full hover:bg-teal-600/50"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
          
          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
          
          {/* Meta */}
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(post.published_at)}
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center hover:text-teal-400 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('blog.share')}
            </button>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={post.cover_image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-12" data-testid="blog-post-content">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-navy prose-a:text-teal-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
          />
        </div>
      </section>

      {/* Linked Campaign */}
      {campaign && (
        <section className="py-12 bg-slate-50" data-testid="blog-linked-campaign">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="font-display text-xl font-semibold text-navy mb-4">
              {t('blog.relatedCampaign')}
            </h3>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h4 className="font-display text-lg font-semibold text-navy mb-2">
                  {language === 'en' ? campaign.title_en : campaign.title_fr}
                </h4>
                <p className="text-slate-600 mb-4">
                  {language === 'en' ? campaign.summary_en : campaign.summary_fr}
                </p>
                <Link to={`/donate?campaign=${campaign.slug}`}>
                  <Button className="rounded-full bg-teal-600 hover:bg-teal-700">
                    <Heart className="w-4 h-4 mr-2" />
                    {t('campaigns.supportCampaign')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Donate CTA */}
      <section className="py-16 bg-coral" data-testid="blog-post-donate-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 text-white/80 mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            {t('blog.ctaTitle')}
          </h2>
          <p className="text-white/90 text-lg mb-8">
            {t('blog.ctaSubtitle')}
          </p>
          <Link to="/donate">
            <Button 
              size="lg"
              className="rounded-full bg-white text-coral hover:bg-slate-100 font-bold px-8 shadow-xl"
              data-testid="blog-post-donate-btn"
            >
              <Heart className="w-5 h-5 mr-2" />
              {t('nav.donate')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white" data-testid="blog-related-posts">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="font-display text-2xl font-bold text-navy mb-8">
              {t('blog.relatedPosts')}
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map(relatedPost => (
                <Card 
                  key={relatedPost.id} 
                  className="card-lift border-0 shadow-md overflow-hidden"
                >
                  {relatedPost.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.cover_image}
                        alt={language === 'en' ? relatedPost.title_en : relatedPost.title_fr}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center text-slate-500 text-sm mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(relatedPost.published_at)}
                    </div>
                    <h4 className="font-display text-lg font-semibold text-navy mb-2 line-clamp-2">
                      {language === 'en' ? relatedPost.title_en : relatedPost.title_fr}
                    </h4>
                    <Link to={`/blog/${relatedPost.slug}`}>
                      <Button variant="ghost" className="text-teal-600 p-0 h-auto">
                        {t('blog.readMore')}
                        <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
