import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

const COLORS = ['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function Countdown() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', targetDate: '', type: 'countdown', color: COLORS[0] });

  const { data: countdowns } = useQuery({
    queryKey: ['countdowns'],
    queryFn: () => api.get('/countdowns').then((r) => r.data),
    refetchInterval: 30000,
  });

  const addCountdown = useMutation({
    mutationFn: (data: typeof form) => api.post('/countdowns', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
      setForm({ title: '', targetDate: '', type: 'countdown', color: COLORS[0] });
    },
  });

  const deleteCountdown = useMutation({
    mutationFn: (id: string) => api.delete(`/countdowns/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['countdowns'] }),
  });

  function getCountdownInfo(targetDate: string, type: string) {
    const now = Date.now();
    const target = new Date(targetDate).getTime();
    const diff = target - now;
    const absDays = Math.floor(Math.abs(diff) / 86400000);
    const absHours = Math.floor((Math.abs(diff) % 86400000) / 3600000);
    const absMinutes = Math.floor((Math.abs(diff) % 3600000) / 60000);
    const absSeconds = Math.floor((Math.abs(diff) % 60000) / 1000);

    if (type === 'countup') {
      return {
        label: '已过去',
        display: `${absDays}天 ${absHours}时 ${absMinutes}分 ${absSeconds}秒`,
        days: absDays,
        isPast: false,
      };
    }
    if (diff < 0) {
      return { label: '已过去', display: `${absDays}天`, days: absDays, isPast: true };
    }
    if (diff < 86400000) {
      return {
        label: '即将到来',
        display: `${absHours}时 ${absMinutes}分 ${absSeconds}秒`,
        days: 0,
        isPast: false,
      };
    }
    return { label: `还有 ${absDays} 天`, display: '', days: absDays, isPast: false };
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">倒计时 & 正计时</h2>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="space-y-3">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="事件名称" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <div className="flex gap-3">
            <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="countdown">倒计时</option>
              <option value="countup">正计时</option>
            </select>
          </div>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })}
                className="w-8 h-8 rounded-full border-2 transition-transform"
                style={{ backgroundColor: c, borderColor: form.color === c ? '#1f2937' : c, transform: form.color === c ? 'scale(1.2)' : '' }}
              />
            ))}
          </div>
          <button onClick={() => addCountdown.mutate(form)} disabled={!form.title || !form.targetDate}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
            添加
          </button>
        </div>
      </div>

      {/* Countdown list */}
      <div className="space-y-4">
        {countdowns?.map((cd: any) => {
          const info = getCountdownInfo(cd.targetDate, cd.type);
          return (
            <div key={cd.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-3 h-12 rounded-full" style={{ backgroundColor: cd.color || COLORS[0] }} />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{cd.title}</h4>
                <p className="text-xs text-gray-400">{new Date(cd.targetDate).toLocaleDateString('zh-CN')}</p>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${info.isPast ? 'text-gray-400' : info.days <= 7 && cd.type === 'countdown' ? 'text-red-500' : 'text-indigo-600'}`}>
                  {info.display || info.label}
                </div>
                <div className="text-xs text-gray-400">{cd.type === 'countdown' ? '倒计时' : '正计时'}</div>
              </div>
              <button onClick={() => deleteCountdown.mutate(cd.id)}
                className="text-gray-300 hover:text-red-500 transition-colors">
                🗑️
              </button>
            </div>
          );
        })}
        {countdowns?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">还没有重要日，添加一个吧</p>
        )}
      </div>
    </div>
  );
}
