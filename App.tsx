
import React, { useState, useEffect } from 'react';
import { Screen, Vocalize } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaybackProvider, usePlayback } from './contexts/PlaybackContext';
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { StudentDashboard } from './screens/StudentDashboard';
import { TeacherDashboard } from './screens/TeacherDashboard';
import { PlayerScreen } from './screens/PlayerScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { RoutineScreen } from './screens/RoutineScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { TwisterScreen } from './screens/TwisterScreen';
import { BreathingScreen } from './screens/BreathingScreen';
import { ChatScreen } from './screens/ChatScreen'; // Importação nova
import { BlockedScreen } from './screens/BlockedScreen';
import { VisitorConversionScreen } from './screens/VisitorConversionScreen';
import { BottomNav } from './components/BottomNav';
import { VOCALIZES } from './constants';

const AppContent = () => {
  const { user, loading, signOut, visitorTimeRemaining } = useAuth();
  const { isPlaying, activeUrl } = usePlayback();
  const [screen, setScreen] = useState<Screen>(Screen.LOGIN);
  const [previousScreen, setPreviousScreen] = useState<Screen>(Screen.LIBRARY);
  const [currentVocalize, setCurrentVocalize] = useState<Vocalize | null>(null);
  const [libraryResetKey, setLibraryResetKey] = useState(0);
  const [profileResetKey, setProfileResetKey] = useState(0);
  const [dashboardResetKey, setDashboardResetKey] = useState(0);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'dashboard' | 'students' | 'reports'>('students');

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
            const initialScreen = user.role === 'student' ? Screen.STUDENT_DASHBOARD : Screen.TEACHER_DASHBOARD;
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
  }, [user, loading, screen]);

  // Visitor Warning Logic (2 min warning)
  useEffect(() => {
    if (visitorTimeRemaining !== null) {
      if (visitorTimeRemaining <= 120000 && visitorTimeRemaining > 110000 && !showVisitorWarning) {
        setShowVisitorWarning(true);
        setTimeout(() => setShowVisitorWarning(false), 5000);
      }
    }
  }, [visitorTimeRemaining]);

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
    setScreen(Screen.LOGIN);
  };

  const navigateToPlayer = (vocalize: Vocalize) => {
    // Só atualiza a tela anterior se NÃO estiver vindo do próprio player (ex: próxima música)
    if (screen !== Screen.PLAYER && screen !== Screen.TWISTERS && screen !== Screen.BREATHING && screen !== Screen.CHAT) {
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
  const handleNavigate = (targetScreen: Screen) => {
    // Se for navegar para telas secundárias manualmente, salva o histórico
    if (targetScreen === Screen.PLAYER || targetScreen === Screen.TWISTERS || targetScreen === Screen.BREATHING || targetScreen === Screen.CHAT) {
      if (screen !== Screen.PLAYER && screen !== Screen.TWISTERS && screen !== Screen.BREATHING && screen !== Screen.CHAT) {
        setPreviousScreen(screen);
      }
    }
    if (targetScreen === Screen.TEACHER_DASHBOARD || targetScreen === Screen.ADMIN_DASHBOARD || targetScreen === Screen.ADMIN_SETTINGS) {
      if (targetScreen === Screen.ADMIN_DASHBOARD) setDashboardInitialTab('dashboard');
      else if (targetScreen === Screen.ADMIN_SETTINGS) setDashboardInitialTab('settings');
      else if (dashboardInitialTab !== 'reports') setDashboardInitialTab('students');

      setDashboardResetKey(prev => prev + 1);
    }
    setScreen(targetScreen);
  };

  const handleNextVocalize = () => {
    if (!currentVocalize) return;
    const currentIndex = VOCALIZES.findIndex(v => v.id === currentVocalize.id);
    if (currentIndex < VOCALIZES.length - 1) {
      setCurrentVocalize(VOCALIZES[currentIndex + 1]);
    }
  };

  const handlePrevVocalize = () => {
    if (!currentVocalize) return;
    const currentIndex = VOCALIZES.findIndex(v => v.id === currentVocalize.id);
    if (currentIndex > 0) {
      setCurrentVocalize(VOCALIZES[currentIndex - 1]);
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
      setDashboardInitialTab(targetScreen === Screen.TEACHER_DASHBOARD ? 'students' : 'dashboard');
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
          onJoin={() => window.open('https://vozqueconquista.com.br', '_blank')}
          onLearnMore={() => window.open('https://vozqueconquista.com.br/sobre', '_blank')}
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
            isAdminView={false}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
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
      case Screen.ONBOARDING:
        return <OnboardingScreen onComplete={() => setScreen(Screen.STUDENT_DASHBOARD)} />;
      case Screen.LIBRARY:
        return (
          <LibraryScreen
            key={libraryResetKey}
            onNavigate={handleNavigate}
            onPlayVocalize={navigateToPlayer}
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
              setDashboardInitialTab('reports');
              setDashboardResetKey(prev => prev + 1);
              setScreen(Screen.TEACHER_DASHBOARD);
            }}
          />
        );
      case Screen.CALENDAR:
        return <CalendarScreen onBack={() => setScreen(Screen.TEACHER_DASHBOARD)} />;
      default:
        return <div className="p-10 text-center text-white">Tela em construção: {screen}</div>;
    }
  };

  return (
    <div className="font-sans antialiased text-white bg-[#101622] min-h-screen max-w-md mx-auto relative shadow-2xl overflow-hidden">

      {/* Visitor Warning Toast */}
      {showVisitorWarning && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 w-[90%] max-w-sm pointer-events-none">
          <div className="bg-[#151A23]/90 backdrop-blur-md border border-yellow-500/20 rounded-xl p-4 shadow-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-rounded text-yellow-500">timer</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Faltam 2 minutos</h4>
              <p className="text-gray-400 text-xs">Para o fim da sua experiência gratuita.</p>
            </div>
          </div>
        </div>
      )}

      {renderScreen()}

      {/* Menu rodapé presente em quase todas as telas para navegação rápida */}
      {user && screen !== Screen.LOGIN && screen !== Screen.CALENDAR && user.status !== 'blocked' && !(user.id === 'guest' && visitorTimeRemaining === 0) && (
        <BottomNav
          currentScreen={screen}
          onNavigate={handleNavigate}
          role={user?.role || 'student'}
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
