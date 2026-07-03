import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/context/useAppStore';
import { formatCurrency } from '@/utils/formatCurrency';

const rangeLabels = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly'
};

const Analytics = () => {
  const analytics = useAppStore((state) => state.analytics);
  const analyticsLoading = useAppStore((state) => state.analyticsLoading);
  const loadAnalytics = useAppStore((state) => state.loadAnalytics);
  const [range, setRange] = useState('weekly');
  const [view, setView] = useState('chart');
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    loadAnalytics(range);
    setSelectedPoint(null);
  }, [loadAnalytics, range]);

  const stats = analytics?.analyticsData || {};
  const salesData = analytics?.dailySalesData || [];

  const displayData = useMemo(() => {
    if (range !== 'monthly') {
      return salesData.map((item) => ({
        ...item,
        label: item.date
      }));
    }

    return Array.from({ length: 4 }, (_, weekIndex) => {
      const start = weekIndex * 7;
      const chunk = salesData.slice(start, start + 7);
      const sales = chunk.reduce((sum, item) => sum + Number(item.sales || 0), 0);
      const revenue = chunk.reduce((sum, item) => sum + Number(item.revenue || 0), 0);

      return {
        date: `Week ${weekIndex + 1}`,
        label: `Week ${weekIndex + 1}`,
        sales,
        revenue,
        sourceDays: chunk.map((item) => item.date)
      };
    });
  }, [range, salesData]);

  const chart = useMemo(() => {
    const width = 980;
    const height = 360;
    const padX = 44;
    const padY = 28;
    const maxSales = Math.max(1, ...displayData.map((day) => Number(day.sales || 0)));
    const maxRevenue = Math.max(1, ...displayData.map((day) => Number(day.revenue || 0)));
    const xStep = displayData.length > 1 ? (width - padX * 2) / (displayData.length - 1) : 0;

    const points = displayData.map((day, index) => {
      const x = padX + index * xStep;
      const salesY = padY + (height - padY * 2) * (1 - Number(day.sales || 0) / maxSales);
      const revenueY = padY + (height - padY * 2) * (1 - Number(day.revenue || 0) / maxRevenue);
      return { ...day, x, salesY, revenueY };
    });

    const salesPoints = points.map((point) => `${point.x},${point.salesY}`).join(' ');
    const revenuePoints = points.map((point) => `${point.x},${point.revenueY}`).join(' ');

    return { width, height, padX, padY, maxSales, maxRevenue, points, salesPoints, revenuePoints };
  }, [displayData]);

  const rangeSubtitle = useMemo(() => {
    if (range === 'yearly') return 'Monthly performance across the last 12 months';
    if (range === 'monthly') return 'Weekly performance across the last 30 days';
    return 'Daily performance across the last 7 days';
  }, [range]);

  const chartTitle = useMemo(() => {
    if (range === 'yearly') return 'Yearly view';
    if (range === 'monthly') return 'Monthly view';
    return 'Weekly view';
  }, [range]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="rounded-[2rem] bg-[linear-gradient(135deg,#7a5af8_0%,#b46ff7_52%,#ff7aa8_100%)] p-8 text-white shadow-[0_24px_80px_rgba(109,77,242,0.25)]">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">Analytics</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Track sales and store activity.</h1>
        <p className="mt-4 max-w-2xl text-white/80">A quick overview of users, products, revenue, and sales trends.</p>
      </div>

      {analyticsLoading ? (
        <div className="mt-6 rounded-[1.5rem] border border-white/70 bg-white p-6 text-ink">Loading analytics...</div>
      ) : (
        <>
      <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Users</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            {stats.users ?? 0}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Products</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            {stats.products ?? 0}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Sales</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            {stats.totalSales ?? 0}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
          <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Revenue</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-ink">
            {formatCurrency(stats.totalRevenue ?? 0)}
          </p>
        </div>
      </section>

          <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Sales trend</p>
                <h2 className="text-2xl font-black text-ink">{chartTitle}</h2>
                <p className="mt-1 text-sm text-ink/55">{rangeSubtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-full bg-paper p-1 text-sm text-ink/70">
                {Object.entries(rangeLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRange(key)}
                    className={`rounded-full px-4 py-2 font-semibold transition ${
                      range === key ? 'bg-[#6d4df2] text-white shadow' : 'hover:bg-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setView('chart')}
                  className={`rounded-full px-4 py-2 font-semibold transition ${
                    view === 'chart' ? 'bg-[#6d4df2] text-white shadow' : 'hover:bg-white'
                  }`}
                >
                  Chart
                </button>
                <button
                  type="button"
                  onClick={() => setView('table')}
                  className={`rounded-full px-4 py-2 font-semibold transition ${
                    view === 'table' ? 'bg-[#6d4df2] text-white shadow' : 'hover:bg-white'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {displayData.length === 0 ? (
              <p className="rounded-2xl bg-paper px-4 py-3 text-ink/60">No sales data yet.</p>
            ) : (
              <>
                {view === 'chart' ? (
                  <div className="rounded-[1.75rem] bg-[#0f172a] p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-[#34d399]" />
                          Sales line
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-[#60a5fa]" />
                          Revenue line
                        </span>
                      </div>
                      <div className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
                        Click a point
                      </div>
                    </div>

                    {selectedPoint ? (
                      <div className="mb-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Period</p>
                          <p className="mt-1 font-semibold text-white">{selectedPoint.label || selectedPoint.date}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Sales</p>
                          <p className="mt-1 font-semibold text-[#34d399]">{selectedPoint.sales} orders</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Revenue</p>
                          <p className="mt-1 font-semibold text-[#60a5fa]">{formatCurrency(selectedPoint.revenue)}</p>
                        </div>
                      </div>
                    ) : null}

                    <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-[360px] w-full overflow-visible">
                      <defs>
                        <linearGradient id="salesLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                        <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                      </defs>

                      {[0.25, 0.5, 0.75].map((ratio) => (
                        <line
                          key={ratio}
                          x1={chart.padX}
                          x2={chart.width - chart.padX}
                          y1={chart.padY + (chart.height - chart.padY * 2) * ratio}
                          y2={chart.padY + (chart.height - chart.padY * 2) * ratio}
                          stroke="rgba(255,255,255,0.08)"
                          strokeDasharray="5 7"
                        />
                      ))}

                      <line x1={chart.padX} x2={chart.padX} y1={chart.padY} y2={chart.height - chart.padY} stroke="rgba(255,255,255,0.14)" />
                      <line x1={chart.padX} x2={chart.width - chart.padX} y1={chart.height - chart.padY} y2={chart.height - chart.padY} stroke="rgba(255,255,255,0.14)" />

                      <polyline
                        fill="none"
                        stroke="url(#salesLine)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={chart.salesPoints}
                      />
                      <polyline
                        fill="none"
                        stroke="url(#revenueLine)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={chart.revenuePoints}
                      />

                      {chart.points.map((point) => (
                        <g key={point.label || point.date}>
                          <circle
                            cx={point.x}
                            cy={point.salesY}
                            r={selectedPoint?.label === point.label ? 8 : 5}
                            fill="#34d399"
                            className="cursor-pointer"
                            onClick={() => setSelectedPoint(point)}
                          />
                          <circle
                            cx={point.x}
                            cy={point.revenueY}
                            r={selectedPoint?.label === point.label ? 8 : 5}
                            fill="#60a5fa"
                            className="cursor-pointer"
                            onClick={() => setSelectedPoint(point)}
                          />
                          <text x={point.x} y={chart.height - 6} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="12">
                            {point.label || point.date}
                          </text>
                        </g>
                      ))}
                    </svg>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                      <p>Click any point to pin the totals for that period.</p>
                      {selectedPoint ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPoint(null)}
                          className="rounded-full bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/15"
                        >
                          Clear selection
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayData.map((day) => (
                      <button
                        key={day.label || day.date}
                        type="button"
                        onClick={() => setSelectedPoint(day)}
                        className={`w-full rounded-2xl bg-paper px-4 py-3 text-left transition hover:bg-white ${
                          selectedPoint?.label === day.label ? 'ring-2 ring-[#6d4df2]' : ''
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-ink">{day.label || day.date}</p>
                            {range === 'monthly' && day.sourceDays?.length ? (
                              <p className="mt-1 text-xs text-ink/50">
                                {day.sourceDays[0]} to {day.sourceDays[day.sourceDays.length - 1]}
                              </p>
                            ) : null}
                            <p className="text-sm text-ink/60">{day.sales} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-ink">{formatCurrency(day.revenue)}</p>
                            <p className="text-xs uppercase tracking-[0.25em] text-ink/45">Revenue</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-ink/45">
                  <span className="rounded-full bg-paper px-3 py-2">
                    {range === 'weekly' ? 'Days under chart' : range === 'monthly' ? 'Week 1 to Week 4 under chart' : 'Months under chart'}
                  </span>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;
