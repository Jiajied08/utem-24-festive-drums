import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      document.cookie = `session_token=${data.session_token}; path=/; secure; samesite=none; max-age=${7 * 24 * 60 * 60}`;
      navigate('/admin/dashboard', { state: { user: data.user }, replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d?.msg || '').join(' ')
          : t('Login failed. Please try again.', '登录失败，请再试一次。');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E7] px-4" data-testid="admin-login-page">
      <div className="max-w-md w-full bg-white p-8 rounded-sm shadow-lg">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-[#410C09] mb-2">
            {t('Admin Login', '管理员登录')}
          </h1>
          <p className="text-gray-600">
            {t('Sign in to manage club content', '登录以管理俱乐部内容')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" data-testid="admin-login-form">
          <div>
            <Label htmlFor="email">{t('Email', '邮箱')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="username"
              data-testid="login-email-input"
            />
          </div>

          <div>
            <Label htmlFor="password">{t('Password', '密码')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              data-testid="login-password-input"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" data-testid="login-error">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-6 text-lg"
            data-testid="login-submit-btn"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : t('Sign in', '登录')}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t(
            'Only authorized committee members can access the admin dashboard',
            '只有授权的委员会成员才能访问管理仪表板'
          )}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
