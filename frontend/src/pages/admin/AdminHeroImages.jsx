import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Upload, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getAuth = () => ({
  Authorization: `Bearer ${document.cookie.split('; ').find((r) => r.startsWith('session_token='))?.split('=')[1] || ''}`
});

const AdminHeroImages = ({ user }) => {
  const [images, setImages] = useState([]);
  const [captionEn, setCaptionEn] = useState('');
  const [captionZh, setCaptionZh] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [queue, setQueue] = useState([]);
  const inputRef = useRef(null);

  const fetchImages = async () => {
    try {
      const r = await axios.get(`${API}/hero-images`);
      setImages(r.data);
    } catch (e) { toast.error('Failed to load'); }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) processFiles(Array.from(e.dataTransfer.files));
  };

  const processFiles = (files) => {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    if (imgs.length === 0) return toast.error('Select image files only');
    imgs.forEach(uploadFile);
  };

  const uploadFile = async (file) => {
    const id = `up_${Date.now()}_${Math.random()}`;
    setQueue(q => [...q, { id, name: file.name, status: 'uploading' }]);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('caption_en', captionEn);
      fd.append('caption_zh', captionZh);
      fd.append('order', images.length);
      await axios.post(`${API}/hero-images`, fd, {
        headers: { ...getAuth(), 'Content-Type': 'multipart/form-data' }
      });
      setQueue(q => q.map(x => x.id === id ? { ...x, status: 'done' } : x));
      setTimeout(() => setQueue(q => q.filter(x => x.id !== id)), 2000);
      fetchImages();
    } catch (e) {
      setQueue(q => q.map(x => x.id === id ? { ...x, status: 'error' } : x));
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this image from the home hero?')) return;
    try {
      await axios.delete(`${API}/hero-images/${id}`, { headers: getAuth() });
      toast.success('Removed');
      fetchImages();
    } catch (e) { toast.error('Failed to remove'); }
  };

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-hero-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-2">Home Hero Carousel</h1>
        <p className="text-gray-600 mb-8">Upload photos from your latest events. Multiple images auto-rotate every 6 seconds on the homepage, with arrows and dot navigation.</p>

        <Card className="mb-8" data-testid="upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Upload size={22} /> Add Hero Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="caption_en">Caption (English, optional)</Label>
                <Input id="caption_en" value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} placeholder="e.g., National Competition 2025" data-testid="input-caption-en" />
              </div>
              <div>
                <Label htmlFor="caption_zh">Caption (中文, optional)</Label>
                <Input id="caption_zh" value={captionZh} onChange={(e) => setCaptionZh(e.target.value)} placeholder="例如：2025年全国比赛" data-testid="input-caption-zh" />
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-300 hover:border-[#410C09] hover:bg-gray-50'
              }`}
              data-testid="drop-zone"
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files?.length && processFiles(Array.from(e.target.files))}
                className="hidden"
                data-testid="file-input"
              />
              <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {dragActive ? 'Drop images here!' : 'Drag & drop hero images here'}
              </p>
              <p className="text-sm text-gray-500">or click to select — landscape photos work best (1920×1080+)</p>
            </div>

            {queue.length > 0 && (
              <div className="space-y-2">
                {queue.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm text-sm">
                    <span className="truncate flex-1">{item.name}</span>
                    {item.status === 'uploading' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#410C09] ml-3" />}
                    {item.status === 'done' && <CheckCircle2 size={18} className="text-green-600 ml-3" />}
                    {item.status === 'error' && <X size={18} className="text-red-600 ml-3" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="images-list">
          <CardHeader><CardTitle>Live Carousel ({images.length})</CardTitle></CardHeader>
          <CardContent>
            {images.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No hero images yet. Upload one above to fill the homepage cover.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map(img => (
                  <div key={img.id} className="border border-gray-200 rounded-sm overflow-hidden group relative" data-testid={`hero-image-${img.id}`}>
                    <div className="aspect-video bg-gray-100">
                      <img src={`${API}/files/${img.storage_path}`} alt={img.caption_en} className="w-full h-full object-cover" />
                    </div>
                    {(img.caption_en || img.caption_zh) && (
                      <div className="p-3 text-sm">
                        {img.caption_en && <div className="font-semibold">{img.caption_en}</div>}
                        {img.caption_zh && <div className="text-gray-600">{img.caption_zh}</div>}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(img.id)}
                      className="absolute top-2 right-2 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`delete-${img.id}`}
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

export default AdminHeroImages;
