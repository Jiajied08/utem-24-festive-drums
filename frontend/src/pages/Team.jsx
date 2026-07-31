import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Team = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    axios.get(`${API}/team`)
      .then((r) => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sessions = [...new Set(members.map((m) => m.session).filter(Boolean))]
    .sort((a, b) => b.localeCompare(a));

  const activeSession = sessions[activeIdx];
  const activeMembers = members.filter((m) => m.session === activeSession);

  const go = (delta) => {
    if (sessions.length < 2) return;
    setDirection(delta);
    setActiveIdx((i) => (i + delta + sessions.length) % sessions.length);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E7]" data-testid="team-page">
      <section className="relative py-24 md:py-32 bg-[#410C09] text-white overflow-hidden" data-testid="team-hero">
        <div className="absolute inset-0 texture-overlay pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
            {t('Council Yearbook', '理事会年鉴')}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tighter font-medium mb-4">
            {t('Council', '理事会')}
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            {t(
              'Flip through the sessions and meet the people who have kept the beat alive.',
              '翻阅历届鼓队，认识让鼓声延续的每一位理事。'
            )}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-center text-gray-600" data-testid="team-loading">
              {t('Loading…', '加载中…')}
            </p>
          ) : sessions.length === 0 ? (
            <p className="text-center text-gray-600" data-testid="team-empty">
              {t('Council members coming soon.', '理事会成员即将公布。')}
            </p>
          ) : (
            <div data-testid="yearbook">
              <div className="flex items-center justify-center gap-4 mb-10 flex-wrap" data-testid="yearbook-nav">
                <button
                  onClick={() => go(-1)}
                  className="w-11 h-11 rounded-full bg-[#410C09] text-white flex items-center justify-center hover:bg-[#5a1712] transition-colors disabled:opacity-30"
                  disabled={sessions.length < 2}
                  aria-label="Previous session"
                  data-testid="yearbook-prev"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex gap-2 flex-wrap justify-center" data-testid="yearbook-tabs">
                  {sessions.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => { setDirection(i > activeIdx ? 1 : -1); setActiveIdx(i); }}
                      className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${
                        i === activeIdx
                          ? 'bg-[#D4AF37] text-[#410C09]'
                          : 'bg-white text-[#410C09] hover:bg-[#D4AF37]/20'
                      }`}
                      data-testid={`yearbook-tab-${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => go(1)}
                  className="w-11 h-11 rounded-full bg-[#410C09] text-white flex items-center justify-center hover:bg-[#5a1712] transition-colors disabled:opacity-30"
                  disabled={sessions.length < 2}
                  aria-label="Next session"
                  data-testid="yearbook-next"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeSession}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40, rotateY: direction * 8 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -direction * 40, rotateY: -direction * 8 }}
                  transition={{ duration: 0.45 }}
                  className="mb-8"
                  data-testid={`yearbook-page-${activeSession}`}
                >
                  <h2 className="font-heading text-2xl md:text-3xl text-[#410C09] mb-2 text-center">
                    {t('Session', '届')} {activeSession}
                  </h2>
                  <p className="text-sm text-gray-500 text-center mb-8">
                    {activeMembers.length} {t('members', '位成员')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeMembers.map((m, idx) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        data-testid={`team-member-${m.id}`}
                      >
                        <div className="aspect-[3/4] bg-[#F5F1E7] flex items-center justify-center overflow-hidden">
                          {m.image_path ? (
                            <img src={`${API}/files/${m.image_path}`} alt={t(m.name_en, m.name_zh)} className="w-full h-full object-cover" />
                          ) : (
                            <User size={64} className="text-gray-300" />
                          )}
                        </div>
                        <div className="p-4 text-center">
                          <h3 className="font-heading text-lg font-bold text-[#410C09]">
                            {t(m.name_en, m.name_zh)}
                          </h3>
                          <p className="text-sm text-[#D4AF37] font-semibold mt-1">
                            {t(m.position_en, m.position_zh)}
                          </p>
                          {(m.bio_en || m.bio_zh) && (
                            <p className="text-xs text-gray-600 mt-2">
                              {t(m.bio_en, m.bio_zh)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Team;
