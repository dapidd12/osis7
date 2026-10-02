import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  PieChart as PieIcon, BarChart3, TrendingUp, ShieldAlert, 
  MessageSquare, UserCheck, UserX, Lightbulb, AlertTriangle, 
  HelpCircle, MessageCircle, CheckCircle2, Clock, Sparkles
} from 'lucide-react';
import { Aspiration, AspirationCategory } from '../../types';
import { cn } from '../../lib/utils';
import { format, subDays, isSameDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface AdminProfessionalChartsProps {
  aspirations: Aspiration[];
}

export default function AdminProfessionalCharts({ aspirations }: AdminProfessionalChartsProps) {
  const [activeChartTab, setActiveChartTab] = useState<'category' | 'status' | 'timeline'>('category');

  // 1. Category Data
  const { categoryData, categoryStats } = useMemo(() => {
    const counts: Record<AspirationCategory, number> = {
      Saran: 0,
      Kritik: 0,
      Pertanyaan: 0,
      Lainnya: 0
    };

    aspirations.forEach(a => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      } else {
        counts.Lainnya++;
      }
    });

    const colors: Record<AspirationCategory, string> = {
      Saran: '#0284c7', // Sky 600
      Kritik: '#f59e0b', // Amber 500
      Pertanyaan: '#10b981', // Emerald 500
      Lainnya: '#8b5cf6' // Violet 500
    };

    const icons: Record<AspirationCategory, React.ElementType> = {
      Saran: Lightbulb,
      Kritik: AlertTriangle,
      Pertanyaan: HelpCircle,
      Lainnya: MessageCircle
    };

    const total = aspirations.length || 1;
    const data = (Object.keys(counts) as AspirationCategory[]).map(cat => ({
      name: cat,
      value: counts[cat],
      percentage: Math.round((counts[cat] / total) * 100),
      color: colors[cat],
      icon: icons[cat]
    }));

    return { categoryData: data, categoryStats: counts };
  }, [aspirations]);

  // 2. Status & Response Data
  const statusData = useMemo(() => {
    const pending = aspirations.filter(a => a.status === 'Pending').length;
    const approved = aspirations.filter(a => a.status === 'Approved').length;
    const rejected = aspirations.filter(a => a.status === 'Rejected').length;
    const responded = aspirations.filter(a => a.status === 'Approved' && !!a.response?.trim()).length;
    const unresponded = approved - responded;

    return [
      { name: 'Pending', jumlah: pending, fill: '#f59e0b' },
      { name: 'Disetujui', jumlah: approved, fill: '#10b981' },
      { name: 'Sudah Dibalas', jumlah: responded, fill: '#0284c7' },
      { name: 'Belum Dibalas', jumlah: unresponded, fill: '#64748b' },
      { name: 'Ditolak', jumlah: rejected, fill: '#f43f5e' }
    ];
  }, [aspirations]);

  // 3. 7-Day Timeline Trend Data
  const timelineData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        dateObj: d,
        displayDate: format(d, 'EEE, d MMM', { locale: localeId }),
        shortDay: format(d, 'EEE', { locale: localeId }),
        total: 0,
        approved: 0
      };
    });

    aspirations.forEach(a => {
      try {
        const itemDate = new Date(a.createdAt);
        last7Days.forEach(day => {
          if (isSameDay(itemDate, day.dateObj)) {
            day.total++;
            if (a.status === 'Approved') {
              day.approved++;
            }
          }
        });
      } catch (e) {}
    });

    return last7Days.map(d => ({
      name: d.shortDay,
      fullDate: d.displayDate,
      'Aspirasi Masuk': d.total,
      'Disetujui': d.approved
    }));
  }, [aspirations]);

  // Key KPI Highlights
  const totalApproved = aspirations.filter(a => a.status === 'Approved').length;
  const totalResponded = aspirations.filter(a => a.status === 'Approved' && !!a.response?.trim()).length;
  const responseRate = totalApproved > 0 ? Math.round((totalResponded / totalApproved) * 100) : 0;

  const totalAnonymous = aspirations.filter(a => a.isAnonymous).length;
  const anonymousRate = aspirations.length > 0 ? Math.round((totalAnonymous / aspirations.length) * 100) : 0;

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[130px]">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label || payload[0]?.name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-black text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Top Header & Chart Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Analisis & Statistik Aspirasi
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualisasi komprehensif demografi kategori suara siswa, status verifikasi, dan performa tanggapan OSIS.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveChartTab('category')}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeChartTab === 'category'
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <PieIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Kategori Donut</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('status')}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeChartTab === 'status'
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Status Verifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveChartTab('timeline')}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
              activeChartTab === 'timeline'
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tren 7 Hari</span>
          </button>
        </div>
      </div>

      {/* KPI Performance Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Response Rate */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tingkat Respons OSIS</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{responseRate}%</span>
              <span className="text-xs text-slate-500 font-medium">({totalResponded}/{totalApproved} disetujui)</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Anonymous Rate */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aspirasi Anonim</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">{anonymousRate}%</span>
              <span className="text-xs text-slate-500 font-medium">({totalAnonymous} dari {aspirations.length} pesan)</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Dominant Category */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Topik Terbanyak</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                {categoryData.reduce((prev, curr) => curr.value > prev.value ? curr : prev, categoryData[0])?.name || 'Saran'}
              </span>
              <span className="text-xs text-slate-500 font-medium">paling sering disuarakan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="pt-2">
        {aspirations.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-200/70">
            <PieIcon className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Data Statistik</p>
            <p className="text-xs text-slate-400 mt-0.5">Grafik akan otomatis terisi saat siswa mulai mengirimkan aspirasi.</p>
          </div>
        ) : (
          <>
            {/* View 1: Category Donut Chart */}
            {activeChartTab === 'category' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 h-72 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Metric */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900 leading-none">{aspirations.length}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Aspirasi</span>
                  </div>
                </div>

                {/* Category Cards Legend */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  {categoryData.map(item => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={item.name}
                        className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: item.color }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-500">{item.percentage}%</span>
                        </div>
                        <p className="text-xs font-bold text-slate-900">{item.name}</p>
                        <p className="text-lg font-black text-slate-800 mt-0.5">{item.value} <span className="text-xs font-normal text-slate-400">suara</span></p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View 2: Status Bar Chart */}
            {activeChartTab === 'status' && (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="jumlah" radius={[10, 10, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`status-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* View 3: 7-Day Trend Area Chart */}
            {activeChartTab === 'timeline' && (
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area 
                      type="monotone" 
                      dataKey="Aspirasi Masuk" 
                      stroke="#0284c7" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Disetujui" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorApproved)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
