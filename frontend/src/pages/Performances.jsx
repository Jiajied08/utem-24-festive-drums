import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Performances = () => {
  const { t } = useLanguage();
  const [gallery, setGallery] = useState([]);
  const [filter, setFilter] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      setGallery(response.data);
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    }
  };

  const categories = [
    { value: 'all', label: t('All', '全部') },
    { value: 'Events', label: t('Events', '活动') },
    { value: 'Competitions', label: t('Competitions', '比赛') },
    { value: 'Training', label: t('Training', '训练') },
    { value: 'Team Activities', label: t('Team Activities', '团队活动') }
  ];

  const filteredGallery = filter === 'all' ? gallery : gallery.filter(item => item.category === filter);

  return (
    <div className="min-h-screen" data-testid="performances-page">
      <section className="relative py-32 bg-[#410C09] text-white" data-testid="performances-hero">
        <div className="absolute inset-0 texture-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4">
              {t('Gallery', '画廊')}
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium">
              {t('Performances', '演出')}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white" data-testid="gallery-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center mb-12" data-testid="gallery-filters">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className={filter === cat.value ? 'btn-primary' : 'btn-secondary'}
                data-testid={`filter-${cat.value}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {filteredGallery.length === 0 ? (
            <div className="text-center py-20" data-testid="gallery-empty">
              <p className="text-gray-500 text-lg">
                {t('No images available yet. Check back soon!', '暂无图片。请稍后再查看！')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="gallery-grid">
              {filteredGallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="overflow-hidden rounded-sm aspect-square cursor-pointer"
                  onClick={() => setLightbox(item)}
                  data-testid={`gallery-item-${index}`}
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

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} data-testid="lightbox">
          <button
            className="absolute top-4 right-4 text-white hover:text-[#D4AF37] z-10"
            onClick={() => setLightbox(null)}
            data-testid="lightbox-close"
          >
            <X size={32} />
          </button>
          <img
            src={`${API}/files/${lightbox.storage_path}`}
            alt={t(lightbox.title_en, lightbox.title_zh)}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            data-testid="lightbox-image"
          />
          {(lightbox.title_en || lightbox.title_zh) && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
              <p className="text-lg font-bold">{t(lightbox.title_en, lightbox.title_zh)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Performances;