import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RECRUITMENT_POSTER = 'utem-drum-club/recruitment/3e170033-025d-4401-93b1-e35fd6a98d91.jpg';

const JoinUs = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', student_id: '',
    faculty: '', year: '', experience: '', why_join: ''
  });

  useEffect(() => {
    axios.get(`${API}/settings`).then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/join-us`, formData);
      toast.success(t('Application submitted! We will contact you soon.', '申请已提交！我们会尽快联系您。'));
      setFormData({ name: '', email: '', phone: '', student_id: '', faculty: '', year: '', experience: '', why_join: '' });
    } catch (error) {
      toast.error(t('Submission failed', '提交失败'));
    }
  };

  const openWhatsApp = (num) => `https://wa.me/6${num}?text=${encodeURIComponent(t('Hi! I am interested in joining UTeM 24 Festive Drum Club.', '你好！我有兴趣加入 UTeM 二十四节令鼓队。'))}`;

  return (
    <div className="min-h-screen" data-testid="joinus-page">
      <section className="relative py-16 md:py-24 bg-[#0A0A0A] text-white overflow-hidden" data-testid="joinus-hero">
        <div className="absolute inset-0 texture-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
                {t('Recruitment Now Open', '招新正式开始')}
              </p>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium mb-4">
                {t('Feel the Rhythm. Join the Team.', '感受节奏，加入我们')}
              </h1>
              <p className="text-lg md:text-xl text-gray-200">
                {t(
                  'The beat has begun… and we are waiting for YOU',
                  '鼓声已响，只差一个你'
                )}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center md:justify-end"
            >
              <img
                src={`${API}/files/${RECRUITMENT_POSTER}`}
                alt="UTeM 24 Festive Drums Recruitment 招新"
                className="max-w-full md:max-w-md w-auto h-auto object-contain rounded-sm shadow-2xl"
                data-testid="recruitment-poster"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F5F1E7]" data-testid="marketing-copy">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="space-y-6 text-gray-800 leading-relaxed">
              <p className="text-lg font-semibold text-[#410C09]">
                {t(
                  'Do you want to challenge yourself and experience the magic of the stage?',
                  '你是否想挑战自己，体验舞台演出的魅力？'
                )}
              </p>
              <p>
                {t(
                  'Do you want to meet like-minded friends and create unforgettable university memories together?',
                  '你是否想结识一群志同道合的伙伴，一起创造难忘的大学回忆？'
                )}
              </p>
              <div className="grid gap-3 py-4 border-l-4 border-[#D4AF37] pl-6 italic">
                <p>{t('Every swing of the drumstick is a breakthrough.', '每一次挥棒，都是一次突破。')}</p>
                <p>{t('Every drum beat is a release.', '每一次击鼓，都是一次释放。')}</p>
                <p>{t('Every performance becomes an unforgettable memory of youth.', '每一次演出，都将成为青春最热血的回忆。')}</p>
              </div>
              <p className="text-lg font-semibold text-[#410C09]">
                {t(
                  'No experience needed. Just bring your passion, and we welcome you!',
                  '无论你有没有基础，只要你愿意学习，勇于挑战，我们都欢迎你的加入！'
                )}
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-sm">
                  <span className="text-2xl">🌱</span>
                  <p className="font-semibold text-[#410C09] mt-2">{t('Start from Zero', '从零开始')}</p>
                  <p className="text-sm text-gray-600">{t('Learn and grow step by step', '逐步成长')}</p>
                </div>
                <div className="bg-white p-4 rounded-sm">
                  <span className="text-2xl">🥁</span>
                  <p className="font-semibold text-[#410C09] mt-2">{t('No Experience Required', '无需经验')}</p>
                  <p className="text-sm text-gray-600">{t('Just bring your passion', '只需带着热情加入')}</p>
                </div>
                <div className="bg-white p-4 rounded-sm">
                  <span className="text-2xl">🎭</span>
                  <p className="font-semibold text-[#410C09] mt-2">{t('Perform on Stage', '登台演出')}</p>
                  <p className="text-sm text-gray-600">{t('Campus and external events', '参与校内外演出与活动')}</p>
                </div>
                <div className="bg-white p-4 rounded-sm">
                  <span className="text-2xl">🤝</span>
                  <p className="font-semibold text-[#410C09] mt-2">{t('Lifelong Friendships', '珍贵友谊')}</p>
                  <p className="text-sm text-gray-600">{t('Growth and precious memories', '收获友谊、成长与回忆')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="contact-and-form">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl mb-8 text-[#410C09] text-center">
              {t('For More Information', '更多资讯')}
            </h2>
              {settings && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4" data-testid="contact-phone-captain">
                    <Phone className="text-[#410C09] mt-1" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">{t('Captain', '队长')} · 官榕凯 Khai</h3>
                      <p className="text-gray-700">{settings.whatsapp_captain}</p>
                      <a
                        href={openWhatsApp(settings.whatsapp_captain)}
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
                      <h3 className="font-bold mb-1">{t('Vice Captain', '副队长')} · 陈家杰 Jia Jie</h3>
                      <p className="text-gray-700">{settings.whatsapp_vice}</p>
                      <a
                        href={openWhatsApp(settings.whatsapp_vice)}
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
                        <a href={`mailto:${settings.email}`} className="text-gray-700 hover:text-[#410C09] hover:underline">
                          {settings.email}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4" data-testid="contact-address">
                    <MapPin className="text-[#410C09] mt-1" size={24} />
                    <div>
                      <h3 className="font-bold mb-1">{t('Address', '地址')}</h3>
                      <p className="text-gray-700">{t(settings.address_en, settings.address_zh)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    {settings.instagram && (
                      <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer" className="text-[#410C09] hover:text-[#D4AF37]" data-testid="contact-instagram">
                        <Instagram size={28} />
                      </a>
                    )}
                    {settings.facebook && (
                      <a href={`https://www.facebook.com/${settings.facebook}`} target="_blank" rel="noopener noreferrer" className="text-[#410C09] hover:text-[#D4AF37]" data-testid="contact-facebook">
                        <Facebook size={28} />
                      </a>
                    )}
                    {settings.youtube && (
                      <a href={`https://www.youtube.com/channel/${settings.youtube}`} target="_blank" rel="noopener noreferrer" className="text-[#410C09] hover:text-[#D4AF37]" data-testid="contact-youtube">
                        <Youtube size={28} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default JoinUs;
