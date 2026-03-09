
import React, { useState, useEffect, Suspense } from 'react';
import { Screen, Vocalize } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaybackProvider, usePlayback } from './contexts/PlaybackContext';
import { LoginScreen } from './screens/LoginScreen';
import { StudentDashboard } from './screens/StudentDashboard';
import { BottomNav } from './components/BottomNav';
import { onMessageListener } from './lib/firebase';
import { ADMIN_EMAILS, VOCALIZES } from './constants';

// Code-splitting: telas carregadas sob demanda para melhorar performance inicial
const OnboardingScreen = React.lazy(() => import('./screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })));
const TeacherDashboard = React.lazy(() => import('./screens/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const PlayerScreen = React.lazy(() => import('./screens/PlayerScreen').then(m => ({ default: m.PlayerScreen })));
const LibraryScreen = React.lazy(() => import('./screens/LibraryScreen').then(m => ({ default: m.LibraryScreen })));
const RoutineScreen = React.lazy(() => import('./screens/RoutineScreen').then(m => ({ default: m.RoutineScreen })));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const CalendarScreen = React.lazy(() => import('./screens/CalendarScreen').then(m => ({ default: m.CalendarScreen })));
const TwisterScreen = React.lazy(() => import('./screens/TwisterScreen').then(m => ({ default: m.TwisterScreen })));
const BreathingScreen = React.lazy(() => import('./screens/BreathingScreen').then(m => ({ default: m.BreathingScreen })));
const ChatScreen = React.lazy(() => import('./screens/ChatScreen').then(m => ({ default: m.ChatScreen })));
const StudioScreen = React.lazy(() => import('./screens/StudioScreen').then(m => ({ default: m.StudioScreen })));
const BlockedScreen = React.lazy(() => import('./screens/BlockedScreen').then(m => ({ default: m.BlockedScreen })));
const VisitorConversionScreen = React.lazy(() => import('./screens/VisitorConversionScreen').then(m => ({ default: m.VisitorConversionScreen })));
const StudentDetailDashboard = React.lazy(() => import('./screens/StudentDetailDashboard').then(m => ({ default: m.StudentDetailDashboard })));

const AppContent = () => {
  const { user, loading, signOut, visitorTimeRemaining } = useAuth();
  const { isPlaying, activeUrl } = usePlayback();
  const [screen, setScreen] = useState<Screen>(Screen.LOGIN);
  const [previousScreen, setPreviousScreen] = useState<Screen>(Screen.LIBRARY);
  const [currentVocalize, setCurrentVocalize] = useState<Vocalize | null>(null);
  const [libraryResetKey, setLibraryResetKey] = useState(0);
  const [profileResetKey, setProfileResetKey] = useState(0);
  const [dashboardResetKey, setDashboardResetKey] = useState(0);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'dashboard' | 'students' | 'reports'>('dashboard');
  const [studentDetailInitialTab, setStudentDetailInitialTab] = useState<'pedagogy' | 'finance'>('pedagogy');
  const [libraryExpandedModule, setLibraryExpandedModule] = useState<string | null>(null);
  const [libraryScrollY, setLibraryScrollY] = useState(0);
  const [libraryActiveCourseSlug, setLibraryActiveCourseSlug] = useState<string | null>(null);
  const isAdmin = user?.role === 'admin' || (user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim()));

  // Code-splitting: telas carregadas sob demanda para melhorar performance inicial
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('SW registered:', registration);
        }).catch((error) => {
          console.log('SW registration failed:', error);
        });
      });
    }
  }, []);

  // Visitor Warning State
  const [showVisitorWarning, setShowVisitorWarning] = useState(false);

  // Redirect based on auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (screen === Screen.LOGIN) {
          if (user.role === 'student' && !user.onboardingCompleted) {
            setScreen(Screen.ONBOARDING);
          } else {
            // Determine initial screen: ADMIN or TEACHER -> Dashboard | STUDENT -> Student Dashboard
            const isActuallyAdmin = user.role === 'admin' || (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase().trim()));
            const initialScreen = (isActuallyAdmin || user.role === 'teacher') ? Screen.TEACHER_DASHBOARD : Screen.STUDENT_DASHBOARD;

            setScreen(initialScreen);
            setPreviousScreen(initialScreen);
          }
        }
      } else {
        setScreen(Screen.LOGIN);
      }
    }

    // Force redirect for Blocked/Inactive Users
    if ((user?.status === 'blocked' || user?.status === 'inactive') && screen !== Screen.PROFILE && screen !== Screen.LOGIN && screen !== Screen.ONBOARDING) {
      setScreen(Screen.PROFILE);
    }

    // Prevents rendering Student Detail without an ID
    if (screen === Screen.STUDENT_DETAIL && !selectedStudentId) {
      setScreen(user?.role === 'student' ? Screen.STUDENT_DASHBOARD : Screen.TEACHER_DASHBOARD);
    }
  }, [user, loading, screen, selectedStudentId]);

  // Visitor Warning Logic (2 min warning)
  useEffect(() => {
    if (visitorTimeRemaining !== null) {
      if (visitorTimeRemaining <= 120000 && visitorTimeRemaining > 110000 && !showVisitorWarning) {
        setShowVisitorWarning(true);
        setTimeout(() => setShowVisitorWarning(false), 5000);
      }
    }
  }, [visitorTimeRemaining]);

  // Listener de Notificações em Foreground
  useEffect(() => {
    onMessageListener().then((payload: any) => {
      console.log('Notificação recebida:', payload);
      if (payload.notification) {
        alert(`${payload.notification.title}\n${payload.notification.body}`);
      }
    }).catch(err => console.log('failed: ', err));
  }, []);

  // AUTO-SYNC: Mantém currentVocalize sincronizado com o que está tocando no fundo
  // Isso resolve o problema de retornar para a aba "Academia" e o player resetar
  useEffect(() => {
    if (activeUrl && isPlaying) {
      const activeVocalize = VOCALIZES.find(v =>
        v.audioUrl === activeUrl ||
        v.audioUrlMale === activeUrl ||
        v.exampleUrl === activeUrl
      );

      if (activeVocalize && (!currentVocalize || currentVocalize.id !== activeVocalize.id)) {
        setCurrentVocalize(activeVocalize);
      }
    }
  }, [activeUrl, isPlaying]);

  if (loading) return <div className="min-h-screen bg-[#101622] flex items-center justify-center text-white">Carregando Vocalizes...</div>;

  const handleLogout = async () => {
    await signOut();
    setSelectedStudentId(null);
    setDashboardInitialTab('dashboard');
    setScreen(Screen.LOGIN);
  };

  const navigateToPlayer = (vocalize: Vocalize) => {
    // Só atualiza a tela anterior se NÃO estiver vindo do próprio player (ex: próxima música)
    if (screen !== Screen.PLAYER && screen !== Screen.TWISTERS && screen !== Screen.BREATHING && screen !== Screen.CHAT && screen !== Screen.STUDIO) {
      setPreviousScreen(screen);
    }

    setCurrentVocalize(vocalize);
    if (vocalize.moduleId === 'm6') {
      setScreen(Screen.TWISTERS);
    } else {
      setScreen(Screen.PLAYER);
    }
  };

  // Wrapper para navegação padrão para lidar com o histórico
  const handleNavigate = (targetScreen: Screen, studentIdParam?: string) => {
    // Se for navegar para telas secundárias manualmente, salva o histórico
    if (targetScreen === Screen.PLAYER || targetScreen === Screen.TWISTERS || targetScreen === Screen.BREATHING || targetScreen === Screen.CHAT || targetScreen === Screen.STUDIO || targetScreen === Screen.STUDENT_DETAIL) {
      if (screen !== Screen.PLAYER && screen !== Screen.TWISTERS && screen !== Screen.BREATHING && screen !== Screen.CHAT && screen !== Screen.STUDIO && screen !== Screen.STUDENT_DETAIL) {
        setPreviousScreen(screen);
      }
    }

    let actualStudentId = studentIdParam;
    let targetTab: any = null;

    if (studentIdParam && studentIdParam.includes(':')) {
      [actualStudentId, targetTab] = studentIdParam.split(':');
    }

    if (targetScreen === Screen.TEACHER_DASHBOARD || targetScreen === Screen.ADMIN_DASHBOARD || targetScreen === Screen.ADMIN_SETTINGS) {
      if (actualStudentId) {
        setDashboardInitialTab(targetTab || 'students');
      } else if (targetScreen === Screen.ADMIN_DASHBOARD || (targetScreen === Screen.TEACHER_DASHBOARD && isAdmin)) {
        setDashboardInitialTab('dashboard');
      } else if (targetScreen === Screen.ADMIN_SETTINGS) {
        setDashboardInitialTab('settings');
      } else if (dashboardInitialTab !== 'reports') {
        setDashboardInitialTab('students');
      }

      setDashboardResetKey(prev => prev + 1);
    }

    // Limpa o ID se não houver um novo, para evitar persistência "suja"
    if (actualStudentId) {
      setSelectedStudentId(actualStudentId);
      setStudentDetailInitialTab(targetTab || 'pedagogy');
    } else {
      setSelectedStudentId(null);
      setStudentDetailInitialTab('pedagogy');
    }

    setScreen(targetScreen);
  };

  const handleNextVocalize = () => {
    if (!currentVocalize) return;
    const moduleVocalizes = VOCALIZES.filter(v => v.moduleId === currentVocalize.moduleId);
    const currentIndex = moduleVocalizes.findIndex(v => v.id === currentVocalize.id);
    if (currentIndex < moduleVocalizes.length - 1) {
      setCurrentVocalize(moduleVocalizes[currentIndex + 1]);
    }
  };

  const handlePrevVocalize = () => {
    if (!currentVocalize) return;
    const moduleVocalizes = VOCALIZES.filter(v => v.moduleId === currentVocalize.moduleId);
    const currentIndex = moduleVocalizes.findIndex(v => v.id === currentVocalize.id);
    if (currentIndex > 0) {
      setCurrentVocalize(moduleVocalizes[currentIndex - 1]);
    }
  };

  // Intercepta a navegação do rodapé
  const handleBottomNav = (targetScreen: Screen) => {
    if (targetScreen === Screen.LIBRARY) {
      // SMART NAVIGATION: Se estiver tocando áudio, volta para o Player
      if (isPlaying) {
        // Tenta sincronizar o vocalize atual caso ele tenha sido mudado externamente (ex: lock screen)
        if (activeUrl) {
          const activeVocalize = VOCALIZES.find(v => v.audioUrl === activeUrl || v.audioUrlMale === activeUrl || v.exampleUrl === activeUrl);
          if (activeVocalize) {
            setCurrentVocalize(activeVocalize);
          }
        }
        setScreen(Screen.PLAYER);
        return;
      }
      // Se não estiver tocando, reseta e vai para a biblioteca
      setLibraryResetKey(prev => prev + 1);
    }

    // Incrementa a chave para forçar remontagem do componente ProfileScreen
    // Isso garante que ele volte para o menu inicial ('menu') mesmo se já estiver na tela de perfil
    if (targetScreen === Screen.PROFILE) {
      setProfileResetKey(prev => prev + 1);
    }

    if (targetScreen === Screen.TEACHER_DASHBOARD || targetScreen === Screen.ADMIN_DASHBOARD) {
      setDashboardInitialTab((targetScreen === Screen.TEACHER_DASHBOARD && !isAdmin) ? 'students' : 'dashboard');
      setDashboardResetKey(prev => prev + 1);
    }

    setScreen(targetScreen);
  };

  const renderScreen = () => {
    // Force Login if no user (and not currently on login screen)
    if (!user && screen !== Screen.LOGIN) return <LoginScreen />;

    // Visitor Expiration Check
    if (visitorTimeRemaining === 0 && user?.id === 'guest') {
      return (
        <VisitorConversionScreen
          onJoin={() => window.open('https://wa.me/5535997565329', '_blank')}
          onLearnMore={() => window.open('https://wa.me/5535997565329', '_blank')}
        />
      );
    }

    // Bloqueio Global por Inadimplência
    if (user?.status === 'blocked' && user.role === 'student' && screen !== Screen.LOGIN) {
      return <BlockedScreen onLogout={handleLogout} />;
    }

    switch (screen) {
      case Screen.LOGIN:
        return <LoginScreen />;
      case Screen.STUDENT_DASHBOARD:
        return <StudentDashboard onNavigate={handleNavigate} onPlayVocalize={navigateToPlayer} />;
      case Screen.TEACHER_DASHBOARD:
        return (
          <TeacherDashboard
            key={dashboardResetKey}
            initialTab={dashboardInitialTab}
            isAdminView={isAdmin}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            initialSelectedStudentId={selectedStudentId}
          />
        );
      case Screen.ADMIN_DASHBOARD:
        return (
          <TeacherDashboard
            key={dashboardResetKey}
            initialTab="reports"
            isAdminView={true}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case Screen.ADMIN_SETTINGS:
        return (
          <TeacherDashboard
            key={dashboardResetKey}
            initialTab="settings"
            isAdminView={true}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
      case Screen.PLAYER:
        return (
          <PlayerScreen
            vocalize={currentVocalize}
            onBack={() => setScreen(previousScreen)}
            onNext={handleNextVocalize}
            onPrev={handlePrevVocalize}
          />
        );
      case Screen.TWISTERS:
        return (
          <TwisterScreen
            initialExerciseId={currentVocalize?.id}
            onBack={() => setScreen(previousScreen)}
          />
        );
      case Screen.BREATHING:
        return (
          <BreathingScreen
            onBack={() => setScreen(previousScreen)}
          />
        );
      case Screen.CHAT:
        return (
          <ChatScreen
            onBack={() => setScreen(previousScreen)}
          />
        );
      case Screen.STUDIO:
        return (
          <StudioScreen
            onBack={() => setScreen(previousScreen)}
          />
        );
      case Screen.ONBOARDING:
        return <OnboardingScreen onComplete={() => setScreen(Screen.STUDENT_DASHBOARD)} />;
      case Screen.LIBRARY:
        return (
          <LibraryScreen
            key={libraryResetKey}
            onNavigate={handleNavigate}
            onPlayVocalize={navigateToPlayer}
            expandedModule={libraryExpandedModule}
            onExpandedModuleChange={setLibraryExpandedModule}
            initialScrollY={libraryScrollY}
            onSaveScrollY={setLibraryScrollY}
            activeCourseSlug={libraryActiveCourseSlug}
            onActiveCourseSlugChange={setLibraryActiveCourseSlug}
          />
        );
      case Screen.ROUTINE:
        return <RoutineScreen onNavigate={handleNavigate} />;
      case Screen.PROFILE:
        return (
          <ProfileScreen
            key={profileResetKey}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onFinancialClick={() => {
              setDashboardInitialTab(isAdmin ? 'reports' : 'students');
              setDashboardResetKey(prev => prev + 1);
              setScreen(Screen.TEACHER_DASHBOARD);
            }}
          />
        );
      case Screen.CALENDAR:
        return <CalendarScreen onBack={() => setScreen(Screen.TEACHER_DASHBOARD)} />;
      case Screen.STUDENT_DETAIL:
        if (!selectedStudentId) {
          return null;
        }
        return (
          <StudentDetailDashboard
            studentId={selectedStudentId}
            initialTab={studentDetailInitialTab}
            onBack={() => {
              setSelectedStudentId(null);
              setScreen(previousScreen);
            }}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <div className="p-10 text-center text-white">Tela em construção: {screen}</div>;
    }
  };

  return (
    <div className="font-sans antialiased text-white bg-[#101622] min-h-screen max-w-md mx-auto relative shadow-2xl overflow-hidden">

      {/* Visitor Warning Toast */}
      {showVisitorWarning && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm pointer-events-none">
          <div className="bg-[#151A23]/90 backdrop-blur-md border border-[#6F4CE7]/20 rounded-xl p-4 shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#6F4CE7]/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-rounded text-[#6F4CE7]">timer</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Faltam 2 minutos</h4>
              <p className="text-gray-400 text-xs">Para o fim da sua experiência gratuita.</p>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={<div className="min-h-screen bg-[#101622] flex items-center justify-center text-white/60">Carregando...</div>}>
        {renderScreen()}
      </Suspense>

      {/* Menu rodapé presente em quase todas as telas para navegação rápida */}
      {user && screen !== Screen.LOGIN && screen !== Screen.CALENDAR && user.status !== 'blocked' && !(user.id === 'guest' && visitorTimeRemaining === 0) && (
        <BottomNav
          currentScreen={screen}
          onNavigate={handleBottomNav}
          role={isAdmin ? 'admin' : (user?.role || 'student')}
          status={user?.status}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PlaybackProvider>
        <AppContent />
      </PlaybackProvider>
    </AuthProvider>
  );
}
