import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, Calendar, MessageSquare } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    members: 0,
    performances: 0,
    years: 0,
    enquiries: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clubInfo, enquiries] = await Promise.all([
          axios.get(`${API}/club-info`),
          axios.get(`${API}/enquiries`, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${document.cookie
                .split('; ')
                .find((row) => row.startsWith('session_token='))
                ?.split('=')[1] || ''}`
            }
          })
        ]);

        const currentYear = new Date().getFullYear();
        setStats({
          members: clubInfo.data.members_count || 0,
          performances: clubInfo.data.performances_count || 0,
          years: currentYear - (clubInfo.data.established_year || 2011),
          enquiries: enquiries.data.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout user={user}>
      <div data-testid="admin-dashboard-page">
        <h1 className="text-4xl font-heading font-bold text-[#410C09] mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-card-years">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Years of Experience</CardTitle>
              <Calendar className="h-4 w-4 text-[#410C09]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#410C09]">{stats.years}+</div>
            </CardContent>
          </Card>

          <Card data-testid="stat-card-performances">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Performances</CardTitle>
              <Award className="h-4 w-4 text-[#410C09]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#410C09]">{stats.performances}+</div>
            </CardContent>
          </Card>

          <Card data-testid="stat-card-members">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-[#410C09]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#410C09]">{stats.members}+</div>
            </CardContent>
          </Card>

          <Card data-testid="stat-card-enquiries">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-[#410C09]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#410C09]">{stats.enquiries}</div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="welcome-card">
          <CardHeader>
            <CardTitle>Welcome, {user?.name}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Use the sidebar to manage club information, gallery, performance packages, enquiries, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;