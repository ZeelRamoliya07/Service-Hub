import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalyticsOverview } from '../services/analytics';
import { getRequests } from '../services/requests';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertOctagon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, requestsData] = await Promise.all([
        getAnalyticsOverview(),
        getRequests({ limit: 5 }),
      ]);
      setAnalytics(overviewData);
      setRecentRequests(requestsData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('System connection failure. Could not fetch database metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingState message="FETCHING LIVE CONTROL ROOM METRICS..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  const statusColors = ['#FFD600', '#0057FF', '#0057FF', '#B7FF00', '#FF3B30'];

  const requestColumns = [
    {
      header: 'REQ ID',
      accessor: 'id',
      render: (row) => <span className="font-mono font-black text-xs">#{row.id}</span>,
    },
    {
      header: 'TITLE',
      accessor: 'title',
      render: (row) => (
        <span className="font-extrabold uppercase text-xs text-black block truncate max-w-[200px]">
          {row.title}
        </span>
      ),
    },
    {
      header: 'CUSTOMER',
      accessor: 'customer',
      render: (row) => <span className="font-semibold text-xs text-neutral-800">{row.customer?.name}</span>,
    },
    {
      header: 'ASSIGNED',
      accessor: 'employee',
      render: (row) => (
        <span className="font-bold text-xs text-black">
          {row.employee ? row.employee.name : <span className="text-neutral-400">UNASSIGNED</span>}
        </span>
      ),
    },
    {
      header: 'PRIORITY',
      accessor: 'priority',
      render: (row) => <Badge priority={row.priority} />,
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="brutal-card bg-black text-white p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="z-10">
          <span className="text-xs font-black uppercase text-[#FFD600] tracking-widest block mb-1">
            CONTROL ROOM OPERATIONS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-tight uppercase">
            GOOD MORNING, {user?.name?.split(' ')[0] || 'OPERATOR'}.
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-neutral-300 uppercase mt-1">
            HERE'S WHAT'S MOVING ACROSS THE SERVICEHUB DATABASE TODAY.
          </p>
        </div>
        <div className="z-10 flex flex-wrap gap-2">
          <Button variant="yellow" size="sm" onClick={() => navigate('/requests')}>
            <Plus className="w-4 h-4 mr-1 inline-block" /> NEW REQUEST
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/customers')}>
            <Users className="w-4 h-4 mr-1 inline-block" /> CUSTOMERS
          </Button>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL CUSTOMERS"
          value={analytics?.total_customers || 0}
          subtitle="REGISTERED CLIENT ACCOUNTS"
          icon={Users}
          accentColor="#FFD600"
          onClick={() => navigate('/customers')}
        />
        <StatCard
          title="OPEN REQUESTS"
          value={(analytics?.pending_requests || 0) + (analytics?.assigned_requests || 0) + (analytics?.in_progress_requests || 0)}
          subtitle="ACTIVE PIPELINE ITEMS"
          icon={ClipboardList}
          accentColor="#0057FF"
          onClick={() => navigate('/requests')}
        />
        <StatCard
          title="COMPLETED"
          value={analytics?.completed_requests || 0}
          subtitle="SUCCESSFULLY RESOLVED"
          icon={CheckCircle2}
          accentColor="#B7FF00"
          onClick={() => navigate('/requests?status=COMPLETED')}
        />
        <StatCard
          title="PENDING"
          value={analytics?.pending_requests || 0}
          subtitle="AWAITING ASSIGNMENT"
          icon={Clock}
          accentColor="#FF3B30"
          onClick={() => navigate('/requests?status=PENDING')}
        />
      </div>

      {/* Main Content Grid: Recent Requests & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Requests Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card
            title="RECENT SERVICE REQUESTS"
            subtitle="LAST 5 ACTIVITY RECORDS IN DATABASE"
            action={
              <Button variant="outline" size="sm" onClick={() => navigate('/requests')}>
                VIEW ALL <ArrowUpRight className="w-4 h-4 ml-1 inline-block" />
              </Button>
            }
          >
            <Table
              columns={requestColumns}
              data={recentRequests}
              onRowClick={(row) => navigate('/requests')}
              emptyMessage="NO RECENT SERVICE REQUESTS FOUND"
            />
          </Card>
        </div>

        {/* Right Column: Analytics Distribution Chart */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card title="REQUEST STATUS DISTRIBUTION" subtitle="REAL-TIME LIFECYCLE METRICS">
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.status_distribution || []}>
                  <XAxis
                    dataKey="name"
                    stroke="#000000"
                    tick={{ fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis stroke="#000000" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #000000',
                      fontWeight: 700,
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" border={{ stroke: '#000000', strokeWidth: 2 }}>
                    {(analytics?.status_distribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-3 border-t-2 border-black grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#FFD600] border border-black" />
                <span>PENDING: {analytics?.pending_requests}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#0057FF] border border-black" />
                <span>IN PROGRESS: {analytics?.in_progress_requests}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#B7FF00] border border-black" />
                <span>COMPLETED: {analytics?.completed_requests}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#FF3B30] border border-black" />
                <span>CANCELLED: {analytics?.cancelled_requests}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
