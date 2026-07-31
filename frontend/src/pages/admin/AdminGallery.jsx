import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Upload, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';
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

const CATEGORIES = ['Events', 'Competitions', 'Training', 'Team Activities'];

const AdminGallery = ({ user }) => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [category, setCategory] = useState('Events');
  const [titleEn, setTitleEn] = useState('');
  const [titleZh, setTitleZh] = useState('');
  const inputRef = useRef(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }
    imageFiles.forEach(uploadFile);
  };

  const uploadFile = async (file) => {
    const uploadId = `upload_${Date.now()}_${Math.random()}`;
    setUploadQueue(prev => [...prev, { id: uploadId, name: file.name, status: 'uploading' }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title_en', titleEn || file.name.split('.')[0]);
      formData.append('title_zh', titleZh || '');
      formData.append('category', category);

      await axios.post(`${API}/gallery/upload`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'done' } : u));
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(u => u.id !== uploadId));
      }, 2000);
      fetchItems();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadQueue(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error' } : u));
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Remove this image from the gallery?')) return;
    try {
      await axios.delete(`${API}/gallery/${itemId}`, { headers: getAuthHeader() });
      toast.success('Image removed');
      fetchItems();
    } catch (error) {
      toast.error('Failed to remove image');
    }
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.category === filter);

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-gallery-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-8">Gallery Management</h1>

        <Card className="mb-8" data-testid="upload-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={24} />
              Upload Performance Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title_en">Title (EN, optional)</Label>
                <Input
                  id="title_en"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g., National Competition 2025"
                  data-testid="input-title-en"
                />
              </div>
              <div>
                <Label htmlFor="title_zh">Title (中文, optional)</Label>
                <Input
                  id="title_zh"
                  value={titleZh}
                  onChange={(e) => setTitleZh(e.target.value)}
                  placeholder="例如：2025年全国比赛"
                  data-testid="input-title-zh"
                />
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-gray-300 hover:border-[#410C09] hover:bg-gray-50'
              }`}
              data-testid="drop-zone"
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="file-input"
              />
              <ImageIcon size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700 mb-2">
                {dragActive ? 'Drop photos here!' : 'Drag & drop photos here'}
              </p>
              <p className="text-sm text-gray-500">
                or click to select files (multiple selection supported)
              </p>
            </div>

            {uploadQueue.length > 0 && (
              <div className="space-y-2" data-testid="upload-queue">
                {uploadQueue.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-sm text-sm">
                    <span className="truncate flex-1">{item.name}</span>
                    {item.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#410C09] ml-3" />
                    )}
                    {item.status === 'done' && <CheckCircle2 size={18} className="text-green-600 ml-3" />}
                    {item.status === 'error' && <X size={18} className="text-red-600 ml-3" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="gallery-list-card">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle>Gallery ({filteredItems.length})</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-[#410C09] text-white' : ''}
                  data-testid="filter-all"
                >
                  All
                </Button>
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat}
                    variant={filter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(cat)}
                    className={filter === cat ? 'bg-[#410C09] text-white' : ''}
                    data-testid={`filter-${cat}`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                No photos yet. Drag & drop above to upload.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group overflow-hidden rounded-sm border border-gray-200"
                    data-testid={`gallery-item-${item.id}`}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={`${API}/files/${item.storage_path}`}
                        alt={item.title_en || 'Gallery item'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3">
                      <p className="text-white text-sm font-semibold text-center mb-1">
                        {item.title_en || item.original_filename}
                      </p>
                      <p className="text-[#D4AF37] text-xs mb-3">{item.category}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        data-testid={`delete-${item.id}`}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
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

export default AdminGallery;
