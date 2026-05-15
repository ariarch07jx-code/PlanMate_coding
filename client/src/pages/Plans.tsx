import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

export default function Plans() {
  const [tab, setTab] = useState<'daily' | 'monthly' | 'phase'>('daily');
  const [newTitle, setNewTitle] = useState('');
  const queryClient = useQueryClient();

  const today = new Date().toISOString().slice(0, 10);
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [selectedYear, setSelectedYear] = useState(year);

  const { data: dailyPlans } = useQuery({
    queryKey: ['dailyPlans', today],
    queryFn: () => api.get(`/plans/daily?date=${today}`).then((r) => r.data),
  });

  const { data: monthlyPlans } = useQuery({
    queryKey: ['monthlyPlans', selectedYear, selectedMonth],
    queryFn: () => api.get(`/plans/monthly?year=${selectedYear}&month=${selectedMonth}`).then((r) => r.data),
  });

  const { data: phasePlans } = useQuery({
    queryKey: ['phasePlans'],
    queryFn: () => api.get('/plans/phase').then((r) => r.data),
  });

  const addDaily = useMutation({
    mutationFn: (title: string) => api.post('/plans/daily', { title, date: today }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPlans'] });
      setNewTitle('');
    },
  });

  const toggleDaily = useMutation({
    mutationFn: (plan: any) => api.put(`/plans/daily/${plan.id}`, { completed: !plan.completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dailyPlans'] }),
  });

  const deleteDaily = useMutation({
    mutationFn: (id: string) => api.delete(`/plans/daily/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dailyPlans'] }),
  });

  const addMonthly = useMutation({
    mutationFn: (title: string) => api.post('/plans/monthly', { title, month: selectedMonth, year: selectedYear }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyPlans'] });
      setNewTitle('');
    },
  });

  const toggleMonthly = useMutation({
    mutationFn: (plan: any) => api.put(`/plans/monthly/${plan.id}`, { completed: !plan.completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyPlans'] }),
  });

  const deleteMonthly = useMutation({
    mutationFn: (id: string) => api.delete(`/plans/monthly/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyPlans'] }),
  });

  const [phaseForm, setPhaseForm] = useState({ title: '', description: '', startDate: '', endDate: '' });
  const addPhase = useMutation({
    mutationFn: (data: typeof phaseForm) => api.post('/plans/phase', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phasePlans'] });
      setPhaseForm({ title: '', description: '', startDate: '', endDate: '' });
    },
  });

  const deletePhase = useMutation({
    mutationFn: (id: string) => api.delete(`/plans/phase/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phasePlans'] }),
  });

  const [taskTitle, setTaskTitle] = useState<Record<string, string>>({});
  const addTask = useMutation({
    mutationFn: ({ phaseId, title }: { phaseId: string; title: string }) =>
      api.post(`/plans/phase/${phaseId}/tasks`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phasePlans'] });
      setTaskTitle({});
    },
  });

  const toggleTask = useMutation({
    mutationFn: ({ phaseId, task }: { phaseId: string; task: any }) =>
      api.put(`/plans/phase/${phaseId}/tasks/${task.id}`, { completed: !task.completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phasePlans'] }),
  });

  const deleteTask = useMutation({
    mutationFn: ({ phaseId, taskId }: { phaseId: string; taskId: string }) =>
      api.delete(`/plans/phase/${phaseId}/tasks/${taskId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phasePlans'] }),
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">计划管理</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
        {(['daily', 'monthly', 'phase'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              tab === t ? 'bg-white shadow text-indigo-600 font-medium' : 'text-gray-500'
            }`}
          >
            {t === 'daily' ? '每日计划' : t === 'monthly' ? '每月计划' : '阶段计划'}
          </button>
        ))}
      </div>

      {/* Add form */}
      {tab !== 'phase' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newTitle.trim()) return;
            tab === 'daily' ? addDaily.mutate(newTitle) : addMonthly.mutate(newTitle);
          }}
          className="flex gap-2 mb-4"
        >
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={tab === 'daily' ? '添加今日计划...' : '添加月度计划...'}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            添加
          </button>
        </form>
      )}

      {/* Monthly selector */}
      {tab === 'monthly' && (
        <div className="flex gap-2 mb-4">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {[year - 1, year, year + 1].map((y) => (
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
      )}

      {/* Daily plans list */}
      {tab === 'daily' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {dailyPlans?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">今天还没有计划</p>
          ) : (
            <ul className="space-y-2">
              {dailyPlans?.map((plan: any) => (
                <li key={plan.id} className="flex items-center gap-3 group">
                  <button onClick={() => toggleDaily.mutate(plan)} className="text-lg">
                    {plan.completed ? '✅' : '⬜'}
                  </button>
                  <span className={`flex-1 text-sm ${plan.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {plan.title}
                  </span>
                  <button onClick={() => deleteDaily.mutate(plan.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-sm transition-opacity">
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Monthly plans list */}
      {tab === 'monthly' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {monthlyPlans?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">本月还没有计划</p>
          ) : (
            <ul className="space-y-2">
              {monthlyPlans?.map((plan: any) => (
                <li key={plan.id} className="flex items-center gap-3 group">
                  <button onClick={() => toggleMonthly.mutate(plan)} className="text-lg">
                    {plan.completed ? '✅' : '⬜'}
                  </button>
                  <span className={`flex-1 text-sm ${plan.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {plan.title}
                  </span>
                  <button onClick={() => deleteMonthly.mutate(plan.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-sm transition-opacity">
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Phase plans */}
      {tab === 'phase' && (
        <div className="space-y-4">
          {/* Phase plan form */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-800 mb-3">新建阶段计划</h3>
            <div className="space-y-3">
              <input type="text" value={phaseForm.title} onChange={(e) => setPhaseForm({ ...phaseForm, title: e.target.value })}
                placeholder="计划名称" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="text" value={phaseForm.description} onChange={(e) => setPhaseForm({ ...phaseForm, description: e.target.value })}
                placeholder="描述（可选）" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <div className="flex gap-3">
                <input type="date" value={phaseForm.startDate} onChange={(e) => setPhaseForm({ ...phaseForm, startDate: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="date" value={phaseForm.endDate} onChange={(e) => setPhaseForm({ ...phaseForm, endDate: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <button onClick={() => addPhase.mutate(phaseForm)} disabled={!phaseForm.title || !phaseForm.startDate || !phaseForm.endDate}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                创建阶段计划
              </button>
            </div>
          </div>

          {/* Phase plans list */}
          {phasePlans?.map((plan: any) => (
            <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{plan.title}</h4>
                  {plan.description && <p className="text-xs text-gray-400 mt-1">{plan.description}</p>}
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    <span>{new Date(plan.startDate).toLocaleDateString('zh-CN')} → {new Date(plan.endDate).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <button onClick={() => deletePhase.mutate(plan.id)}
                  className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${plan.progress}%` }} />
              </div>

              {/* Tasks */}
              <ul className="space-y-1 mb-3">
                {plan.tasks?.map((task: any) => (
                  <li key={task.id} className="flex items-center gap-2 text-sm group">
                    <button onClick={() => toggleTask.mutate({ phaseId: plan.id, task })}>
                      {task.completed ? '✅' : '⬜'}
                    </button>
                    <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                      {task.title}
                    </span>
                    <button onClick={() => deleteTask.mutate({ phaseId: plan.id, taskId: task.id })}
                      className="opacity-0 group-hover:opacity-100 text-red-400 text-xs">🗑️</button>
                  </li>
                ))}
              </ul>

              {/* Add task */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = taskTitle[plan.id];
                  if (!t?.trim()) return;
                  addTask.mutate({ phaseId: plan.id, title: t });
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={taskTitle[plan.id] || ''}
                  onChange={(e) => setTaskTitle({ ...taskTitle, [plan.id]: e.target.value })}
                  placeholder="添加子任务..."
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
                  添加
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
