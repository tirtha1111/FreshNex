import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
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
      color: 'text-[#20E79A]',
      bgColor: 'bg-[#20E79A]/15',
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
    { name: 'Dairy Products', count: 706, ratio: 55, color: '#20E79A' },
    { name: 'Meat Products', count: 578, ratio: 45, color: '#FFAA00' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 select-none pb-12 font-sans"
    >
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight flex items-center gap-2">
            <span>Analytics & Insights</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/20">
              Live Aggregate
            </span>
          </h1>
          <p className="text-xs font-bold text-[#5C7F75] mt-1">
            Insights on scan trends, spoilage mitigation, and cold-chain compliance.
          </p>
        </div>

        {/* Time Range Selector with layoutId animation */}
        <div className="inline-flex p-1 rounded-xl bg-[#F4F7F6] border border-[#13493B]/10">
          {(['30d', '90d', '1y'] as const).map((range) => {
            const active = timeRange === range;
            const labels = { '30d': 'Last 30 Days', '90d': '90 Days', '1y': 'Full Year' };
            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className="relative px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer"
              >
                {active && (
                  <motion.div
                    layoutId="analyticsRangeActive"
                    className="absolute inset-0 bg-white shadow-sm border border-[#13493B]/10 rounded-lg"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${active ? 'text-[#07221A]' : 'text-[#5C7F75] hover:text-[#07221A]'}`}>
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
              className="bg-white border border-[#13493B]/10 rounded-[24px] p-5 flex flex-col justify-between shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#5C7F75] uppercase tracking-wider">{s.title}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bgColor} ${s.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-[#07221A]">{s.value}</span>
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
        <div className="lg:col-span-8 bg-white border border-[#13493B]/10 rounded-[28px] p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#07221A]">Scan Volume & Freshness Trends</h3>
              <p className="text-[11px] text-[#5C7F75] font-semibold">Monthly throughput across connected cold-storage vaults.</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F7F6" vertical={false} />
                <XAxis dataKey="month" stroke="#5C7F75" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
                <YAxis stroke="#5C7F75" fontSize={10} fontWeight={700} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: 'rgba(19, 73, 59, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
                  }}
                  labelStyle={{ fontWeight: 800, color: '#07221A', fontSize: '11px' }}
                  itemStyle={{ fontWeight: 700, fontSize: '11px', color: '#20E79A' }}
                />
                <Bar dataKey="fresh" name="Fresh Items" fill="#20E79A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRisk" name="At Risk" fill="#FFAA00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Distribution Pie */}
        <div className="lg:col-span-4 bg-white border border-[#13493B]/10 rounded-[28px] p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-black text-[#07221A]">Quality Distribution</h3>
            <p className="text-[11px] text-[#5C7F75] font-semibold">Percentage breakdown of all inspected inventory.</p>
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
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: 'rgba(19, 73, 59, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
                  }}
                  labelStyle={{ fontWeight: 800, color: '#07221A', fontSize: '11px' }}
                  itemStyle={{ fontWeight: 700, fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-[#F4F7F6] pt-4">
            {qualityDistribution.map((q) => (
              <div key={q.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.color }} />
                  <span className="text-[#07221A] font-bold">{q.name}</span>
                </div>
                <span className="font-extrabold text-[#5C7F75]">{q.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="bg-white border border-[#13493B]/10 rounded-[28px] p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-[#07221A]">Monitored Product Categories</h3>
        <div className="space-y-3">
          {categoryBreakdown.map((cat, idx) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#07221A]">{cat.name}</span>
                <span className="text-[#20E79A] font-mono font-black">{cat.count} items ({cat.ratio}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F4F7F6] overflow-hidden border border-[#13493B]/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.ratio}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[#20E79A] to-[#20E79A]/70"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
