import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { RouterProvider, useRouter, parsePath } from '@/router';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CreateInterviewPage } from '@/pages/CreateInterviewPage';
import { LobbyPage } from '@/pages/LobbyPage';
import { InterviewRoomPage } from '@/pages/InterviewRoomPage';
import { ReviewPage } from '@/pages/ReviewPage';
import { JoinPage } from '@/pages/JoinPage';
import { WaitingPage } from '@/pages/WaitingPage';

function Routes() {
  const { path, navigate } = useRouter();
  const { user } = useApp();
  const { segments, query } = parsePath(path);

  // Route: /join/:token — no auth required
  if (segments[0] === 'join' && segments[1]) {
    return <JoinPage inviteToken={segments[1]} />;
  }

  // Route: /waiting/:participantId — no auth required
  if (segments[0] === 'waiting' && segments[1]) {
    return <WaitingPage participantId={segments[1]} />;
  }

  // All other routes require auth
  if (!user) {
    return <LoginPage onAuthSuccess={() => navigate('/dashboard')} />;
  }

  // Route: /dashboard
  if (segments[0] === 'dashboard' || segments.length === 0) {
    return (
      <DashboardPage
        onCreateInterview={() => navigate('/create')}
        onOpenInterview={(id) => navigate(`/lobby/${id}`)}
      />
    );
  }

  // Route: /create
  if (segments[0] === 'create') {
    return (
      <CreateInterviewPage
        onBack={() => navigate('/dashboard')}
        onCreated={(id) => navigate(`/lobby/${id}`)}
      />
    );
  }

  // Route: /lobby/:id
  if (segments[0] === 'lobby' && segments[1]) {
    return (
      <LobbyPage
        sessionId={segments[1]}
        onBack={() => navigate('/dashboard')}
        onEnterRoom={(id) => navigate(`/room/${id}?role=interviewer`)}
      />
    );
  }

  // Route: /room/:id?role=interviewer|candidate&participant=xxx
  if (segments[0] === 'room' && segments[1]) {
    const role = (query.role as 'interviewer' | 'candidate') ?? 'interviewer';
    const participantId = query.participant;
    return (
      <InterviewRoomPage
        sessionId={segments[1]}
        role={role}
        participantId={participantId}
        onBack={() => navigate(role === 'interviewer' ? '/dashboard' : '/')}
        onEnded={(id) => navigate(`/review/${id}`)}
      />
    );
  }

  // Route: /review/:id
  if (segments[0] === 'review' && segments[1]) {
    return <ReviewPage sessionId={segments[1]} onBack={() => navigate('/dashboard')} />;
  }

  // Fallback
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Page not found</p>
    </div>
  );
}

function AppInner() {
  const { path } = useRouter();
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return <Routes />;
}

export default function App() {
  return (
    <RouterProvider>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </RouterProvider>
  );
}
