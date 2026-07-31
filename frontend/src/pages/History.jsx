import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const History = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API}/history`);
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };
    fetchHistory();
  }, []);

  const defaultEvents = [
    { year: 2011, title_en: 'Establishment of UTeM 24 Festive Drum Club', title_zh: 'UTeM 二十四节令鼓队成立', description_en: 'The club was officially founded by passionate students.', description_zh: '该俱乐部由热情的学生正式成立。' },
    { year: 2025, title_en: 'Hosting 1st National University 24 Festive Drums Competition', title_zh: '举办第一届全国大学24节令鼓比赛', description_en: '', description_zh: '' },
    { year: 2026, title_en: 'Hosting 2nd National Inter-University 24 Festive Drums Competition', title_zh: '举办第二届全国大学间24节令鼓比赛', description_en: '', description_zh: '' },
    { year: new Date().getFullYear(), title_en: 'Present - Continuing the Rhythm', title_zh: '现在 - 继续节奏', description_en: 'Developing a new generation of drummers and keeping the tradition alive.', description_zh: '培养新一代鼓手，让传统保持活力。' }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className="min-h-screen" data-testid="history-page">
      <section className="relative py-32 bg-[#410C09] text-white" data-testid="history-hero">
        <div className="absolute inset-0 texture-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Our Journey', '我们的旅程')}
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium">
              {t('History', '历史')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="timeline-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#D4AF37]" />
            
            {displayEvents.map((event, index) => (
              <motion.div
                key={event.id || index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative mb-16 ${index % 2 === 0 ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:ml-auto md:text-left'}`}
                data-testid={`timeline-event-${index}`}
              >
                <div className="md:w-1/2">
                  <div className="bg-[#F5F1E7] p-6 rounded-sm relative">
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#D4AF37] rounded-full border-4 border-white" />
                    <div className="font-heading text-3xl font-bold text-[#410C09] mb-2">{event.year}</div>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-1">
                      {t('Held', '举办')}
                    </p>
                    <h3 className="font-bold text-xl mb-2 text-[#0A0A0A]">
                      {t(event.title_en, event.title_zh)}
                    </h3>
                    {event.image_path && (
                      <div className="my-4 overflow-hidden rounded-sm">
                        <img
                          src={`${API}/files/${event.image_path}`}
                          alt={t(event.title_en, event.title_zh)}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {(event.description_en || event.description_zh) && (
                      <p className="text-gray-700">
                        {t(event.description_en, event.description_zh)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default History;