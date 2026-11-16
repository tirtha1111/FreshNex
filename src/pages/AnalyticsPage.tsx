import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
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
  Cell,
} from 'recharts';
import { useFreshness } from '../context/FreshnessContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const AnalyticsPage: React.FC = () => {
  const { scanHistory } = useFreshness();
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d');

  // Single-pass memoized aggregation so live telemetry updates in FreshnessContext never recompute or re-animate charts
  const {
    totalScans,
    stats,
    monthlyTrends,
    qualityDistribution,
    pieChartData,
    categoryBreakdown,
  } = useMemo(() => {
    const now = Date.now();
    const cutoffMs =
      timeRange === '30d'
        ? now - 30 * 24 * 60 * 60 * 1000
        : timeRange === '90d'
        ? now - 90 * 24 * 60 * 60 * 1000
        : now - 365 * 24 * 60 * 60 * 1000;

    let freshCount = 0;
    let atRiskCount = 0;
    let expiredCount = 0;
    let appleCount = 0;
    let milkCount = 0;

    const monthBuckets = MONTHS.map((m) => ({
      month: m,
      scans: 0,
      fresh: 0,
      atRisk: 0,
    }));

    let filteredTotal = 0;

    for (let i = 0; i < scanHistory.length; i++) {
      const s = scanHistory[i];
      const ts = Number(s.timestamp) || 0;
      if (ts > 0 && ts < cutoffMs) continue;

      filteredTotal++;

      const isFresh = s.status === 'Fresh';
      const isRisk = s.status === 'Warning' || s.status === 'At Risk';
      const isExpired =
        s.status === 'Critical' || s.status === 'Unsafe' || s.status === 'Spoiled';

      if (isFresh) freshCount++;
      else if (isRisk) atRiskCount++;
      else if (isExpired) expiredCount++;

      if (ts > 0) {
        const monthIdx = new Date(ts).getMonth();
        if (monthIdx >= 0 && monthIdx < 12) {
          monthBuckets[monthIdx].scans++;
          if (isFresh) monthBuckets[monthIdx].fresh++;
          if (isRisk) monthBuckets[monthIdx].atRisk++;
        }
      }

      const nameLower = (s.itemName || '').toLowerCase();
      const idUpper = (s.itemId || '').toUpperCase();
      if (nameLower.includes('apple') || idUpper.includes('APPLE') || idUpper.includes('001')) {
        appleCount++;
      } else if (nameLower.includes('milk') || idUpper.includes('MILK') || idUpper.includes('124')) {
        milkCount++;
      }
    }

    const freshPercent = filteredTotal > 0 ? Math.round((freshCount / filteredTotal) * 100) : 0;
    const atRiskPercent = filteredTotal > 0 ? Math.round((atRiskCount / filteredTotal) * 100) : 0;
    const expiredPercent = filteredTotal > 0 ? Math.round((expiredCount / filteredTotal) * 100) : 0;

    const computedStats = [
      {
        title: 'Total Scans',
        value: String(filteredTotal),
        change: '0%',
        icon: Layers,
        color: 'text-[#20E79A]',
        bgColor: 'bg-[#20E79A]/15',
      },
      {
        title: 'Fresh Items',
        value: String(freshCount),
        change: `${freshPercent}%`,
        icon: CheckCircle2,
        color: 'text-[#20E79A]',
        bgColor: 'bg-[#20E79A]/15',
      },
      {
        title: 'At Risk',
        value: String(atRiskCount),
        change: `${atRiskPercent}%`,
        icon: AlertTriangle,
        color: 'text-[#FFAA00]',
        bgColor: 'bg-[#FFAA00]/15',
      },
      {
        title: 'Expired',
        value: String(expiredCount),
        change: `${expiredPercent}%`,
        icon: XCircle,
        color: 'text-[#FF5A67]',
        bgColor: 'bg-[#FF5A67]/15',
      },
    ];

    const dist = [
      { name: 'Fresh', value: freshPercent, color: '#20E79A' },
      { name: 'At Risk', value: atRiskPercent, color: '#FFAA00' },
      { name: 'Expired', value: expiredPercent, color: '#FF5A67' },
    ];

    const pieData =
      filteredTotal > 0
        ? dist.filter((q) => q.value > 0)
        : [{ name: 'Zero Scans', value: 1, color: '#E2E8F0' }];

    const appleRatio = filteredTotal > 0 ? Math.round((appleCount / filteredTotal) * 100) : 0;
    const milkRatio = filteredTotal > 0 ? Math.round((milkCount / filteredTotal) * 100) : 0;

    const categories = [
      { name: 'Apples (Node 001)', count: appleCount, ratio: appleRatio, color: '#20E79A' },
      { name: 'Milk (Node 124)', count: milkCount, ratio: milkRatio, color: '#FFAA00' },
    ];

    return {
      totalScans: filteredTotal,
      stats: computedStats,
      monthlyTrends: monthBuckets,
      qualityDistribution: dist,
      pieChartData: pieData,
      categoryBreakdown: categories,
    };
  }, [scanHistory, timeRange]);

  return (
    <div className="space-y-6 select-none pb-12 font-sans">
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight flex items-center gap-2">
            <span>Analytics &amp; Insights</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/20">
              Live Aggregate
            </span>
          </h1>
          <p className="text-xs font-bold text-[#5C7F75] mt-1">
            Real-time telemetry analytics. All column metrics reflect actual recorded scans.
          </p>
        </div>

        {/* Static Instant Time Range Selector */}
        <div className="inline-flex p-1 rounded-xl bg-[#F4F7F6] border border-[#13493B]/10 self-start sm:self-auto">
          {(['30d', '90d', '1y'] as const).map((range) => {
            const active = timeRange === range;
            const labels = { '30d': 'Last 30 Days', '90d': '90 Days', '1y': 'Full Year' };
            return (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-[#07221A] shadow-xs border border-[#13493B]/10'
                    : 'text-[#5C7F75] hover:text-[#07221A]'
                }`}
              >
                {labels[range]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Metric Cards (Static for instant paint) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="bg-white border border-[#13493B]/10 rounded-[24px] p-5 flex flex-col justify-between shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#5C7F75] uppercase tracking-wider">
                  {s.title}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg ${s.bgColor} ${s.color} flex items-center justify-center`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-black text-[#07221A] tabular-nums">
                  {s.value}
                </span>
                <span className="text-xs font-bold text-[#5C7F75] flex items-center gap-0.5 bg-[#13493B]/5 px-2 py-0.5 rounded-md tabular-nums">
                  <TrendingUp className="w-3 h-3 text-[#5C7F75]" />
                  {s.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-[#13493B]/10 rounded-[28px] p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#07221A]">
                Scan Volume &amp; Freshness Trends
              </h3>
              <p className="text-[11px] text-[#5C7F75] font-semibold">
                Monthly throughput columns across connected cold-storage vaults.
              </p>
            </div>
            {totalScans === 0 && (
              <span className="text-[11px] font-bold text-[#5C7F75] bg-[#F4F7F6] px-3 py-1 rounded-full border border-[#13493B]/10">
                0 Scans Recorded
              </span>
            )}
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F7F6" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#5C7F75"
                  fontSize={10}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#5C7F75"
                  fontSize={10}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: 'rgba(19, 73, 59, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                  }}
                  labelStyle={{ fontWeight: 800, color: '#07221A', fontSize: '11px' }}
                  itemStyle={{ fontWeight: 700, fontSize: '11px', color: '#20E79A' }}
                />
                <Bar
                  dataKey="fresh"
                  name="Fresh Items"
                  fill="#20E79A"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="atRisk"
                  name="At Risk"
                  fill="#FFAA00"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Distribution Pie */}
        <div className="lg:col-span-4 bg-white border border-[#13493B]/10 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-black text-[#07221A]">Quality Distribution</h3>
            <p className="text-[11px] text-[#5C7F75] font-semibold">
              Percentage breakdown of inspected inventory.
            </p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={totalScans > 0 ? 5 : 0}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                {totalScans > 0 && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'rgba(19, 73, 59, 0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                    }}
                    labelStyle={{ fontWeight: 800, color: '#07221A', fontSize: '11px' }}
                    itemStyle={{ fontWeight: 700, fontSize: '11px' }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-[#07221A] tabular-nums">{totalScans}</span>
              <span className="text-[9px] font-bold text-[#5C7F75] uppercase">Total Scans</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-[#F4F7F6] pt-4">
            {qualityDistribution.map((q) => (
              <div key={q.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: q.color }} />
                  <span className="text-[#07221A] font-bold">{q.name}</span>
                </div>
                <span className="font-extrabold text-[#5C7F75] tabular-nums">{q.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="bg-white border border-[#13493B]/10 rounded-[28px] p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-black text-[#07221A]">Monitored Product Categories</h3>
        <div className="space-y-3">
          {categoryBreakdown.map((cat) => (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#07221A]">{cat.name}</span>
                <span className="text-[#20E79A] font-mono font-black tabular-nums">
                  {cat.count} items ({cat.ratio}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#F4F7F6] overflow-hidden border border-[#13493B]/10">
                <div
                  style={{ width: `${cat.ratio}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#20E79A] to-[#20E79A]/70"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
