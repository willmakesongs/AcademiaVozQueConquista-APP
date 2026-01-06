
import React from 'react';
import { Screen, SubscriptionStatus } from '../types';
import { LORENA_AVATAR_URL } from '../constants';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  role: 'student' | 'teacher';
  status?: SubscriptionStatus;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, role, status = 'active' }) => {
  const getIconColor = (screen: Screen) =>
    currentScreen === screen ? 'text-[#FF00BC]' : 'text-gray-400';

  const isBlocked = status === 'blocked';
  const isOverdue = status === 'overdue';
  const isInactive = status === 'inactive';

  const handleNavClick = (target: Screen) => {
    if ((isBlocked || isInactive) && target !== Screen.PROFILE) {
      alert("Acesso pausado ou bloqueado. Regularize sua assinatura no Perfil.");
      return;
    }
    if (isOverdue && (target === Screen.ROUTINE || target === Screen.CHAT)) {
      alert("Funcionalidade indisponível. Regularize sua assinatura.");
      return;
    }
    // Dashboard and Library always allowed for overdue
    onNavigate(target);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A202C] border-t border-gray-800 pb-safe pt-2 px-6 shadow-2xl z-[150]">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        <button
          onClick={() => handleNavClick(role === 'student' ? Screen.STUDENT_DASHBOARD : Screen.TEACHER_DASHBOARD)}
          className={`flex flex-col items-center gap-1 w-16 ${(isBlocked || isInactive) ? 'opacity-30 grayscale' : ''}`}
        >
          <span className={`material-symbols-rounded text-2xl ${getIconColor(role === 'student' ? Screen.STUDENT_DASHBOARD : Screen.TEACHER_DASHBOARD)}`}>
            dashboard
          </span>
          <span className={`text-[10px] font-medium ${getIconColor(role === 'student' ? Screen.STUDENT_DASHBOARD : Screen.TEACHER_DASHBOARD)}`}>
            Início
          </span>
        </button>

        <button
          onClick={() => handleNavClick(Screen.LIBRARY)}
          className={`flex flex-col items-center gap-1 w-16 ${(isBlocked || isInactive) ? 'opacity-30 grayscale' : ''}`}
        >
          <span className={`material-symbols-rounded text-2xl ${getIconColor(Screen.LIBRARY)}`}>
            library_music
          </span>
          <span className={`text-[10px] font-medium ${getIconColor(Screen.LIBRARY)}`}>
            Academia
          </span>
        </button>

        <div
          className={`relative flex flex-col items-center gap-1 w-16 group cursor-pointer ${isBlocked || isOverdue || isInactive ? 'opacity-30 pointer-events-none grayscale' : ''}`}
          onClick={() => handleNavClick(Screen.CHAT)}
        >
          {/* CAMADA 1: Botão Flutuante (Fundo) */}
          <div className="absolute -top-14 w-20 h-20 z-0">
            <div className={`absolute inset-0 bg-brand-gradient rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity animate-pulse duration-2000 ${isBlocked || isOverdue ? 'hidden' : ''}`}></div>
            <button
              className="relative flex items-center justify-center w-full h-full rounded-full bg-[#1A202C] shadow-[0_8px_24px_rgba(238,19,202,0.5)] hover:scale-105 transition-transform border-4 border-[#101622] overflow-hidden group-hover:border-[#FF00BC]/50"
            >
              <img
                src={LORENA_AVATAR_URL}
                alt="Lorena IA"
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              {/* Overlay de brilho */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0081FF]/20 to-[#FF00BC]/20 mix-blend-overlay"></div>
            </button>
          </div>

          {/* Spacer */}
          <span className="material-symbols-rounded text-2xl opacity-0">dashboard</span>

          {/* CAMADA 2: Texto (Frente) */}
          <span className={`text-[10px] font-medium relative z-10 ${getIconColor(Screen.CHAT)}`}>
            Lorena IA
          </span>
        </div>

        <button
          onClick={() => handleNavClick(Screen.ROUTINE)}
          className={`flex flex-col items-center gap-1 w-16 ${(isBlocked || isOverdue || isInactive) ? 'opacity-30 grayscale' : ''}`}
        >
          <span className={`material-symbols-rounded text-2xl ${getIconColor(Screen.ROUTINE)}`}>
            calendar_today
          </span>
          <span className={`text-[10px] font-medium ${getIconColor(Screen.ROUTINE)}`}>
            Rotina
          </span>
        </button>

        <button
          onClick={() => handleNavClick(Screen.PROFILE)}
          className="flex flex-col items-center gap-1 w-16"
        >
          <span className={`material-symbols-rounded text-2xl ${getIconColor(Screen.PROFILE)}`}>
            person
          </span>
          <span className={`text-[10px] font-medium ${getIconColor(Screen.PROFILE)}`}>
            Perfil
          </span>
        </button>
      </div>
    </div>
  );
};
