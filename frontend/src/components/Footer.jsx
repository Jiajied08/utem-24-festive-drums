import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, Facebook, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Footer = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API}/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-[#0A0A0A] text-white py-12" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings?.logo_path ? (
                <img
                  src={`${API}/files/${settings.logo_path}`}
                  alt="UTeM 24FD Logo"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37] bg-[#410C09] flex items-center justify-center font-heading text-[#D4AF37] text-lg font-bold">
                  廿四
                </div>
              )}
              <h3 className="font-heading text-2xl font-bold" data-testid="footer-club-name">
                {t('UTeM 24 Festive Drum Club', 'UTeM 二十四节令鼓队')}
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              {t(
                'Tradition in Every Beat. Unity in Every Performance.',
                '每一个节拍都有传统，每一场演出都有团结。'
              )}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4" data-testid="footer-contact-title">{t('Contact Us', '联系我们')}</h4>
            <div className="space-y-2 text-sm text-gray-400">
              {settings && (
                <>
                  <div className="flex items-center gap-2" data-testid="footer-address">
                    <MapPin size={16} />
                    <span>{t(settings.address_en, settings.address_zh)}</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="footer-phone-captain">
                    <Phone size={16} />
                    <span>{settings.whatsapp_captain} ({t('Captain', '队长')})</span>
                  </div>
                  <div className="flex items-center gap-2" data-testid="footer-phone-vice">
                    <Phone size={16} />
                    <span>{settings.whatsapp_vice} ({t('Vice Captain', '副队长')})</span>
                  </div>
                  {settings.email && settings.email !== '[Email]' && (
                    <div className="flex items-center gap-2" data-testid="footer-email">
                      <Mail size={16} />
                      <span>{settings.email}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4" data-testid="footer-social-title">{t('Follow Us', '关注我们')}</h4>
            <div className="flex gap-4">
              {settings?.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors"
                  data-testid="footer-instagram-link"
                >
                  <Instagram size={24} />
                </a>
              )}
              {settings?.facebook && (
                <a
                  href={`https://www.facebook.com/${settings.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors"
                  data-testid="footer-facebook-link"
                >
                  <Facebook size={24} />
                </a>
              )}
              {settings?.youtube && (
                <a
                  href={`https://www.youtube.com/channel/${settings.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D4AF37] transition-colors"
                  data-testid="footer-youtube-link"
                >
                  <Youtube size={24} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400" data-testid="footer-copyright">
          <p>&copy; {new Date().getFullYear()} UTeM 24 Festive Drum Club. {t('All rights reserved.', '版权所有。')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;