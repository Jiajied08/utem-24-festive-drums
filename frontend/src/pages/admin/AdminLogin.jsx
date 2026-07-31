import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const AdminLogin = () => {
  const { t } = useLanguage();

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/admin/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E7]" data-testid="admin-login-page">
      <div className="max-w-md w-full bg-white p-8 rounded-sm shadow-lg">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-[#410C09] mb-2">
            {t('Admin Login', '管理员登录')}
          </h1>
          <p className="text-gray-600">
            {t('Sign in to manage club content', '登录以管理俱乐部内容')}
          </p>
        </div>

        <Button
          onClick={handleLogin}
          className="w-full btn-primary py-6 text-lg"
          data-testid="google-login-btn"
        >
          {t('Sign in with Google', '使用 Google 登录')}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('Only authorized committee members can access the admin dashboard', '只有授权的委员会成员才能访问管理仪表板')}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;