import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d');

  const stats = [
    {
      title: 'Total Scans',
      value: '1,284',
      change: '+12%',
      isPositive: true,
      icon: Layers,
      color: 'text-[#FF6A00]',
      bgColor: 'bg-[#FF6A00]/15',
    },
    {
      title: 'Fresh Items',
      value: '1,048',
      change: '+8%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'text-[#20E79A]',
      bgColor: 'bg-[#20E79A]/15',
    },
    {
      title: 'At Risk',
      value: '182',
      change: '-3%',
      isPositive: true,
      icon: AlertTriangle,
      color: 'text-[#FFAA00]',
      bgColor: 'bg-[#FFAA00]/15',
    },
    {
      title: 'Expired',
      value: '54',
      change: '-15%',
      isPositive: true,
      icon: XCircle,
      color: 'text-[#FF5A67]',
      bgColor: 'bg-[#FF5A67]/15',
    },
  ];

  const monthlyTrends = [
    { month: 'Jan', scans: 940, fresh: 780, atRisk: 120 },
    { month: 'Feb', scans: 1020, fresh: 860, atRisk: 110 },
    { month: 'Mar', scans: 1150, fresh: 960, atRisk: 130 },
    { month: 'Apr', scans: 1080, fresh: 900, atRisk: 125 },
    { month: 'May', scans: 1210, fresh: 1020, atRisk: 140 },
    { month: 'Jun', scans: 1250, fresh: 1030, atRisk: 155 },
    { month: 'Jul', scans: 1190, fresh: 990, atRisk: 140 },
    { month: 'Aug', scans: 1240, fresh: 1020, atRisk: 150 },
    { month: 'Sep', scans: 1284, fresh: 1048, atRisk: 182 },
  ];

  const qualityDistribution = [
    { name: 'Fresh', value: 81, color: '#20E79A' },
    { name: 'At Risk', value: 14, color: '#FFAA00' },
    { name: 'Expired', value: 5, color: '#FF5A67' },
  ];

  const categoryBreakdown = [
    { name: 'Vegetables', count: 480, ratio: 37 },
    { name: 'Dairy', count: 320, ratio: 25 },
    { name: 'Meat & Poultry', count: 260, ratio: 20 },
    { name: 'Fruits', count: 144, ratio: 11 },
    { name: 'Seafood', count: 80, ratio: 7 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 select-none pb-12"
    >
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FDF8F5] tracking-tight flex items-center gap-2">
            <span>Analytics & Insights</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF6A00]/20 text-[#FFAA00] border border-[#FFAA00]/30">
              Live Aggregate
            </span>
          </h1>
          <p className="text-sm text-[#B8A89E] mt-1">
            Insights on scan trends, spoilage mitigation, and cold-chain compliance.
          </p>
        </div>

        {/* Time Range Selector with layoutId animation */}
        <div className="inline-flex p-1 rounded-xl bg-[#261A12] border border-[#3D261A]">
          {(['30d', '90d', '1y'] as const).map((range) => {
            const active = timeRange === range;
            const labels = { '30d': 'Last 30 Days', '90d': '90 Days', '1y': 'Full Year' };
            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className="relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                {active && (
                  <motion.div
                    layoutId="analyticsRangeActive"
                    className="absolute inset-0 bg-[#FF6A00] rounded-lg shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-[#140C08]' : 'text-[#B8A89E] hover:text-[#FDF8F5]'}`}>
                  {labels[range]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="card-solid p-5 flex flex-col justify-between shadow-xl border border-[#FF6A00]/20"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider">{s.title}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bgColor} ${s.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-[#FDF8F5]">{s.value}</span>
                <span className="text-xs font-bold text-[#20E79A] flex items-center gap-0.5 bg-[#20E79A]/10 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  {s.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Bar/Line Chart */}
        <div className="lg:col-span-8 card-solid p-6 space-y-6 shadow-2xl border border-[#FF6A00]/25">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#FDF8F5]">Scan Volume & Freshness Trends</h3>
              <p className="text-xs text-[#8C7A70]">Monthly throughput across connected cold-storage vaults.</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3D261A" opacity={0.5} />
                <XAxis dataKey="month" stroke="#8C7A70" fontSize={11} tickLine={false} />
                <YAxis stroke="#8C7A70" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#221610',
                    borderColor: '#FF6A00',
                    borderRadius: '12px',
                    color: '#FDF8F5',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="fresh" name="Fresh Items" fill="#20E79A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRisk" name="At Risk" fill="#FFAA00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Distribution Pie */}
        <div className="lg:col-span-4 card-solid p-6 flex flex-col justify-between shadow-2xl border border-[#FF6A00]/25">
          <div>
            <h3 className="text-base font-bold text-[#FDF8F5]">Quality Distribution</h3>
            <p className="text-xs text-[#8C7A70]">Percentage breakdown of all inspected inventory.</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#140C08" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#221610',
                    borderColor: '#FF6A00',
                    borderRadius: '12px',
                    color: '#FDF8F5',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-[#3D261A] pt-4">
            {qualityDistribution.map((q) => (
              <div key={q.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.color }} />
                  <span className="text-[#FDF8F5] font-medium">{q.name}</span>
                </div>
                <span className="font-bold text-[#B8A89E]">{q.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="card-solid p-6 space-y-4 shadow-2xl border border-[#FF6A00]/25">
        <h3 className="text-base font-bold text-[#FDF8F5]">Monitored Product Categories</h3>
        <div className="space-y-3">
          {categoryBreakdown.map((cat, idx) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#FDF8F5]">{cat.name}</span>
                <span className="text-[#FFAA00] font-mono font-semibold">{cat.count} items ({cat.ratio}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#261A12] overflow-hidden border border-[#3D261A]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.ratio}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[#FFAA00] to-[#FF6A00]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
