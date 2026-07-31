import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Trash2, Plus, Play } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`,
});

const AdminVideos = ({ user }) => {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ video_url: '', title_en: '', title_zh: '' });
  const [saving, setSaving] = useState(false);

  const fetchVideos = async () => {
    try {
      const r = await axios.get(`${API}/videos`);
      setVideos(r.data);
    } catch (e) {
      toast.error('Failed to load videos');
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAdd = async () => {
    if (!form.video_url.trim()) {
      toast.error('Video URL is required');
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${API}/videos`,
        { ...form, order: videos.length },
        { headers: { ...getAuth(), 'Content-Type': 'application/json' } }
      );
      toast.success('Video added');
      setForm({ video_url: '', title_en: '', title_zh: '' });
      fetchVideos();
    } catch (e) {
      toast.error(e?.response?.data?.detail || 'Failed to add video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this video from Previous Performances?')) return;
    try {
      await axios.delete(`${API}/videos/${id}`, { headers: getAuth() });
      toast.success('Removed');
      fetchVideos();
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-videos-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-2">Performance Videos</h1>
        <p className="text-gray-600 mb-8">
          Paste YouTube or Vimeo links. They&apos;ll appear in the &quot;Previous Performances&quot; section on the homepage.
        </p>

        <Card className="mb-8" data-testid="video-add-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus size={22} /> Add Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video_url">YouTube or Vimeo URL *</Label>
              <Input
                id="video_url"
                value={form.video_url}
                onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
                data-testid="input-video-url"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title_en">Title (English)</Label>
                <Input
                  id="title_en"
                  value={form.title_en}
                  onChange={(e) => setForm((f) => ({ ...f, title_en: e.target.value }))}
                  placeholder="e.g., National Competition 2025 Finals"
                  data-testid="input-video-title-en"
                />
              </div>
              <div>
                <Label htmlFor="title_zh">Title (中文)</Label>
                <Input
                  id="title_zh"
                  value={form.title_zh}
                  onChange={(e) => setForm((f) => ({ ...f, title_zh: e.target.value }))}
                  placeholder="例如：2025 全国大赛决赛"
                  data-testid="input-video-title-zh"
                />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={saving} className="btn-primary" data-testid="add-video-btn">
              <Plus size={16} className="mr-2" />
              {saving ? 'Adding…' : 'Add Video'}
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="videos-list">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Video size={22} /> Live Videos ({videos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <p className="text-center py-12 text-gray-500">
                No videos yet. Add one above to fill the &quot;Previous Performances&quot; section.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((v) => (
                  <div key={v.id} className="border border-gray-200 rounded-sm overflow-hidden group relative" data-testid={`video-item-${v.id}`}>
                    <div className="aspect-video bg-black">
                      <iframe
                        src={v.embed_url}
                        className="w-full h-full"
                        title={v.title_en || 'Performance video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-3 text-sm">
                      {v.title_en && <div className="font-semibold">{v.title_en}</div>}
                      {v.title_zh && <div className="text-gray-600">{v.title_zh}</div>}
                      <a href={v.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                        <Play size={12} /> {v.video_url}
                      </a>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(v.id)}
                      className="absolute top-2 right-2 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`delete-video-${v.id}`}
                    >
                      <Trash2 size={14} />
                    </Button>
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

export default AdminVideos;
