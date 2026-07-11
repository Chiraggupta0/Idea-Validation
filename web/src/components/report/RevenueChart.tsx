import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { RevenuePoint } from '../../lib/types'

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="neu p-5">
      <div className="mb-4 text-xs font-bold uppercase tracking-wide">Revenue forecast · FundIQ ($K)</div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a3dff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#4a3dff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="year" tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ border: '2px solid #141414', borderRadius: 8, fontSize: 12 }}
            formatter={((v: number) => [`$${v}K`, 'Revenue']) as never}
          />
          <Area type="monotone" dataKey="revenue" stroke="#4a3dff" strokeWidth={2.5} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
