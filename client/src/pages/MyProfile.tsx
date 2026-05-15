import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';

export default function MyProfile() {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { data } = await api.put('/users/me', { username, bio });
      useAuth.setState({ user: data });
      setMsg('保存成功');
    } catch {
      setMsg('保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">编辑资料</h2>
        {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{msg}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">个人介绍</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input type="email" value={user?.email} disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {saving ? '保存中...' : '保存'}
          </button>
        </form>
      </div>
    </div>
  );
}
