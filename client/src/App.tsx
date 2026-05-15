import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyProfile from './pages/MyProfile';
import Plans from './pages/Plans';
import Pomodoro from './pages/Pomodoro';
import Countdown from './pages/Countdown';
import Expenses from './pages/Expenses';
import Friends from './pages/Friends';

const queryClient = new QueryClient();

function AuthInit({ children }: { children: React.ReactNode }) {
  const { fetchUser, loading } = useAuth();

  useEffect(() => { fetchUser(); }, [fetchUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInit>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/me" element={<MyProfile />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/pomodoro" element={<Pomodoro />} />
              <Route path="/countdown" element={<Countdown />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/friends" element={<Friends />} />
            </Route>
          </Routes>
        </AuthInit>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
