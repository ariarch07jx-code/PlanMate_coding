import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data: friends } = useQuery({
    queryKey: ['friends'],
    queryFn: () => api.get('/friends').then((r) => r.data),
  });

  const { data: requests } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => api.get('/friends/requests').then((r) => r.data),
  });

  const sendRequest = useMutation({
    mutationFn: (receiverId: string) => api.post('/friends/request', { receiverId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });

  const handleRequest = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/friends/request/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const removeFriend = useMutation({
    mutationFn: (userId: string) => api.delete(`/friends/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const { data } = await api.get(`/users/search?q=${searchQuery}`);
    setSearchResults(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">好友</h2>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索用户名..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            搜索
          </button>
        </div>
        {searchResults.length > 0 && (
          <ul className="mt-3 space-y-2">
            {searchResults.map((u: any) => (
              <li key={u.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <Link to={`/profile/${u.id}`} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{u.username}</span>
                </Link>
                <button onClick={() => sendRequest.mutate(u.id)}
                  className="px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100">
                  加好友
                </button>
              </li>
            ))}
          </ul>
        )}
        {searchResults.length === 0 && searchQuery && (
          <p className="text-sm text-gray-400 mt-3">未找到用户</p>
        )}
      </div>

      {/* Friend requests */}
      {requests?.incoming?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium text-gray-800 mb-3">好友请求 ({requests.incoming.length})</h3>
          <ul className="space-y-3">
            {requests.incoming.map((req: any) => (
              <li key={req.id} className="flex items-center justify-between">
                <Link to={`/profile/${req.sender.id}`} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
                    {req.sender.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{req.sender.username}</span>
                </Link>
                <div className="flex gap-2">
                  <button onClick={() => handleRequest.mutate({ id: req.id, status: 'accepted' })}
                    className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-full hover:bg-green-100">
                    接受
                  </button>
                  <button onClick={() => handleRequest.mutate({ id: req.id, status: 'rejected' })}
                    className="px-3 py-1 text-xs bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100">
                    拒绝
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Friend list */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-medium text-gray-800 mb-3">我的好友 ({friends?.length || 0})</h3>
        {friends?.length === 0 ? (
          <p className="text-sm text-gray-400">还没有好友，去搜索添加吧</p>
        ) : (
          <ul className="space-y-3">
            {friends?.map((f: any) => (
              <li key={f.id} className="flex items-center justify-between">
                <Link to={`/profile/${f.id}`} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
                    {f.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{f.username}</span>
                  {f.bio && <span className="text-xs text-gray-400">- {f.bio.slice(0, 20)}</span>}
                </Link>
                <button onClick={() => removeFriend.mutate(f.id)}
                  className="px-3 py-1 text-xs text-red-500 hover:bg-red-50 rounded-full">
                  删除好友
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
