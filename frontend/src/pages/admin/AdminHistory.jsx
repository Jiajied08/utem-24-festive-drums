import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
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

const emptyForm = {
  id: null,
  year: new Date().getFullYear(),
  title_en: '',
  title_zh: '',
  description_en: '',
  description_zh: '',
  order: 0,
  file: null
};

const AdminHistory = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/history`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEdit = (event) => {
    setForm({
      id: event.id,
      year: event.year,
      title_en: event.title_en,
      title_zh: event.title_zh,
      description_en: event.description_en || '',
      description_zh: event.description_zh || '',
      order: event.order || 0,
      file: null,
      existing_image: event.image_path
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.title_en || !form.title_zh || !form.year) {
      toast.error('Year and both titles are required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('year', form.year);
      formData.append('title_en', form.title_en);
      formData.append('title_zh', form.title_zh);
      formData.append('description_en', form.description_en);
      formData.append('description_zh', form.description_zh);
      formData.append('order', form.order);
      if (form.file) formData.append('file', form.file);

      const config = {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
      };

      if (form.id) {
        await axios.put(`${API}/history/${form.id}`, formData, config);
        toast.success('Milestone updated');
      } else {
        await axios.post(`${API}/history`, formData, config);
        toast.success('Milestone added');
      }

      setShowDialog(false);
      setForm(emptyForm);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await axios.delete(`${API}/history/${eventId}`, { headers: getAuthHeader() });
      toast.success('Milestone deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-history-page">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-heading font-bold text-[#410C09]">History Timeline</h1>
          <Button onClick={openNew} className="btn-primary" data-testid="add-milestone-btn">
            <Plus size={18} className="mr-2" />
            Add Milestone
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Timeline Events ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-center text-gray-500 py-12">
                No milestones yet. Click Add Milestone to start building the timeline.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-sm hover:bg-gray-50"
                    data-testid={`history-item-${event.id}`}
                  >
                    {event.image_path ? (
                      <img
                        src={`${API}/files/${event.image_path}`}
                        alt=""
                        className="w-24 h-24 object-cover rounded-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-[#F5F1E7] rounded-sm flex-shrink-0 flex items-center justify-center">
                        <Calendar size={32} className="text-[#410C09]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-heading text-2xl font-bold text-[#410C09]">{event.year}</div>
                      <div className="font-semibold">{event.title_en}</div>
                      <div className="text-sm text-gray-600">{event.title_zh}</div>
                      {event.description_en && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description_en}</div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(event)}
                        data-testid={`edit-${event.id}`}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:bg-red-50"
                        data-testid={`delete-${event.id}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="milestone-dialog">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-[#410C09]">
                {form.id ? 'Edit Milestone' : 'Add New Milestone'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })}
                    min="2000"
                    max="2100"
                    data-testid="input-year"
                  />
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    data-testid="input-order"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title_en">Title (English) *</Label>
                <Input
                  id="title_en"
                  value={form.title_en}
                  onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  placeholder="e.g., 1st National University 24 Festive Drums Competition"
                  data-testid="input-title-en"
                />
              </div>

              <div>
                <Label htmlFor="title_zh">Title (中文) *</Label>
                <Input
                  id="title_zh"
                  value={form.title_zh}
                  onChange={(e) => setForm({ ...form, title_zh: e.target.value })}
                  placeholder="例如：第一届全国大学24节令鼓比赛"
                  data-testid="input-title-zh"
                />
              </div>

              <div>
                <Label htmlFor="description_en">Description (English)</Label>
                <Textarea
                  id="description_en"
                  value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                  rows={3}
                  data-testid="input-description-en"
                />
              </div>

              <div>
                <Label htmlFor="description_zh">Description (中文)</Label>
                <Textarea
                  id="description_zh"
                  value={form.description_zh}
                  onChange={(e) => setForm({ ...form, description_zh: e.target.value })}
                  rows={3}
                  data-testid="input-description-zh"
                />
              </div>

              <div>
                <Label htmlFor="file">
                  Photo {form.existing_image ? '(upload to replace)' : '(optional)'}
                </Label>
                {form.existing_image && !form.file && (
                  <div className="mb-2">
                    <img
                      src={`${API}/files/${form.existing_image}`}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded-sm"
                    />
                  </div>
                )}
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
                  data-testid="input-file"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)} data-testid="cancel-btn">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-btn">
                {saving ? 'Saving...' : 'Save Milestone'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminHistory;
