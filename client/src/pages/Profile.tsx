import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Profile() {
  const { id } = useParams();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data),
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">加载中...</div>;
  if (!profile) return <div className="text-center py-12 text-gray-500">用户不存在</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-6">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 mx-auto mb-4">
          {profile.username?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{profile.username}</h2>
        {profile.bio && <p className="text-gray-500 mt-2">{profile.bio}</p>}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(profile.createdAt).toLocaleDateString('zh-CN')} 加入
        </p>
        {profile.isFriend && (
          <span className="inline-block mt-2 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">好友</span>
        )}
      </div>

      {/* Public daily plans */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-medium text-gray-800 mb-4">今日计划</h3>
        {profile.dailyPlans?.length === 0 ? (
          <p className="text-sm text-gray-400">今天还没有计划</p>
        ) : (
          <ul className="space-y-2">
            {profile.dailyPlans?.map((plan: any) => (
              <li key={plan.id} className="flex items-center gap-2 text-sm">
                <span>{plan.completed ? '✅' : '⬜'}</span>
                <span className={plan.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                  {plan.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Public phase plans */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-800 mb-4">阶段计划</h3>
        {profile.phasePlans?.length === 0 ? (
          <p className="text-sm text-gray-400">没有进行中的阶段计划</p>
        ) : (
          <div className="space-y-4">
            {profile.phasePlans?.map((plan: any) => (
              <div key={plan.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">{plan.title}</h4>
                  <span className="text-sm text-indigo-600">{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${plan.progress}%` }} />
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{new Date(plan.startDate).toLocaleDateString('zh-CN')}</span>
                  <span>→</span>
                  <span>{new Date(plan.endDate).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
