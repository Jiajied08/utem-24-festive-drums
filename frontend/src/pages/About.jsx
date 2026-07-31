import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const defaultAboutEn = 'The UTeM 24 Festive Drum Club brings together traditional 24 Festive Drums culture, teamwork, discipline and youthful energy. We are dedicated to preserving this unique art form while developing leadership and friendship among our members.';
const defaultAboutZh = 'UTeM 二十四节令鼓队将传统的廿四节令鼓文化、团队合作、纪律和青春活力融合在一起。我们致力于保护这门独特的艺术，同时培养成员之间的领导力与友谊。';

const About = () => {
  const { t } = useLanguage();
  const [clubInfo, setClubInfo] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/club-info`),
      axios.get(`${API}/history`),
    ]).then(([infoRes, histRes]) => {
      setClubInfo(infoRes.data);
      setEvents(histRes.data);
    }).catch(() => {});
  }, []);

  const currentYear = new Date().getFullYear();

  const defaultEvents = [
    { year: 2011, title_en: 'Establishment of UTeM 24 Festive Drum Club', title_zh: 'UTeM 二十四节令鼓队成立' },
    { year: 2025, title_en: 'Hosted 1st National University 24 Festive Drums Competition', title_zh: '举办第一届全国大学廿四节令鼓比赛' },
    { year: 2026, title_en: 'Hosted 2nd National Inter-University 24 Festive Drums Competition', title_zh: '举办第二届全国大学间廿四节令鼓比赛' },
    { year: currentYear, title_en: 'Present — Continuing the Rhythm', title_zh: '现在 — 继续节奏' },
  ];
  const previewEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="min-h-screen bg-white" data-testid="about-page">
      <section className="relative py-28 md:py-40 bg-[#410C09] text-white overflow-hidden" data-testid="about-hero">
        <div className="absolute inset-0 texture-overlay pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('About Us', '关于我们')}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tighter font-medium mb-6">
              {t('Beats of Tradition, Voices of Youth', '传统之声，青春回响')}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              {clubInfo && t(clubInfo.about_en || defaultAboutEn, clubInfo.about_zh || defaultAboutZh)}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-[#F5F1E7]" data-testid="about-stats-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 gap-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} data-testid="about-stat-year">
            <div className="font-heading text-4xl md:text-5xl font-bold text-[#410C09]">{clubInfo?.established_year || 2011}</div>
            <p className="text-sm md:text-base text-gray-700 mt-2">{t('Established', '创立于')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} data-testid="about-stat-performances">
            <div className="font-heading text-4xl md:text-5xl font-bold text-[#410C09]">{clubInfo?.performances_count || 50}+</div>
            <p className="text-sm md:text-base text-gray-700 mt-2">{t('Performances', '场演出')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white" data-testid="about-history-section">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Our Journey', '我们的旅程')}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight text-[#410C09] mb-6">
              {t('A Story Written in Every Beat', '每一鼓，皆是故事')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t(
                `From a small group of passionate students in 2011 to a respected university drum team today — the UTeM 24 Festive Drum Club has grown one performance, one competition, one drummer at a time.`,
                '2011 年，我们从一群热爱鼓艺的学生起步；今天，我们已成为一支备受认可的大学廿四节令鼓队。每一场演出、每一届比赛、每一位鼓手，都在书写属于我们的故事。'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previewEvents.map((ev, i) => (
              <motion.div
                key={ev.id || `${ev.year}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[#F5F1E7] p-6 rounded-sm border-l-4 border-[#D4AF37]"
                data-testid={`about-history-item-${i}`}
              >
                <div className="font-heading text-3xl font-bold text-[#410C09] mb-2">{ev.year}</div>
                <h3 className="font-semibold text-lg text-[#0A0A0A] mb-1">{t(ev.title_en, ev.title_zh)}</h3>
                {(ev.description_en || ev.description_zh) && (
                  <p className="text-sm text-gray-600">{t(ev.description_en || '', ev.description_zh || '')}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-[#410C09] text-white" data-testid="about-mission-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
            {t('Our Mission', '我们的使命')}
          </p>
          <p className="font-heading text-2xl md:text-3xl lg:text-4xl leading-snug">
            {clubInfo && t(
              clubInfo.mission_en || 'To preserve and promote the art of 24 Festive Drums while developing discipline, leadership and teamwork among UTeM students.',
              clubInfo.mission_zh || '保护并推广廿四节令鼓艺术，同时培养 UTeM 学生的纪律、领导力与团队精神。'
            )}
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
