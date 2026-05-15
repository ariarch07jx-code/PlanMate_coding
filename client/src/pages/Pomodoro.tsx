import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';


const WORK_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;

type TimerMode = 'work' | 'short_break' | 'long_break';

export default function Pomodoro() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['pomodoroStats'],
    queryFn: () => api.get('/pomodoro/stats').then((r) => r.data),
  });

  const startTimer = useCallback(() => {
    if (!('Notification' in window)) return;
    Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setRunning(false);
      const duration = mode === 'work' ? 25 : mode === 'short_break' ? 5 : 15;
      api.post('/pomodoro/sessions', {
        duration,
        type: mode,
        task: mode === 'work' ? task : null,
        completed: true,
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['pomodoroStats'] });
      });

      if (mode === 'work') {
        const newCount = sessionCount + 1;
        setSessionCount(newCount);
        setMode(newCount % 4 === 0 ? 'long_break' : 'short_break');
        setTimeLeft(newCount % 4 === 0 ? LONG_BREAK : SHORT_BREAK);
      } else {
        setMode('work');
        setTimeLeft(WORK_TIME);
        setTask('');
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('番茄钟', {
          body: mode === 'work' ? '工作时间结束！休息一下吧' : '休息时间结束！开始工作吧',
        });
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, timeLeft, mode, sessionCount, task, queryClient]);

  const toggleTimer = () => {
    if (!running) startTimer();
    setRunning(!running);
  };

  const resetTimer = () => {
    setRunning(false);
    if (mode === 'work') setTimeLeft(WORK_TIME);
    else if (mode === 'short_break') setTimeLeft(SHORT_BREAK);
    else setTimeLeft(LONG_BREAK);
  };

  const switchMode = (m: TimerMode) => {
    setRunning(false);
    setMode(m);
    if (m === 'work') setTimeLeft(WORK_TIME);
    else if (m === 'short_break') setTimeLeft(SHORT_BREAK);
    else setTimeLeft(LONG_BREAK);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = mode === 'work'
    ? ((WORK_TIME - timeLeft) / WORK_TIME) * 100
    : mode === 'short_break'
      ? ((SHORT_BREAK - timeLeft) / SHORT_BREAK) * 100
      : ((LONG_BREAK - timeLeft) / LONG_BREAK) * 100;

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">番茄钟</h2>

      {/* Mode switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-8">
        {[
          { key: 'work' as TimerMode, label: '工作', color: 'bg-white shadow text-red-500' },
          { key: 'short_break' as TimerMode, label: '短休息', color: 'bg-white shadow text-green-500' },
          { key: 'long_break' as TimerMode, label: '长休息', color: 'bg-white shadow text-blue-500' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => switchMode(m.key)}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              mode === m.key ? m.color : 'text-gray-500'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer circle */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
          <circle cx="128" cy="128" r="112" fill="none" stroke="#e5e7eb" strokeWidth="12" />
          <circle cx="128" cy="128" r="112" fill="none"
            stroke={mode === 'work' ? '#ef4444' : mode === 'short_break' ? '#22c55e' : '#3b82f6'}
            strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 112}`}
            strokeDashoffset={`${2 * Math.PI * 112 * (1 - progress / 100)}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold text-gray-800">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-sm text-gray-400 mt-1">
            {mode === 'work' ? '专注工作' : mode === 'short_break' ? '短休息' : '长休息'}
          </span>
        </div>
      </div>

      {/* Task input */}
      {mode === 'work' && (
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="当前任务（可选）..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center mb-8">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-xl font-medium text-white transition-colors ${
            running ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {running ? '暂停' : '开始'}
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          重置
        </button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-medium text-gray-800 mb-3">今日统计</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-500">{stats?.todayWorkCount || 0}</div>
            <div className="text-xs text-gray-400">完成次数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600">{stats?.todayWorkMinutes || 0}</div>
            <div className="text-xs text-gray-400">专注分钟</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats?.totalWorkCount || 0}</div>
            <div className="text-xs text-gray-400">总计次数</div>
          </div>
        </div>
      </div>
    </div>
  );
}
