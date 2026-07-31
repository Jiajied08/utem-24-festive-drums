import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Team = () => {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/team`)
      .then((r) => setMembers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sessions = [...new Set(members.map((m) => m.session))].sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-[#F5F1E7]" data-testid="team-page">
      <section className="relative py-24 md:py-32 bg-[#410C09] text-white overflow-hidden" data-testid="team-hero">
        <div className="absolute inset-0 texture-overlay pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
            {t('Meet the Team', '认识团队')}
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-tighter font-medium mb-4">
            {t('Council', '理事会')}
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            {t(
              'The committee members driving UTeM 24FD forward, session by session.',
              '一届又一届带领 UTeM 廿四节令鼓队前进的理事会成员。'
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
          ) : members.length === 0 ? (
            <p className="text-center text-gray-600" data-testid="team-empty">
              {t('Council members coming soon.', '理事会成员即将公布。')}
            </p>
          ) : (
            sessions.map((sessionKey) => (
              <div key={sessionKey} className="mb-16 last:mb-0" data-testid={`team-session-${sessionKey}`}>
                <h2 className="font-heading text-2xl md:text-3xl text-[#410C09] mb-8 text-center">
                  {t('Session', '届')} {sessionKey}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {members
                    .filter((m) => m.session === sessionKey)
                    .map((m, idx) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                        className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        data-testid={`team-member-${m.id}`}
                      >
                        <div className="aspect-[3/4] bg-[#F5F1E7] flex items-center justify-center overflow-hidden">
                          {m.image_path ? (
                            <img
                              src={`${API}/files/${m.image_path}`}
                              alt={t(m.name_en, m.name_zh)}
                              className="w-full h-full object-cover"
                            />
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
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Team;
