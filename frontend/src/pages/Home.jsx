import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Users, Award, Calendar } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  const [clubInfo, setClubInfo] = useState(null);
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, galleryRes] = await Promise.all([
          axios.get(`${API}/club-info`),
          axios.get(`${API}/gallery`)
        ]);
        setClubInfo(infoRes.data);
        setGallery(galleryRes.data.slice(0, 6));
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
      <section className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524230659092-07f99a75c013?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwzfHxkcnVtJTIwcGVyZm9ybWFuY2V8ZW58MHx8fHwxNzg1NTEyMjIwfDA&ixlib=rb-4.1.0&q=85')`
          }}
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 texture-overlay" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 max-w-5xl"
        >
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-4" data-testid="hero-overline">
            {t('Est. 2011', '建立于 2011')}
          </p>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-none font-medium mb-4" data-testid="hero-title-en">
            UTeM 24 Festive Drum Club
          </h1>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6" data-testid="hero-title-zh">
            UTeM 二十四节令鼓队
          </h2>
          <p className="text-lg md:text-xl leading-relaxed mb-8 text-gray-200" data-testid="hero-tagline">
            {t(
              'Tradition in Every Beat. Unity in Every Performance.',
              '每一个节拍都有传统，每一场演出都有团结。'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/packages">
              <Button
                size="lg"
                className="btn-primary px-8 py-6 text-lg rounded-sm"
                data-testid="hero-cta-invite"
              >
                {t('Invite Us to Perform', '邀请我们演出')}
              </Button>
            </Link>
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
      </section>

      <section className="py-20 bg-[#F5F1E7]" data-testid="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
              data-testid="stat-years"
            >
              <div className="flex justify-center mb-4">
                <Calendar size={48} className="text-[#410C09]" />
              </div>
              <h3 className="font-heading text-4xl font-bold text-[#410C09] mb-2">{yearsOfExperience}+</h3>
              <p className="text-gray-600">{t('Years of Experience', '年经验')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
              data-testid="stat-performances"
            >
              <div className="flex justify-center mb-4">
                <Award size={48} className="text-[#410C09]" />
              </div>
              <h3 className="font-heading text-4xl font-bold text-[#410C09] mb-2">{clubInfo?.performances_count || 0}+</h3>
              <p className="text-gray-600">{t('Performances', '演出')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
              data-testid="stat-members"
            >
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-[#410C09]" />
              </div>
              <h3 className="font-heading text-4xl font-bold text-[#410C09] mb-2">{clubInfo?.members_count || 0}+</h3>
              <p className="text-gray-600">{t('Active Members', '活跃成员')}</p>
            </motion.div>
          </div>
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
              {t('About Us', '关于我们')}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl tracking-tight mb-6 text-[#0A0A0A]">
              {t(
                'Preserving the Art of 24 Festive Drums',
                '保护 24 节令鼓艺术'
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
            <div className="text-center mt-12">
              <Link to="/performances">
                <Button className="btn-secondary px-6 py-3" data-testid="gallery-view-all">
                  {t('View All Performances', '查看所有演出')}
                </Button>
              </Link>
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
              {t('Ready to Book a Performance?', '准备好预订表演了吗？')}
            </h2>
            <p className="text-lg mb-8 text-gray-200">
              {t(
                'Contact us today to discuss your event requirements and receive a custom quotation.',
                '立即联系我们，讨论您的活动需求并获取定制报价。'
              )}
            </p>
            <Link to="/packages">
              <Button size="lg" className="btn-primary px-8 py-6 text-lg" data-testid="cta-packages">
                {t('View Packages & Pricing', '查看套餐和价格')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;