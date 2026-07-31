import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Team = () => {
  const { t } = useLanguage();
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get(`${API}/team`);
        setTeam(response.data);
      } catch (error) {
        console.error('Failed to fetch team:', error);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen" data-testid="team-page">
      <section className="relative py-32 bg-[#410C09] text-white" data-testid="team-hero">
        <div className="absolute inset-0 texture-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Meet', '认识')}
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium">
              {t('Council', '理事会')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="team-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {team.length === 0 ? (
            <div className="text-center py-20" data-testid="team-empty">
              <p className="text-gray-500 text-lg">
                {t('Council information will be available soon.', '理事会信息即将推出。')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" data-testid="team-grid">
              {team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                  data-testid={`team-member-${index}`}
                >
                  <div className="aspect-square overflow-hidden rounded-sm mb-4 bg-gray-200">
                    {member.image_path ? (
                      <img
                        src={`${API}/files/${member.image_path}`}
                        alt={t(member.name_en, member.name_zh)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">{t(member.name_en, member.name_zh).charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-[#410C09] mb-1">
                    {t(member.name_en, member.name_zh)}
                  </h3>
                  <p className="text-[#D4AF37] font-semibold mb-1">
                    {t(member.position_en, member.position_zh)}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{member.session}</p>
                  {(member.bio_en || member.bio_zh) && (
                    <p className="text-sm text-gray-700">
                      {t(member.bio_en, member.bio_zh)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Team;