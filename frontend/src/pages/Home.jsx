import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  const [clubInfo, setClubInfo] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, galleryRes, igRes, settingsRes] = await Promise.all([
          axios.get(`${API}/club-info`),
          axios.get(`${API}/gallery`),
          axios.get(`${API}/instagram-posts`),
          axios.get(`${API}/settings`)
        ]);
        setClubInfo(infoRes.data);
        setGallery(galleryRes.data.slice(0, 6));
        setInstagramPosts(igRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const currentYear = new Date().getFullYear();
  const yearsOfExperience = clubInfo ? currentYear - clubInfo.established_year : 0;

  return (
    <div className="min-h-screen" data-testid="home-page">
      <section className="relative py-24 md:py-32 flex items-center justify-center overflow-hidden bg-[#410C09]" data-testid="hero-section">
        <HeroCarousel />
        <div className="absolute inset-0 texture-overlay" />

        <div className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4" data-testid="hero-overline">
              {t('Est. 2011', '建立于 2011')}
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium mb-4" data-testid="hero-title-en">
              UTeM 24 Festive Drum Club
            </h1>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6" data-testid="hero-title-zh">
              {t('UTeM 二十四节令鼓队', '技大二十四节令鼓队')}
            </h2>
            <p className="text-lg md:text-xl leading-relaxed mb-8 text-gray-200 max-w-3xl mx-auto" data-testid="hero-tagline">
              {t(
                'Twenty-four solar terms, carried forward through the beat of drums. More than a performance — a continuation of culture.',
                '廿四节气，化为鼓声传承。🥁 不只是表演，是文化的延续。'
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={settings?.whatsapp_captain ? `https://wa.me/6${settings.whatsapp_captain}?text=${encodeURIComponent(t('Hello! I would like to enquire about booking a performance for my event.', '您好！我想询问有关为我的活动预订演出的事宜。'))}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-cta-invite"
              >
                <Button
                  size="lg"
                  className="btn-primary px-8 py-6 text-lg rounded-sm"
                >
                  {t('Now Open for Performance Bookings', '诚接各类演出邀约')}
                </Button>
              </a>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="btn-secondary px-8 py-6 text-lg rounded-sm"
                  data-testid="hero-cta-discover"
                >
                  {t('Discover Our Story', '发现我们的故事')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 bg-white" data-testid="intro-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('UTeM 24FD', '技大24节令鼓')}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6 text-[#0A0A0A]">
              {t(
                'Established in 2011 at UTeM',
                '创立于2011年于UTeM'
              )}
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 mb-8">
              {clubInfo && t(clubInfo.about_en || 'The UTeM 24 Festive Drum Club brings together traditional 24 Festive Drums culture, teamwork, discipline and youthful energy. We are dedicated to preserving this unique art form while developing leadership and friendship among our members.', clubInfo.about_zh || 'UTeM 24节令鼓俱乐部将传统的 24 节令鼓文化、团队合作、纪律和青春活力结合在一起。我们致力于保护这种独特的艺术形式，同时培养成员之间的领导力和友谊。')}
            </p>
            <Link to="/about">
              <Button className="btn-primary px-6 py-3" data-testid="intro-learn-more">
                {t('Learn More', '了解更多')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="py-20 bg-[#0A0A0A]" data-testid="gallery-preview">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl text-white mb-4">
                {t('Our Performances', '我们的演出')}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="overflow-hidden rounded-sm aspect-square"
                  data-testid={`gallery-preview-item-${index}`}
                >
                  <img
                    src={`${API}/files/${item.storage_path}`}
                    alt={t(item.title_en, item.title_zh)}
                    className="w-full h-full object-cover gallery-item"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="booking" className="py-24 md:py-32 bg-white" data-testid="booking-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Performance Booking', '演出预订')}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight text-[#410C09] mb-4">
              {t('Now Open for Performance Bookings', '诚接各类演出邀约')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t(
                'From opening ceremonies to major festivals — book UTeM 24FD to bring authentic 24 Festive Drums energy to your event.',
                '从开幕仪式到大型节庆 — 邀请 UTeM 廿四节令鼓队为您的活动带来正宗的鼓声魅力。'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { title_en: 'Opening Performance', title_zh: '开场表演', desc_en: 'Openings, launches, short ceremonies', desc_zh: '开幕式、启动仪式、短期庆典', icon: '🎬' },
              { title_en: 'Standard Performance', title_zh: '标准表演', desc_en: 'University, community, corporate events', desc_zh: '大学、社区、企业活动', icon: '🥁' },
              { title_en: 'Premium Performance', title_zh: '高级表演', desc_en: 'Major celebrations, festivals, large-scale events', desc_zh: '重大庆祝活动、节日、大型活动', icon: '🎭' }
            ].map((pkg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#F5F1E7] p-8 rounded-sm border border-transparent hover:border-[#D4AF37] transition-colors"
                data-testid={`booking-tier-${idx}`}
              >
                <div className="text-4xl mb-4">{pkg.icon}</div>
                <h3 className="font-heading text-2xl font-bold text-[#410C09] mb-2">
                  {t(pkg.title_en, pkg.title_zh)}
                </h3>
                <p className="text-gray-700">{t(pkg.desc_en, pkg.desc_zh)}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <a
              href={settings?.whatsapp_captain ? `https://wa.me/6${settings.whatsapp_captain}?text=${encodeURIComponent(t('Hello! I would like to enquire about booking a performance for my event.', '您好！我想咨询有关为我的活动预订演出的事宜。'))}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="booking-cta-btn"
            >
              <Button size="lg" className="btn-primary px-8 py-6 text-lg">
                {t('WhatsApp Us to Book', 'WhatsApp 联系预订')}
              </Button>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              {t(
                'Final quotation depends on location, duration, performers, transport, equipment and event schedule.',
                '最终报价视地点、时长、人数、交通、设备及活动时间表而定。'
              )}
            </p>
          </div>
        </div>
      </section>

      {instagramPosts.length > 0 && (
        <section className="py-20 bg-[#F5F1E7]" data-testid="instagram-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
                {t('Follow the Beat', '关注鼓声')}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl text-[#410C09] mb-4">
                {t('Latest from Instagram', 'Instagram 最新动态')}
              </h2>
              {settings?.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#410C09] hover:text-[#D4AF37] transition-colors"
                  data-testid="instagram-profile-link"
                >
                  <Instagram size={20} />
                  <span className="font-semibold">@{settings.instagram}</span>
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instagramPosts.slice(0, 6).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`instagram-post-${index}`}
                >
                  <iframe
                    src={`https://www.instagram.com/p/${post.shortcode}/embed/`}
                    className="w-full"
                    style={{ height: '500px', border: 0 }}
                    loading="lazy"
                    scrolling="no"
                    allowFullScreen={false}
                    title={`Instagram post ${post.shortcode}`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-32 bg-[#410C09] text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl mb-6">
              {t('Now Open for Performance Bookings', '诚接各类演出邀约')}
            </h2>
            <p className="text-lg mb-8 text-gray-200">
              {t(
                'Contact us today to discuss your event requirements and receive a custom quotation.',
                '立即联系我们，讨论您的活动需求并获取定制报价。'
              )}
            </p>
            <a
              href={settings?.whatsapp_captain ? `https://wa.me/6${settings.whatsapp_captain}?text=${encodeURIComponent(t('Hello! I would like to enquire about performance pricing.', '您好！我想咨询演出价格。'))}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-packages"
            >
              <Button size="lg" className="btn-primary px-8 py-6 text-lg">
                {t('WhatsApp Us for Pricing', 'Whatsapp我们了解价格')}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;