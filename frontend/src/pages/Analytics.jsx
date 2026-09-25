import React, { useState, useEffect } from 'react';
import { getAnalyticsOverview } from '../services/analytics';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  Calendar,
  Wrench,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
      setError('System connection failure. Unable to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingState message="COMPUTING DATABASE ANALYTICS & METRICS..." />;
  if (error) return <ErrorState message={error} onRetry={fetchAnalytics} />;
  if (!data) return null;

  const statusColors = ['#FFD600', '#0057FF', '#0057FF', '#B7FF00', '#FF3B30'];
  const priorityColors = ['#E5E5E5', '#000000', '#FFD600', '#FF3B30'];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="brutal-card bg-[#FFD600] text-black p-6 border-3 border-black">
        <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-2.5 py-0.5 inline-block mb-2">
          DATABASE-DRIVEN INTELLIGENCE
        </span>
        <h2 className="text-3xl font-black font-heading tracking-tight uppercase">
          OPERATIONAL ANALYTICS & PERFORMANCE
        </h2>
        <p className="text-xs font-extrabold uppercase text-neutral-800 mt-1">
          REAL-TIME AGGREGATED METRICS COMPUTED DIRECTLY FROM SERVICEHUB POSTGRESQL TABLES.
        </p>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL REQUESTS"
          value={data.total_requests}
          subtitle="TOTAL LIFETIME SUBMISSIONS"
          icon={ClipboardList}
          accentColor="#FFD600"
        />
        <StatCard
          title="COMPLETED"
          value={data.completed_requests}
          subtitle="SUCCESSFUL RESOLUTIONS"
          icon={CheckCircle2}
          accentColor="#B7FF00"
        />
        <StatCard
          title="CUSTOMERS"
          value={data.total_customers}
          subtitle="REGISTERED CLIENT BASE"
          icon={Users}
          accentColor="#0057FF"
        />
        <StatCard
          title="APPOINTMENTS"
          value={data.total_appointments}
          subtitle="SCHEDULED CALENDAR ITEMS"
          icon={Calendar}
          accentColor="#FF3B30"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requests Over Time */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card title="REQUEST INTAKE OVER TIME" subtitle="DAILY SUBMISSION VOLUME (PAST 7 DAYS)">
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.requests_over_time || []}>
                  <XAxis dataKey="date" stroke="#000000" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis stroke="#000000" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #000000',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#000000"
                    strokeWidth={3}
                    fill="#FFD600"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Requests by Status Bar Chart */}
          <Card title="REQUEST PIPELINE BY STATUS" subtitle="STATUS BREAKDOWN">
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.status_distribution || []}>
                  <XAxis dataKey="name" stroke="#000000" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis stroke="#000000" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #000000',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" border={{ stroke: '#000000', strokeWidth: 2 }}>
                    {(data.status_distribution || []).map((entry, index) => (
                      <Cell key={`status-cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Priority Distribution & Resource Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card title="REQUEST PRIORITY MATRIX" subtitle="DISTRIBUTION BY PRIORITY LEVEL">
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.priority_distribution || []} layout="vertical">
                  <XAxis type="number" stroke="#000000" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <YAxis dataKey="name" type="category" stroke="#000000" tick={{ fontSize: 11, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #000000',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" border={{ stroke: '#000000', strokeWidth: 2 }}>
                    {(data.priority_distribution || []).map((entry, index) => (
                      <Cell key={`prio-cell-${index}`} fill={priorityColors[index % priorityColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Business System Inventory Summary */}
          <Card title="SYSTEM CAPACITY" subtitle="ACTIVE SYSTEM RESOURCE INVENTORY">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 border-2 border-black bg-white">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-black" />
                  <span className="text-xs font-bold uppercase">EMPLOYEE ROSTER</span>
                </div>
                <span className="text-base font-black font-heading">{data.total_employees} ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 border-2 border-black bg-white">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-black" />
                  <span className="text-xs font-bold uppercase">SERVICES OFFERED</span>
                </div>
                <span className="text-base font-black font-heading">{data.total_services} OFFERINGS</span>
              </div>
              <div className="flex items-center justify-between p-3 border-2 border-black bg-white">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-black" />
                  <span className="text-xs font-bold uppercase">CLIENT BASE</span>
                </div>
                <span className="text-base font-black font-heading">{data.total_customers} CLIENTS</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
