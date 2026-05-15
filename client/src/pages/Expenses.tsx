import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

const CATEGORIES = ['餐饮', '交通', '住房', '娱乐', '购物', '其他'];

export default function Expenses() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [form, setForm] = useState({ amount: '', category: '餐饮', note: '', date: now.toISOString().slice(0, 10) });

  const { data: expenses } = useQuery({
    queryKey: ['expenses', selectedYear, selectedMonth],
    queryFn: () => api.get(`/expenses?month=${selectedMonth}&year=${selectedYear}`).then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['expenseStats', selectedYear, selectedMonth],
    queryFn: () => api.get(`/expenses/stats?month=${selectedMonth}&year=${selectedYear}`).then((r) => r.data),
  });

  const addExpense = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/expenses', { amount: parseFloat(data.amount), category: data.category, note: data.note || undefined, date: data.date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats'] });
      setForm({ amount: '', category: '餐饮', note: '', date: now.toISOString().slice(0, 10) });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenseStats'] });
    },
  });

  const categoryLabels: Record<string, string> = {
    '餐饮': '🍔', '交通': '🚗', '住房': '🏠', '娱乐': '🎮', '购物': '🛍️', '其他': '📦',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">月度支出</h2>

      {/* Month selector + total */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}月</option>
            ))}
          </select>
        </div>
        <div className="text-2xl font-bold text-orange-500">
          ¥{stats?.total?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Add form + list */}
        <div className="col-span-2 space-y-4">
          {/* Add form */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-4 gap-2">
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="金额" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{categoryLabels[c]} {c}</option>
                ))}
              </select>
              <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="备注（可选）" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <button onClick={() => addExpense.mutate(form)} disabled={!form.amount}
              className="w-full mt-2 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              添加支出
            </button>
          </div>

          {/* Expenses list */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {expenses?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">本月还没有支出记录</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-normal">日期</th>
                    <th className="pb-2 font-normal">类别</th>
                    <th className="pb-2 font-normal">备注</th>
                    <th className="pb-2 font-normal text-right">金额</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses?.map((e: any) => (
                    <tr key={e.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">{new Date(e.date).toLocaleDateString('zh-CN')}</td>
                      <td className="py-2">{categoryLabels[e.category]} {e.category}</td>
                      <td className="py-2 text-gray-400">{e.note || '-'}</td>
                      <td className="py-2 text-right font-medium text-gray-700">¥{e.amount.toFixed(2)}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => deleteExpense.mutate(e.id)}
                          className="text-gray-300 hover:text-red-500">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Category pie */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-800 mb-4">分类统计</h3>
            {!stats?.byCategory || Object.keys(stats.byCategory).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">暂无数据</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.byCategory).map(([cat, amount]: [string, any]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{categoryLabels[cat]} {cat}</span>
                      <span className="text-gray-700 font-medium">¥{amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${stats.total > 0 ? (amount / stats.total) * 100 : 0}%`,
                          backgroundColor: {
                            '餐饮': '#ef4444',
                            '交通': '#3b82f6',
                            '住房': '#22c55e',
                            '娱乐': '#f59e0b',
                            '购物': '#8b5cf6',
                            '其他': '#6b7280',
                          }[cat] || '#6366f1',
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700">合计</span>
                    <span className="text-orange-500">¥{stats.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
