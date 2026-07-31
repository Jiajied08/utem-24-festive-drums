import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Instagram } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [clubInfo, setClubInfo] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [videos, setVideos] = useState([]);
  const [posters, setPosters] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, galleryRes, videosRes, postersRes, igRes, settingsRes] = await Promise.all([
          axios.get(`${API}/club-info`),
          axios.get(`${API}/gallery`),
          axios.get(`${API}/videos`),
          axios.get(`${API}/posters?upcoming=true`),
          axios.get(`${API}/instagram-posts`),
          axios.get(`${API}/settings`)
        ]);
        setClubInfo(infoRes.data);
        setGallery(galleryRes.data.slice(0, 6));
        setVideos(videosRes.data);
        setPosters(postersRes.data);
        setInstagramPosts(igRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.hash === '#booking') {
      const timer = setTimeout(() => {
        const el = document.getElementById('booking');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

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
          </motion.div>
        </div>
      </section>

      {posters.length > 0 && (
        <section className="py-20 md:py-24 bg-[#F5F1E7]" data-testid="upcoming-shows-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
                {t('Upcoming Shows', '即将登场')}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight text-[#410C09] mb-4">
                {t('Save the Dates', '锁定日期')}
              </h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                {t(
                  'Catch the drums live — here is where you can find us next.',
                  '来现场感受鼓声 — 以下是接下来的演出安排。'
                )}
              </p>
            </div>

            <div className={`grid gap-6 ${posters.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : posters.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {posters.map((p, i) => {
                let day = '';
                let month = '';
                if (p.event_date) {
                  const [y, m, d] = p.event_date.split('-').map((n) => parseInt(n, 10));
                  const dateObj = new Date(y, (m || 1) - 1, d || 1);
                  day = dateObj.getDate();
                  month = dateObj.toLocaleString(undefined, { month: 'short' }).toUpperCase();
                }
                const hasDate = !!p.event_date;
                const cardBody = (
                  <>
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                      <img
                        src={`${API}/files/${p.storage_path}`}
                        alt={t(p.title_en, p.title_zh) || 'Event poster'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    {hasDate && (
                      <div className="absolute top-3 left-3 bg-[#410C09] text-white rounded-sm px-3 py-2 text-center shadow-lg" data-testid={`poster-date-${i}`}>
                        <div className="text-xs font-semibold text-[#D4AF37] leading-none">{month}</div>
                        <div className="font-heading text-2xl leading-none mt-1">{day}</div>
                      </div>
                    )}
                    <div className="p-4">
                      {t(p.title_en, p.title_zh) && (
                        <h3 className="font-heading text-xl font-bold text-[#410C09] mb-1">
                          {t(p.title_en, p.title_zh)}
                        </h3>
                      )}
                      {p.location && (
                        <p className="text-sm text-gray-600">{p.location}</p>
                      )}
                    </div>
                  </>
                );
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="group relative bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
                    data-testid={`upcoming-poster-${i}`}
                  >
                    {p.event_link ? (
                      <a href={p.event_link} target="_blank" rel="noopener noreferrer" className="block" data-testid={`poster-link-${i}`}>
                        {cardBody}
                      </a>
                    ) : (
                      cardBody
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {(gallery.length > 0 || videos.length > 0) && (
        <section className="py-20 md:py-24 bg-[#0A0A0A]" data-testid="previous-performances-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
                {t('Previous Performances', '过往演出')}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white mb-4">
                {t('Moments Worth Reliving', '值得回味的瞬间')}
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {t(
                  `A look back at the shows, competitions and stages we've shared.`,
                  '回顾我们一同经历的演出、比赛与舞台。'
                )}
              </p>
            </div>

            {videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10" data-testid="performance-videos">
                {videos.slice(0, 4).map((v, index) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="rounded-sm overflow-hidden bg-black"
                    data-testid={`performance-video-${index}`}
                  >
                    <div className="aspect-video">
                      <iframe
                        src={v.embed_url}
                        title={v.title_en || 'Performance video'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {(v.title_en || v.title_zh) && (
                      <div className="p-3 text-white">
                        <p className="font-semibold">{t(v.title_en, v.title_zh) || v.title_en}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {gallery.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="performance-photos">
                {gallery.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
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
            )}
          </div>
        </section>
      )}

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

      <section id="booking" className="py-24 md:py-32 bg-[#410C09] text-white relative overflow-hidden" data-testid="booking-section">
        <div className="absolute inset-0 texture-overlay pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Performance Booking', '演出预订')}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight text-white mb-4">
              {t('Now Open for Performance Bookings', '诚接各类演出邀约')}
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
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
                className="bg-white/5 backdrop-blur-sm p-8 rounded-sm border border-white/10 hover:border-[#D4AF37] transition-colors"
                data-testid={`booking-tier-${idx}`}
              >
                <div className="text-4xl mb-4">{pkg.icon}</div>
                <h3 className="font-heading text-2xl font-bold text-[#D4AF37] mb-2">
                  {t(pkg.title_en, pkg.title_zh)}
                </h3>
                <p className="text-gray-200">{t(pkg.desc_en, pkg.desc_zh)}</p>
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
            <p className="text-sm text-gray-300 mt-4">
              {t(
                'Final quotation depends on location, duration, performers, transport, equipment and event schedule.',
                '最终报价视地点、时长、人数、交通、设备及活动时间表而定。'
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;