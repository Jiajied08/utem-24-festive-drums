import React, { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, Image as ImageIcon } from 'lucide-react';
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

const AdminSettings = ({ user }) => {
  const [settings, setSettings] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const logoInputRef = useRef(null);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API}/settings/logo`, formData, {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Logo uploaded! Refresh the site to see it.');
      setSettings(prev => ({ ...prev, logo_path: response.data.logo_path }));
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/settings`, settings, { headers: getAuthHeader() });
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (!settings) return <AdminLayout user={user}><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-settings-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-8">Site Settings</h1>

        <Card className="mb-8" data-testid="logo-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon size={24} />
              Club Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37] bg-[#410C09] flex items-center justify-center overflow-hidden">
                {settings.logo_path ? (
                  <img
                    src={`${API}/files/${settings.logo_path}`}
                    alt="Current logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-heading text-[#D4AF37] text-2xl font-bold">廿四</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  Upload the club logo (recommended: 400x400px, square PNG or JPG). This appears in the navigation bar and footer. Use the same image as your Instagram profile picture for consistency.
                </p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  data-testid="logo-file-input"
                />
                <Button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-primary"
                  data-testid="upload-logo-btn"
                >
                  <Upload size={18} className="mr-2" />
                  {uploading ? 'Uploading...' : (settings.logo_path ? 'Replace Logo' : 'Upload Logo')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8" data-testid="contact-card">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp_captain">Captain WhatsApp</Label>
                <Input
                  id="whatsapp_captain"
                  value={settings.whatsapp_captain}
                  onChange={(e) => updateField('whatsapp_captain', e.target.value)}
                  data-testid="input-whatsapp-captain"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp_vice">Vice Captain WhatsApp</Label>
                <Input
                  id="whatsapp_vice"
                  value={settings.whatsapp_vice}
                  onChange={(e) => updateField('whatsapp_vice', e.target.value)}
                  data-testid="input-whatsapp-vice"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={settings.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  data-testid="input-email"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address_en">Address (English)</Label>
              <Input
                id="address_en"
                value={settings.address_en}
                onChange={(e) => updateField('address_en', e.target.value)}
                data-testid="input-address-en"
              />
            </div>
            <div>
              <Label htmlFor="address_zh">Address (中文)</Label>
              <Input
                id="address_zh"
                value={settings.address_zh}
                onChange={(e) => updateField('address_zh', e.target.value)}
                data-testid="input-address-zh"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8" data-testid="social-card">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instagram">Instagram Username</Label>
                <Input
                  id="instagram"
                  value={settings.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="utem24fd_official"
                  data-testid="input-instagram"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook Page ID</Label>
                <Input
                  id="facebook"
                  value={settings.facebook}
                  onChange={(e) => updateField('facebook', e.target.value)}
                  placeholder="utem24festivedrums"
                  data-testid="input-facebook"
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube Channel ID</Label>
                <Input
                  id="youtube"
                  value={settings.youtube || ''}
                  onChange={(e) => updateField('youtube', e.target.value)}
                  placeholder="UCfhI7K13yEpZgO7cIQ6kPoA"
                  data-testid="input-youtube"
                />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok Username</Label>
                <Input
                  id="tiktok"
                  value={settings.tiktok}
                  onChange={(e) => updateField('tiktok', e.target.value)}
                  placeholder="username"
                  data-testid="input-tiktok"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="btn-primary"
            data-testid="save-settings-btn"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
