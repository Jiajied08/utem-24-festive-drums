import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const About = () => {
  const { t } = useLanguage();
  const [clubInfo, setClubInfo] = useState(null);

  useEffect(() => {
    const fetchClubInfo = async () => {
      try {
        const response = await axios.get(`${API}/club-info`);
        setClubInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch club info:', error);
      }
    };
    fetchClubInfo();
  }, []);

  return (
    <div className="min-h-screen" data-testid="about-page">
      <section className="relative py-32 bg-[#410C09] text-white" data-testid="about-hero">
        <div className="absolute inset-0 texture-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('About Us', '关于我们')}
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium mb-6">
              {t('Our Story', '我们的故事')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="about-content">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl mb-6 text-[#410C09]">
              {t('UTeM 24 Festive Drum Club', 'UTeM 二十四节令鼓队')}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
                {clubInfo && t(
                  clubInfo.about_en || 'The UTeM 24 Festive Drum Club was established in 2011 as a student organization dedicated to preserving and promoting the traditional art of 24 Festive Drums. We bring together students from diverse backgrounds who share a passion for this unique cultural performance art.',
                  clubInfo.about_zh || 'UTeM 二十四节令鼓队成立于 2011 年，是一个致力于保护和推广 24 节令鼓传统艺术的学生组织。我们聚集了来自不同背景的学生，他们对这种独特的文化表演艺术拥有共同的热情。'
                )}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h3 className="font-heading text-2xl md:text-3xl mb-4 text-[#410C09]">
              {t('What are 24 Festive Drums?', '什么是二十四节令鼓？')}
            </h3>
            <p className="text-lg leading-relaxed text-gray-700 mb-4">
              {t(
                '24 Festive Drums is a modern performing art that combines traditional Chinese drumming with contemporary choreography. The "24" represents the 24 solar terms in the Chinese calendar, symbolizing the harmony between human activity and natural rhythms. Each performance tells a story of culture, unity, and energy.',
                '二十四节令鼓是一种现代表演艺术，将传统的中国鼓乐与现代编舞相结合。“24”代表中国历法中的 24 个节气，象征着人类活动与自然节律之间的和谐。每一场表演都讲述了文化、团结和能量的故事。'
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="font-heading text-2xl md:text-3xl mb-6 text-[#410C09]">
              {t('Our Mission', '我们的使命')}
            </h3>
            <div className="bg-[#F5F1E7] p-8 rounded-sm">
              <p className="text-lg leading-relaxed text-gray-800">
                {clubInfo && t(clubInfo.mission_en, clubInfo.mission_zh)}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <h3 className="font-heading text-2xl md:text-3xl mb-6 text-[#410C09]">
              {t('Our Values', '我们的价值观')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="value-culture">
                <h4 className="font-bold text-xl mb-3 text-[#410C09]">{t('Culture', '文化')}</h4>
                <p className="text-gray-700">
                  {t(
                    'Preserving and promoting traditional Chinese drum culture for future generations.',
                    '为后代保护和推广传统的中国鼓文化。'
                  )}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="value-discipline">
                <h4 className="font-bold text-xl mb-3 text-[#410C09]">{t('Discipline', '纪律')}</h4>
                <p className="text-gray-700">
                  {t(
                    'Developing self-discipline, commitment, and dedication through rigorous training.',
                    '通过严格的训练培养自律、承诺和奉献精神。'
                  )}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="value-teamwork">
                <h4 className="font-bold text-xl mb-3 text-[#410C09]">{t('Teamwork', '团队合作')}</h4>
                <p className="text-gray-700">
                  {t(
                    'Building strong bonds through synchronized performances and collective achievement.',
                    '通过同步表演和集体成就建立牢固的纽带。'
                  )}
                </p>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-sm" data-testid="value-leadership">
                <h4 className="font-bold text-xl mb-3 text-[#410C09]">{t('Leadership', '领导力')}</h4>
                <p className="text-gray-700">
                  {t(
                    'Empowering members to take initiative, lead by example, and inspire others.',
                    '赋予成员主动权、以身作则并激励他人。'
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;