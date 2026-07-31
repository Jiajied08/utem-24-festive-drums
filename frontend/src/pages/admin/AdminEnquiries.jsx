import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STATUSES = ['New', 'Contacted', 'Quotation Sent', 'Confirmed', 'Completed', 'Declined'];

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-yellow-100 text-yellow-800',
  'Quotation Sent': 'bg-purple-100 text-purple-800',
  'Confirmed': 'bg-green-100 text-green-800',
  'Completed': 'bg-gray-100 text-gray-800',
  'Declined': 'bg-red-100 text-red-800'
};

const getAuthHeader = () => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('session_token='))
    ?.split('=')[1] || '';
  return { Authorization: `Bearer ${token}` };
};

const AdminEnquiries = ({ user }) => {
  const [enquiries, setEnquiries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/enquiries`, { headers: getAuthHeader() });
      setEnquiries(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const updateStatus = async (enquiryId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      await axios.put(`${API}/enquiries/${enquiryId}`, formData, {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Status updated');
      fetchEnquiries();
      if (selected?.id === enquiryId) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportCSV = () => {
    if (enquiries.length === 0) {
      toast.error('No enquiries to export');
      return;
    }

    const headers = [
      'ID', 'Status', 'Created At', 'Organization', 'Contact Person',
      'Phone', 'Email', 'Event Name', 'Event Type', 'Event Date',
      'Performance Time', 'Venue', 'Package', 'Audience Size',
      'Indoor/Outdoor', 'Duration', 'Budget', 'Requirements'
    ];

    const data = filteredEnquiries;
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...data.map(e => [
        e.id, e.status, e.created_at, e.org_name, e.contact_person,
        e.phone, e.email, e.event_name, e.event_type, e.event_date,
        e.performance_time, e.venue, e.package_selected, e.audience_size,
        e.indoor_outdoor, e.duration, e.budget, e.requirements
      ].map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `utem-24fd-enquiries-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} enquiries`);
  };

  const filteredEnquiries = filter === 'all' ? enquiries : enquiries.filter(e => e.status === filter);

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = enquiries.filter(e => e.status === s).length;
    return acc;
  }, {});

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-enquiries-page">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-heading font-bold text-[#410C09]">Performance Enquiries</h1>
          <Button
            onClick={exportCSV}
            className="btn-primary"
            disabled={enquiries.length === 0}
            data-testid="export-csv-btn"
          >
            <Download size={18} className="mr-2" />
            Export CSV ({filteredEnquiries.length})
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          <Card
            onClick={() => setFilter('all')}
            className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-[#410C09]' : ''}`}
            data-testid="stat-all"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#410C09]">{enquiries.length}</div>
              <div className="text-xs text-gray-600 mt-1">All</div>
            </CardContent>
          </Card>
          {STATUSES.map(status => (
            <Card
              key={status}
              onClick={() => setFilter(status)}
              className={`cursor-pointer transition-all ${filter === status ? 'ring-2 ring-[#410C09]' : ''}`}
              data-testid={`stat-${status}`}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#410C09]">{statusCounts[status]}</div>
                <div className="text-xs text-gray-600 mt-1">{status}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card data-testid="enquiries-list-card">
          <CardHeader>
            <CardTitle>
              {filter === 'all' ? 'All Enquiries' : `${filter} Enquiries`} ({filteredEnquiries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-gray-500">Loading...</p>
            ) : filteredEnquiries.length === 0 ? (
              <p className="text-center py-12 text-gray-500">
                No enquiries yet. Public submissions will appear here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="enquiries-table">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 pr-4 font-semibold">Date</th>
                      <th className="pb-3 pr-4 font-semibold">Organization</th>
                      <th className="pb-3 pr-4 font-semibold">Event</th>
                      <th className="pb-3 pr-4 font-semibold">Event Date</th>
                      <th className="pb-3 pr-4 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map(enq => (
                      <tr
                        key={enq.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                        data-testid={`enquiry-row-${enq.id}`}
                      >
                        <td className="py-3 pr-4 text-gray-600">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 font-semibold">{enq.org_name}</td>
                        <td className="py-3 pr-4">{enq.event_name}</td>
                        <td className="py-3 pr-4 text-gray-600">{enq.event_date}</td>
                        <td className="py-3 pr-4">
                          <Select
                            value={enq.status}
                            onValueChange={(v) => updateStatus(enq.id, v)}
                          >
                            <SelectTrigger className="h-8 w-40" data-testid={`status-${enq.id}`}>
                              <Badge className={STATUS_COLORS[enq.status]}>{enq.status}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelected(enq)}
                            data-testid={`view-${enq.id}`}
                          >
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="enquiry-detail">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-[#410C09]">
                {selected?.event_name}
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_COLORS[selected.status]}>{selected.status}</Badge>
                  <span className="text-sm text-gray-500">
                    Received {new Date(selected.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">Organization</div>
                    <div className="font-semibold">{selected.org_name}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Contact Person</div>
                    <div className="font-semibold">{selected.contact_person}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1 flex items-center gap-1"><Phone size={14} /> Phone</div>
                    <a href={`tel:${selected.phone}`} className="font-semibold text-[#410C09] hover:underline">
                      {selected.phone}
                    </a>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1 flex items-center gap-1"><Mail size={14} /> Email</div>
                    <a href={`mailto:${selected.email}`} className="font-semibold text-[#410C09] hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1 flex items-center gap-1"><Calendar size={14} /> Event Date</div>
                    <div className="font-semibold">{selected.event_date} at {selected.performance_time}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1 flex items-center gap-1"><MapPin size={14} /> Venue</div>
                    <div className="font-semibold">{selected.venue} ({selected.indoor_outdoor || 'N/A'})</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Event Type</div>
                    <div className="font-semibold">{selected.event_type}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Package</div>
                    <div className="font-semibold">{selected.package_selected || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Audience Size</div>
                    <div className="font-semibold">{selected.audience_size || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">Duration</div>
                    <div className="font-semibold">{selected.duration || 'Not specified'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-gray-500 mb-1">Budget</div>
                    <div className="font-semibold">{selected.budget || 'Not specified'}</div>
                  </div>
                  {selected.requirements && (
                    <div className="md:col-span-2">
                      <div className="text-gray-500 mb-1">Additional Requirements</div>
                      <div className="bg-gray-50 p-3 rounded-sm">{selected.requirements}</div>
                    </div>
                  )}
                  {selected.file_path && (
                    <div className="md:col-span-2">
                      <div className="text-gray-500 mb-1">Attached File</div>
                      <a
                        href={`${API}/files/${selected.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#410C09] hover:underline"
                      >
                        <Download size={14} /> View attachment
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center gap-3">
                  <a
                    href={`https://wa.me/6${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selected.contact_person}, this is UTeM 24 Festive Drum Club responding to your enquiry for ${selected.event_name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="reply-whatsapp"
                  >
                    <Button className="btn-primary">
                      <Phone size={16} className="mr-2" />
                      Reply via WhatsApp
                    </Button>
                  </a>
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.event_name}`} data-testid="reply-email">
                    <Button variant="outline">
                      <Mail size={16} className="mr-2" />
                      Reply via Email
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminEnquiries;
