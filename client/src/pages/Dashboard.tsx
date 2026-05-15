import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: dailyPlans } = useQuery({
    queryKey: ['dailyPlans', new Date().toISOString().slice(0, 10)],
    queryFn: () => api.get('/plans/daily').then((r) => r.data),
  });

  const { data: phasePlans } = useQuery({
    queryKey: ['phasePlans'],
    queryFn: () => api.get('/plans/phase').then((r) => r.data),
  });

  const { data: countdowns } = useQuery({
    queryKey: ['countdowns'],
    queryFn: () => api.get('/countdowns').then((r) => r.data),
  });

  const { data: pomodoroStats } = useQuery({
    queryKey: ['pomodoroStats'],
    queryFn: () => api.get('/pomodoro/stats').then((r) => r.data),
  });

  const now = new Date();
  const { data: expenses } = useQuery({
    queryKey: ['expenses', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => api.get(`/expenses?month=${now.getMonth() + 1}&year=${now.getFullYear()}`).then((r) => r.data),
  });

  const completedToday = dailyPlans?.filter((p: any) => p.completed).length || 0;
  const totalToday = dailyPlans?.length || 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">欢迎回来，{user?.username}</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">今日计划</div>
          <div className="text-2xl font-bold text-indigo-600">
            {completedToday}/{totalToday}
          </div>
          <div className="text-xs text-gray-400 mt-1">已完成/总计</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">今日番茄</div>
          <div className="text-2xl font-bold text-red-500">
            {pomodoroStats?.todayWorkCount || 0}
          </div>
          <div className="text-xs text-gray-400 mt-1">{pomodoroStats?.todayWorkMinutes || 0} 分钟</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">进行中阶段计划</div>
          <div className="text-2xl font-bold text-green-600">
            {phasePlans?.filter((p: any) => p.progress < 100).length || 0}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">本月支出</div>
          <div className="text-2xl font-bold text-orange-500">
            ¥{expenses?.reduce((s: number, e: any) => s + e.amount, 0).toFixed(0) || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Today's plans */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">今日计划</h3>
            <Link to="/plans" className="text-sm text-indigo-600 hover:underline">查看全部</Link>
          </div>
          {totalToday === 0 ? (
            <p className="text-sm text-gray-400">今天还没有计划，去添加一个吧</p>
          ) : (
            <ul className="space-y-2">
              {dailyPlans?.slice(0, 5).map((plan: any) => (
                <li key={plan.id} className="flex items-center gap-2 text-sm">
                  <span className={plan.completed ? 'text-green-500' : 'text-gray-300'}>
                    {plan.completed ? '✅' : '⬜'}
                  </span>
                  <span className={plan.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                    {plan.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Countdowns */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">重要日</h3>
            <Link to="/countdown" className="text-sm text-indigo-600 hover:underline">查看全部</Link>
          </div>
          {!countdowns?.length ? (
            <p className="text-sm text-gray-400">还没有重要日，去添加吧</p>
          ) : (
            <ul className="space-y-3">
              {countdowns?.slice(0, 3).map((cd: any) => {
                const days = Math.ceil((new Date(cd.targetDate).getTime() - Date.now()) / 86400000);
                return (
                  <li key={cd.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{cd.title}</span>
                    <span className={`text-sm font-medium ${cd.type === 'countup' ? 'text-green-600' : days < 0 ? 'text-gray-400' : days <= 7 ? 'text-red-500' : 'text-indigo-600'}`}>
                      {cd.type === 'countup' ? `${Math.abs(days)} 天` : days < 0 ? '已过去' : `还有 ${days} 天`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
