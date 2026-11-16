import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  RefreshCw,
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
import { ScanHistoryRecord } from '../types';
import { DEFAULT_SCAN_HISTORY } from '../data/initialData';
import { FirebaseService } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

export type AnalyticsTimeRange = '30d' | '90d' | '1y';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SESSION_STORAGE_CACHE_KEY = 'freshnex_analytics_session_cache_v1';

interface MonthlyBucket {
  month: string;
  scans: number;
  fresh: number;
  atRisk: number;
}

interface QualitySlice {
  name: string;
  value: number;
  color: string;
}

interface CategoryItem {
  name: string;
  count: number;
  ratio: number;
  color: string;
}

interface ComputedAnalyticsMetrics {
  totalScans: number;
  freshCount: number;
  atRiskCount: number;
  expiredCount: number;
  freshPercent: number;
  atRiskPercent: number;
  expiredPercent: number;
  monthlyTrends: MonthlyBucket[];
  qualityDistribution: QualitySlice[];
  pieChartData: QualitySlice[];
  categoryBreakdown: CategoryItem[];
}

interface AnalyticsSessionCacheStore {
  fetched: boolean;
  uid: string | null;
  records: ScanHistoryRecord[];
  computedByRange: Partial<Record<AnalyticsTimeRange, ComputedAnalyticsMetrics>>;
}

// Module-level singleton cache persisted across route navigations within the session
let memoryAnalyticsCache: AnalyticsSessionCacheStore | null = null;
let inflightHistoryPromise: Promise<ScanHistoryRecord[]> | null = null;

function readInitialCachedRecords(): ScanHistoryRecord[] {
  if (memoryAnalyticsCache?.records) {
    return memoryAnalyticsCache.records;
  }
  if (typeof window !== 'undefined') {
    try {
      const sessionRaw = sessionStorage.getItem(SESSION_STORAGE_CACHE_KEY);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (Array.isArray(parsed?.records)) {
          memoryAnalyticsCache = {
            fetched: Boolean(parsed.fetched),
            uid: parsed.uid || null,
            records: parsed.records,
            computedByRange: {},
          };
          return parsed.records;
        }
      }
    } catch {
      // ignore sessionStorage read errors
    }

    try {
      const localRaw = localStorage.getItem('freshnex_scan_history');
      if (localRaw) {
        const parsedLocal = JSON.parse(localRaw);
        if (Array.isArray(parsedLocal)) {
          return parsedLocal;
        }
      }
    } catch {
      // ignore localStorage read errors
    }
  }
  return DEFAULT_SCAN_HISTORY;
}

function persistSessionCache(uid: string | null, records: ScanHistoryRecord[], fetched: boolean) {
  memoryAnalyticsCache = {
    fetched,
    uid,
    records,
    computedByRange: {},
  };
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        SESSION_STORAGE_CACHE_KEY,
        JSON.stringify({
          fetched,
          uid,
          records,
          timestamp: Date.now(),
        })
      );
    } catch {
      // ignore storage quota errors
    }
  }
}

function computeAnalyticsForRange(
  scanHistory: ScanHistoryRecord[],
  timeRange: AnalyticsTimeRange
): ComputedAnalyticsMetrics {
  if (memoryAnalyticsCache?.computedByRange[timeRange]) {
    return memoryAnalyticsCache.computedByRange[timeRange]!;
  }

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

  const monthBuckets: MonthlyBucket[] = MONTHS.map((m) => ({
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

    const statusStr = String(s.status || '');
    const isFresh = statusStr === 'Fresh';
    const isRisk = statusStr === 'Warning' || statusStr === 'At Risk';
    const isExpired =
      statusStr === 'Expired' ||
      statusStr === 'Critical' ||
      statusStr === 'Unsafe' ||
      statusStr === 'Spoiled';

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
    const idUpper = (s.itemId || s.tagId || '').toUpperCase();
    if (nameLower.includes('apple') || idUpper.includes('APPLE') || idUpper.includes('001')) {
      appleCount++;
    } else if (nameLower.includes('milk') || idUpper.includes('MILK') || idUpper.includes('124')) {
      milkCount++;
    }
  }

  const freshPercent = filteredTotal > 0 ? Math.round((freshCount / filteredTotal) * 100) : 0;
  const atRiskPercent = filteredTotal > 0 ? Math.round((atRiskCount / filteredTotal) * 100) : 0;
  const expiredPercent = filteredTotal > 0 ? Math.round((expiredCount / filteredTotal) * 100) : 0;

  const dist: QualitySlice[] = [
    { name: 'Fresh', value: freshPercent, color: '#20E79A' },
    { name: 'At Risk', value: atRiskPercent, color: '#FFAA00' },
    { name: 'Expired', value: expiredPercent, color: '#FF5A67' },
  ];

  const pieData: QualitySlice[] =
    filteredTotal > 0
      ? dist.filter((q) => q.value > 0)
      : [{ name: 'Zero Scans', value: 1, color: '#E2E8F0' }];

  const appleRatio = filteredTotal > 0 ? Math.round((appleCount / filteredTotal) * 100) : 0;
  const milkRatio = filteredTotal > 0 ? Math.round((milkCount / filteredTotal) * 100) : 0;

  const categories: CategoryItem[] = [
    { name: 'Apples (Node 001)', count: appleCount, ratio: appleRatio, color: '#20E79A' },
    { name: 'Milk (Node 124)', count: milkCount, ratio: milkRatio, color: '#FFAA00' },
  ];

  const result: ComputedAnalyticsMetrics = {
    totalScans: filteredTotal,
    freshCount,
    atRiskCount,
    expiredCount,
    freshPercent,
    atRiskPercent,
    expiredPercent,
    monthlyTrends: monthBuckets,
    qualityDistribution: dist,
    pieChartData: pieData,
    categoryBreakdown: categories,
  };

  if (memoryAnalyticsCache) {
    memoryAnalyticsCache.computedByRange[timeRange] = result;
  }

  return result;
}

/**
 * Custom session-cached analytics hook:
 * - Reads cached scan records synchronously on first render (zero loading delay when navigating tabs).
 * - Fetches scan history from Firebase at most ONCE per session (decoupled from high-frequency live sensor context ticks).
 * - Memoizes and caches computed chart datasets per timeRange across route navigations.
 */
function useCachedAnalytics(timeRange: AnalyticsTimeRange, userUid?: string | null) {
  const [records, setRecords] = useState<ScanHistoryRecord[]>(() => readInitialCachedRecords());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchOnceOrRefresh = useCallback(
    async (forceRefresh = false) => {
      const targetUid = userUid || null;
      if (
        !forceRefresh &&
        memoryAnalyticsCache?.fetched &&
        memoryAnalyticsCache.uid === targetUid
      ) {
        return;
      }

      if (forceRefresh) {
        setIsRefreshing(true);
      }

      try {
        if (!inflightHistoryPromise || forceRefresh) {
          inflightHistoryPromise = FirebaseService.getScanHistory(targetUid || undefined);
        }
        const fetchedRecords = await inflightHistoryPromise;
        inflightHistoryPromise = null;

        const nextRecords =
          Array.isArray(fetchedRecords) && fetchedRecords.length > 0
            ? fetchedRecords
            : readInitialCachedRecords();

        persistSessionCache(targetUid, nextRecords, true);
        setRecords(nextRecords);
      } catch {
        inflightHistoryPromise = null;
        persistSessionCache(targetUid, records, true);
      } finally {
        if (forceRefresh) {
          setIsRefreshing(false);
        }
      }
    },
    [userUid, records]
  );

  useEffect(() => {
    fetchOnceOrRefresh(false);
  }, [fetchOnceOrRefresh]);

  const metrics = useMemo(
    () => computeAnalyticsForRange(records, timeRange),
    [records, timeRange]
  );

  return {
    metrics,
    isRefreshing,
    refreshAnalytics: () => fetchOnceOrRefresh(true),
  };
}

const MonthlyTrendsChartCard = React.memo<{
  monthlyTrends: MonthlyBucket[];
  totalScans: number;
}>(({ monthlyTrends, totalScans }) => (
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
));

const QualityDistributionCard = React.memo<{
  pieChartData: QualitySlice[];
  qualityDistribution: QualitySlice[];
  totalScans: number;
}>(({ pieChartData, qualityDistribution, totalScans }) => (
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
));

export const AnalyticsPage: React.FC = React.memo(() => {
  const { currentUser, userProfile } = useAuth();
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d');

  const { metrics, isRefreshing, refreshAnalytics } = useCachedAnalytics(
    timeRange,
    currentUser?.uid || userProfile?.uid
  );

  const {
    totalScans,
    freshCount,
    atRiskCount,
    expiredCount,
    freshPercent,
    atRiskPercent,
    expiredPercent,
    monthlyTrends,
    qualityDistribution,
    pieChartData,
    categoryBreakdown,
  } = metrics;

  const stats = useMemo(
    () => [
      {
        title: 'Total Scans',
        value: String(totalScans),
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
    ],
    [totalScans, freshCount, atRiskCount, expiredCount, freshPercent, atRiskPercent, expiredPercent]
  );

  return (
    <div className="space-y-6 select-none pb-12 font-sans">
      {/* Title & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif italic font-black text-[#07221A] tracking-tight flex items-center gap-2">
            <span>Analytics &amp; Insights</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#20E79A]/15 text-[#20E79A] border border-[#20E79A]/20">
              Session Cached
            </span>
          </h1>
          <p className="text-xs font-bold text-[#5C7F75] mt-1">
            Real-time telemetry analytics. All column metrics reflect actual recorded scans.
          </p>
        </div>

        {/* Time Range Selector + Manual Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 rounded-xl bg-[#F4F7F6] border border-[#13493B]/10">
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

          <button
            type="button"
            onClick={refreshAnalytics}
            disabled={isRefreshing}
            title="Refresh analytical data"
            className="p-2 rounded-xl bg-white border border-[#13493B]/10 text-[#07221A] hover:bg-[#F4F7F6] transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#13493B] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
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
        <MonthlyTrendsChartCard monthlyTrends={monthlyTrends} totalScans={totalScans} />
        <QualityDistributionCard
          pieChartData={pieChartData}
          qualityDistribution={qualityDistribution}
          totalScans={totalScans}
        />
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
});
