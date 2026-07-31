import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    student_id: '',
    faculty: '',
    year: '',
    experience: '',
    why_join: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/join-us`, formData);
      toast.success(t('Submission successful!', '提交成功！'));
      setFormData({
        name: '',
        email: '',
        phone: '',
        student_id: '',
        faculty: '',
        year: '',
        experience: '',
        why_join: ''
      });
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error(t('Submission failed', '提交失败'));
    }
  };

  const getWhatsAppLink = (number) => {
    return `https://wa.me/6${number}`;
  };

  return (
    <div className="min-h-screen" data-testid="contact-page">
      <section className="relative py-32 bg-[#410C09] text-white" data-testid="contact-hero">
        <div className="absolute inset-0 texture-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Get in Touch', '联系我们')}
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium">
              {t('Contact Us', '联系')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="contact-info">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading text-3xl mb-6 text-[#410C09]">
                {t('Contact Information', '联系信息')}
              </h2>
              {settings && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4" data-testid="contact-address">
                    <MapPin className="text-[#410C09] mt-1" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">{t('Address', '地址')}</h3>
                      <p className="text-gray-700">{t(settings.address_en, settings.address_zh)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4" data-testid="contact-phone-captain">
                    <Phone className="text-[#410C09] mt-1" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">{t('Captain', '队长')} - Kon Yi Khai</h3>
                      <p className="text-gray-700">{settings.whatsapp_captain}</p>
                      <a
                        href={getWhatsAppLink(settings.whatsapp_captain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center btn-primary mt-2 px-4 py-2 text-sm rounded-sm"
                        data-testid="whatsapp-captain"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4" data-testid="contact-phone-vice">
                    <Phone className="text-[#410C09] mt-1" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">{t('Vice Captain', '副队长')} - Ding Jia Jie</h3>
                      <p className="text-gray-700">{settings.whatsapp_vice}</p>
                      <a
                        href={getWhatsAppLink(settings.whatsapp_vice)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center btn-primary mt-2 px-4 py-2 text-sm rounded-sm"
                        data-testid="whatsapp-vice"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {settings.email && settings.email !== '[Email]' && (
                    <div className="flex items-start gap-4" data-testid="contact-email">
                      <Mail className="text-[#410C09] mt-1" size={24} />
                      <div>
                        <h3 className="font-bold mb-1">{t('Email', '电子邮件')}</h3>
                        <p className="text-gray-700">{settings.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4" data-testid="contact-social">
                    <div className="flex gap-4 mt-1">
                      {settings.instagram && (
                        <a
                          href={`https://instagram.com/${settings.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#410C09] hover:text-[#D4AF37] transition-colors"
                          data-testid="contact-instagram"
                        >
                          <Instagram size={28} />
                        </a>
                      )}
                      {settings.facebook && (
                        <a
                          href={`https://facebook.com/${settings.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#410C09] hover:text-[#D4AF37] transition-colors"
                          data-testid="contact-facebook"
                        >
                          <Facebook size={28} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#F5F1E7] p-8 rounded-sm" data-testid="join-us-form">
              <h2 className="font-heading text-3xl mb-6 text-[#410C09]">
                {t('Join Us', '加入我们')}
              </h2>
              <p className="text-gray-700 mb-6">
                {t(
                  'Interested in joining UTeM 24 Festive Drum Club? Register your interest below!',
                  '有兴趣加入 UTeM 二十四节令鼓队吗？在下面注册您的兴趣！'
                )}
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('Full Name', '全名')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('Email', '电子邮件')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t('Phone Number', '电话号码')} *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    data-testid="input-phone"
                  />
                </div>
                <div>
                  <Label htmlFor="student_id">{t('Student ID', '学生证号')} *</Label>
                  <Input
                    id="student_id"
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    required
                    data-testid="input-student-id"
                  />
                </div>
                <div>
                  <Label htmlFor="faculty">{t('Faculty', '学院')} *</Label>
                  <Input
                    id="faculty"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    required
                    data-testid="input-faculty"
                  />
                </div>
                <div>
                  <Label htmlFor="year">{t('Year of Study', '学习年份')} *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    data-testid="input-year"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">{t('Previous Drumming Experience', '以前的鼓经验')}</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={3}
                    data-testid="textarea-experience"
                  />
                </div>
                <div>
                  <Label htmlFor="why_join">{t('Why do you want to join?', '为什么要加入？')}</Label>
                  <Textarea
                    id="why_join"
                    value={formData.why_join}
                    onChange={(e) => setFormData({ ...formData, why_join: e.target.value })}
                    rows={3}
                    data-testid="textarea-why-join"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-join-btn">
                  {t('Submit Application', '提交申请')}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;