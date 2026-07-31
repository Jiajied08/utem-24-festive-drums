import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Instagram, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('session_token='))
    ?.split('=')[1] || '';
  return { Authorization: `Bearer ${token}` };
};

const AdminInstagram = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [postUrl, setPostUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/instagram-posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!postUrl.includes('instagram.com')) {
      toast.error('Please enter a valid Instagram post URL');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/instagram-posts`,
        {
          post_url: postUrl,
          shortcode: '',
          caption: caption,
          order: posts.length
        },
        { headers: getAuthHeader() }
      );
      toast.success('Instagram post added');
      setPostUrl('');
      setCaption('');
      fetchPosts();
    } catch (error) {
      console.error('Failed to add:', error);
      toast.error(error.response?.data?.detail || 'Failed to add post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Remove this Instagram post from the homepage?')) return;
    try {
      await axios.delete(`${API}/instagram-posts/${postId}`, {
        headers: getAuthHeader()
      });
      toast.success('Post removed');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to remove post');
    }
  };

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-instagram-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-8">Instagram Feed</h1>

        <Card className="mb-8" data-testid="add-post-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram size={24} />
              Add Instagram Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="post_url">Instagram Post URL *</Label>
                <Input
                  id="post_url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/DXV5kFakuhT/"
                  required
                  data-testid="input-post-url"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full URL of any public Instagram post or reel from @utem24fd_official
                </p>
              </div>
              <div>
                <Label htmlFor="caption">Caption (optional)</Label>
                <Input
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional internal note"
                  data-testid="input-caption"
                />
              </div>
              <Button type="submit" className="btn-primary" disabled={loading} data-testid="add-post-btn">
                {loading ? 'Adding...' : 'Add to Homepage'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card data-testid="posts-list-card">
          <CardHeader>
            <CardTitle>Displayed Posts ({posts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No Instagram posts added yet. Add posts above to display them on the homepage.
              </p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-sm"
                    data-testid={`post-item-${post.shortcode}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-[#410C09]">/p/{post.shortcode}/</p>
                      {post.caption && <p className="text-sm text-gray-600 mt-1">{post.caption}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#410C09]"
                        data-testid={`view-post-${post.shortcode}`}
                      >
                        <ExternalLink size={18} />
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        data-testid={`delete-post-${post.shortcode}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminInstagram;
