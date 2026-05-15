import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function Landing() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-5xl font-bold mb-4">PlanMate</h1>
        <p className="text-xl text-indigo-100 mb-8">计划你的每一天，掌控你的人生</p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
            登录
          </Link>
          <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
            注册
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-left">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-medium mb-1">制定计划</h3>
            <p className="text-sm text-indigo-200">每日、每月、阶段性计划</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
            <div className="text-2xl mb-2">🍅</div>
            <h3 className="font-medium mb-1">番茄钟</h3>
            <p className="text-sm text-indigo-200">专注工作，高效执行</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-medium mb-1">管理支出</h3>
            <p className="text-sm text-indigo-200">记录每月花销</p>
          </div>
        </div>
      </div>
    </div>
  );
}
