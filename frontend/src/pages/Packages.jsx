import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { MessageCircle, Upload } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Packages = () => {
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    org_name: '',
    contact_person: '',
    phone: '',
    email: '',
    event_name: '',
    event_type: '',
    event_date: '',
    performance_time: '',
    venue: '',
    package_selected: '',
    audience_size: '',
    indoor_outdoor: '',
    duration: '',
    requirements: '',
    budget: ''
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pkgRes, settingsRes] = await Promise.all([
        axios.get(`${API}/packages`),
        axios.get(`${API}/settings`)
      ]);
      setPackages(pkgRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let filePath = null;
      if (file) {
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        const uploadRes = await axios.post(`${API}/enquiries/upload`, fileFormData);
        filePath = uploadRes.data.path;
      }

      await axios.post(`${API}/enquiries`, {
        ...formData,
        file_path: filePath
      });

      toast.success(t('Enquiry submitted successfully!', '查询提交成功！'));
      setFormData({
        org_name: '',
        contact_person: '',
        phone: '',
        email: '',
        event_name: '',
        event_type: '',
        event_date: '',
        performance_time: '',
        venue: '',
        package_selected: '',
        audience_size: '',
        indoor_outdoor: '',
        duration: '',
        requirements: '',
        budget: ''
      });
      setFile(null);
    } catch (error) {
      console.error('Failed to submit enquiry:', error);
      toast.error(t('Failed to submit enquiry', '提交查询失败'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (number) => {
    const message = t(
      `Hello! I would like to enquire about booking a performance for my event.`,
      `您好！我想询问有关为我的活动预订演出的事宜。`
    );
    return `https://wa.me/6${number}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen" data-testid="packages-page">
      <section className="relative py-32 bg-[#410C09] text-white" data-testid="packages-hero">
        <div className="absolute inset-0 texture-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Booking', '预订')}
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium">
              {t('Invite Us to Perform', '邀请我们演出')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-[#F5F1E7]" data-testid="packages-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl mb-4 text-[#410C09]">
              {t('Performance Packages', '演出套餐')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-sm p-8 ${index === 1 ? 'border-2 border-[#410C09] transform md:scale-105' : 'border border-gray-200'}`}
                data-testid={`package-${index}`}
              >
                <h3 className="font-heading text-2xl font-bold mb-4 text-[#410C09]">
                  {t(pkg.name_en, pkg.name_zh)}
                </h3>
                <p className="text-gray-700 mb-6">{t(pkg.description_en, pkg.description_zh)}</p>
                <div className="space-y-2 mb-6 text-sm">
                  <p><strong>{t('Duration', '时长')}:</strong> {pkg.duration}</p>
                  <p><strong>{t('Performers', '表演者')}:</strong> {pkg.performers}</p>
                  <p className="text-2xl font-bold text-[#410C09] mt-4">
                    {t('From', '从')} {pkg.price_from}
                  </p>
                </div>
                <Button
                  className="w-full btn-primary"
                  onClick={() => setFormData({ ...formData, package_selected: t(pkg.name_en, pkg.name_zh) })}
                  data-testid={`select-package-${index}`}
                >
                  {t('Request Quotation', '请求报价')}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-sm p-8 text-center mb-8" data-testid="pricing-note">
            <p className="text-gray-700 text-sm">
              {t(
                'Prices shown are estimates only. The final quotation may vary depending on the location, performance duration, number of performers, transportation, equipment, rehearsal requirements and event schedule.',
                '所示价格仅为估算。最终报价可能因地点、演出时长、表演者人数、交通、设备、排练要求和活动时间表而异。'
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="enquiry-form-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl mb-4 text-[#410C09]">
              {t('Performance Invitation Form', '演出邀请表')}
            </h2>
            <p className="text-gray-600">
              {t('Fill out the form below or contact us directly via WhatsApp', '填写下表或通过 WhatsApp 直接联系我们')}
            </p>
          </div>

          {settings && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href={getWhatsAppLink(settings.whatsapp_captain)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 btn-primary px-4 py-2 text-sm rounded-sm"
                data-testid="whatsapp-captain-btn"
              >
                <MessageCircle size={20} />
                {t('WhatsApp Captain', 'WhatsApp 队长')} ({settings.whatsapp_captain})
              </a>
              <a
                href={getWhatsAppLink(settings.whatsapp_vice)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 btn-secondary px-4 py-2 text-sm rounded-sm"
                data-testid="whatsapp-vice-btn"
              >
                <MessageCircle size={20} />
                {t('WhatsApp Vice Captain', 'WhatsApp 副队长')} ({settings.whatsapp_vice})
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="enquiry-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="org_name">{t('Organization / Company Name', '组织/公司名称')} *</Label>
                <Input
                  id="org_name"
                  name="org_name"
                  value={formData.org_name}
                  onChange={handleInputChange}
                  required
                  data-testid="input-org-name"
                />
              </div>
              <div>
                <Label htmlFor="contact_person">{t('Contact Person', '联系人')} *</Label>
                <Input
                  id="contact_person"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  required
                  data-testid="input-contact-person"
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('Phone Number', '电话号码')} *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  data-testid="input-phone"
                />
              </div>
              <div>
                <Label htmlFor="email">{t('Email Address', '电子邮件地址')} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="event_name">{t('Event Name', '活动名称')} *</Label>
                <Input
                  id="event_name"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  required
                  data-testid="input-event-name"
                />
              </div>
              <div>
                <Label htmlFor="event_type">{t('Event Type', '活动类型')} *</Label>
                <Input
                  id="event_type"
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleInputChange}
                  required
                  data-testid="input-event-type"
                />
              </div>
              <div>
                <Label htmlFor="event_date">{t('Event Date', '活动日期')} *</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                  required
                  data-testid="input-event-date"
                />
              </div>
              <div>
                <Label htmlFor="performance_time">{t('Performance Time', '演出时间')} *</Label>
                <Input
                  id="performance_time"
                  name="performance_time"
                  type="time"
                  value={formData.performance_time}
                  onChange={handleInputChange}
                  required
                  data-testid="input-performance-time"
                />
              </div>
              <div>
                <Label htmlFor="venue">{t('Venue / Location', '场地/位置')} *</Label>
                <Input
                  id="venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  data-testid="input-venue"
                />
              </div>
              <div>
                <Label htmlFor="package_selected">{t('Selected Package', '选定的套餐')}</Label>
                <Select
                  value={formData.package_selected}
                  onValueChange={(value) => setFormData({ ...formData, package_selected: value })}
                >
                  <SelectTrigger data-testid="select-package-trigger">
                    <SelectValue placeholder={t('Select a package', '选择套餐')} />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={t(pkg.name_en, pkg.name_zh)}>
                        {t(pkg.name_en, pkg.name_zh)}
                      </SelectItem>
                    ))}
                    <SelectItem value="Custom">{t('Custom Performance', '定制演出')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="audience_size">{t('Expected Audience Size', '预期观众人数')}</Label>
                <Input
                  id="audience_size"
                  name="audience_size"
                  value={formData.audience_size}
                  onChange={handleInputChange}
                  data-testid="input-audience-size"
                />
              </div>
              <div>
                <Label htmlFor="indoor_outdoor">{t('Indoor or Outdoor Venue', '室内或室外场地')}</Label>
                <Select
                  value={formData.indoor_outdoor}
                  onValueChange={(value) => setFormData({ ...formData, indoor_outdoor: value })}
                >
                  <SelectTrigger data-testid="select-indoor-outdoor">
                    <SelectValue placeholder={t('Select', '选择')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">{t('Indoor', '室内')}</SelectItem>
                    <SelectItem value="Outdoor">{t('Outdoor', '室外')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">{t('Performance Duration', '演出时长')}</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder={t('e.g., 30 minutes', '例如：30分钟')}
                  data-testid="input-duration"
                />
              </div>
              <div>
                <Label htmlFor="budget">{t('Estimated Budget', '预估预算')}</Label>
                <Input
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="RM"
                  data-testid="input-budget"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="requirements">{t('Additional Requirements', '附加要求')}</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={4}
                data-testid="textarea-requirements"
              />
            </div>

            <div>
              <Label htmlFor="file">{t('Attach Event Proposal or Invitation Letter', '附上活动提案或邀请函')}</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="cursor-pointer"
                  data-testid="input-file"
                />
                <Upload size={20} className="text-gray-400" />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full btn-primary"
              disabled={isSubmitting}
              data-testid="submit-enquiry-btn"
            >
              {isSubmitting ? t('Submitting...', '提交中...') : t('Submit Enquiry', '提交查询')}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Packages;