import React, { useState, useEffect, useRef } from 'react';
import { Screen, Module, Vocalize, Course, StudentCourse } from '../types';
import { MODULES, VOCALIZES, DISABLE_ALL_PLAYERS, MINIMALIST_LOGO_URL, LORENA_AVATAR_URL } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { usePlayback } from '../contexts/PlaybackContext';
import { RepertoireView } from '../components/RepertoireView';
import { RoutineView } from '../components/RoutineView';

interface Props {
  onNavigate: (screen: Screen) => void;
  expandedModule: string | null;
  onExpandedModuleChange: (id: string | null) => void;
  initialScrollY: number;
  onSaveScrollY: (y: number) => void;
}

export const LibraryScreen: React.FC<Props> = ({
  onNavigate,
  onPlayVocalize,
  expandedModule,
  onExpandedModuleChange,
  initialScrollY,
  onSaveScrollY
}) => {
  const { user } = useAuth(); // Auth context for guest check

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; title: string; content?: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<StudentCourse[]>([]);
  const [activeCourseSlug, setActiveCourseSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'routine'>('modules');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastLesson, setLastLesson] = useState<{ moduleId: string; topicId: string; title: string } | null>(null);

  // Refs e Estados para o Checklist e Audio Inline
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [showCritiqueModal, setShowCritiqueModal] = useState(false);
  const [critiqueType, setCritiqueType] = useState<'oratoria' | 'canto'>('oratoria');

  // Restore scroll position on mount with a slight delay to ensure layout stability
  // This is crucial because module expansion (CSS transitions) might affect scroll height
  React.useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = initialScrollY;

      // Backup attempt after a short delay to account for any layout shifts
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = initialScrollY;
        }
      }, 100);
    }
  }, [initialScrollY]);

  // Save scroll position on unmount
  useEffect(() => {
    return () => {
      if (scrollContainerRef.current) {
        onSaveScrollY(scrollContainerRef.current.scrollTop);
      }
    };
  }, []);

  const { play: playGlobal, stop: stopGlobal, isPlaying, activeUrl } = usePlayback();
  const [activeInlineBtn, setActiveInlineBtn] = useState<HTMLElement | null>(null);

  const isAdmin = user?.email && ['lorenapimenteloficial@gmail.com', 'willmakesongs@gmail.com'].includes(user.email.toLowerCase());

  const visualizerIntervalRef = useRef<number | null>(null);

  // Carrega estado salvo do checklist, cursos e vínculos ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('checklist_progress');
    if (saved) {
      try {
        setChecklistState(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar checklist:", e);
      }
    }

    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [cRes, scRes] = await Promise.all([
          supabase.from('courses').select('*').eq('ativo', true),
          supabase.from('student_courses').select('*').eq('student_id', user.id)
        ]);

        if (cRes.data) setCourses(cRes.data);
        if (scRes.data) {
          setUserCourses(scRes.data);

          // Lógica de Redirecionamento Automático (Regra 1 e 2)
          const enrolled = scRes.data.filter(uc => uc.status === 'ativo');
          if (enrolled.length === 1) {
            const course = cRes.data?.find(c => c.id === enrolled[0].course_id);
            if (course) setActiveCourseSlug(course.slug);
          } else if (enrolled.length > 1) {
            // Se tiver mais de um, e nenhum selecionado, abre o seletor
            if (!activeCourseSlug) setIsSelectorOpen(true);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar cursos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Carregar última aula
    const last = localStorage.getItem('last_accessed_lesson');
    if (last) {
      try { setLastLesson(JSON.parse(last)); } catch (e) { }
    }
  }, [user]);

  const { preload } = usePlayback();

  // Preload audio when a module is expanded
  useEffect(() => {
    if (expandedModule) {
      const moduleVocalizes = VOCALIZES.filter(v => v.moduleId === expandedModule);
      const urlsToPreload = moduleVocalizes.flatMap(v => [v.audioUrl, v.audioUrlMale, v.exampleUrl].filter(Boolean) as string[]);

      // Also preload topics examples
      const module = MODULES.find(m => m.id === expandedModule);
      if (module) {
        module.topics.forEach(topic => {
          if (topic.content) {
            const matches = topic.content.matchAll(/data-src="([^"]+)"/g);
            for (const match of matches) {
              urlsToPreload.push(match[1]);
            }
          }
        });
      }

      if (urlsToPreload.length > 0) {
        preload(urlsToPreload);
      }
    }
  }, [expandedModule, preload]);

  // Função para limpar animações
  const stopVisualizer = () => {
    if (visualizerIntervalRef.current) {
      clearInterval(visualizerIntervalRef.current);
      visualizerIntervalRef.current = null;
    }

    // Reset UI do botão anterior
    if (activeInlineBtn) {
      const icon = activeInlineBtn.querySelector('.material-symbols-rounded');
      if (icon) {
        icon.textContent = 'play_arrow';
        icon.classList.add('ml-1');
      }

      const container = activeInlineBtn.closest('div.player-container');
      if (container) {
        const viz = container.querySelector('.audio-viz');
        if (viz) {
          viz.classList.remove('opacity-100');
          viz.classList.add('opacity-50');
          const bars = viz.querySelectorAll('div');
          bars.forEach(bar => {
            const baseHeight = bar.getAttribute('data-base-height');
            if (baseHeight) {
              bar.style.height = `${baseHeight}px`;
            } else {
              bar.style.height = '8px';
            }
          });
        }
      }
      setActiveInlineBtn(null);
    }
  };

  const stopCurrentAudio = () => {
    stopGlobal();
    stopVisualizer();
  };

  // Para o áudio apenas se um tópico estava aberto e foi fechado
  const lastTopicRef = useRef<{ title: string; content: string } | null>(null);
  useEffect(() => {
    if (lastTopicRef.current && !selectedTopic) {
      stopCurrentAudio();
    }
    lastTopicRef.current = selectedTopic;
  }, [selectedTopic]);

  // Atualiza o visual do checklist sempre que o conteúdo ou o estado mudar
  useEffect(() => {
    if (!selectedTopic || !contentRef.current) return;

    // Aguarda um ciclo para garantir que o DOM foi renderizado dentro do modal
    const timeout = setTimeout(() => {
      if (!contentRef.current) return;
      const items = contentRef.current.querySelectorAll('.checklist-item');

      items.forEach(item => {
        const id = item.getAttribute('data-id');
        const box = item.querySelector('.checkbox-box');
        const icon = item.querySelector('.check-icon');

        if (id && checklistState[id]) {
          // Estilo MARCADO
          if (box) {
            box.classList.remove('border-gray-600', 'bg-[#1A202C]');
            box.classList.add('bg-green-500', 'border-green-500');
          }
          if (icon) {
            icon.classList.remove('opacity-0', 'scale-0');
            icon.classList.add('opacity-100', 'scale-100');
          }
          item.classList.add('bg-green-500/5');
        } else {
          // Estilo DESMARCADO
          if (box) {
            box.classList.add('border-gray-600', 'bg-[#1A202C]');
            box.classList.remove('bg-green-500', 'border-green-500');
          }
          if (icon) {
            icon.classList.add('opacity-0', 'scale-0');
            icon.classList.remove('opacity-100', 'scale-100');
          }
          item.classList.remove('bg-green-500/5');
        }
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, [selectedTopic, checklistState]);

  const handleInlinePlay = async (url: string, btn: HTMLElement) => {
    if (DISABLE_ALL_PLAYERS && !isAdmin) {
      alert("Ativo para assinantes");
      return;
    }
    // Se clicou no mesmo botão que estava tocando, apenas para
    if (activeUrl === url && isPlaying) {
      stopCurrentAudio();
      return;
    }

    // Para qualquer áudio anterior e reseta visualizer
    stopVisualizer();
    setActiveInlineBtn(btn);

    // 1. Toca o áudio usando o contexto global
    playGlobal(url, {
      onEnded: () => {
        stopVisualizer();
      }
    });

    // Inicia Animação do Visualizer
    const container = btn.closest('div.player-container');
    if (container) {
      const viz = container.querySelector('.audio-viz');
      if (viz) {
        viz.classList.remove('opacity-50');
        viz.classList.add('opacity-100');

        const bars = viz.querySelectorAll('div');

        // Intervalo para animar as barras respeitando a proporção base
        visualizerIntervalRef.current = window.setInterval(() => {
          bars.forEach(bar => {
            const baseHeight = parseInt(bar.getAttribute('data-base-height') || '10');
            // Escala aleatória entre 0.5x e 1.5x da altura base
            const randomScale = 0.5 + Math.random();
            const h = Math.max(4, Math.min(32, baseHeight * randomScale));
            bar.style.height = `${h}px`;
          });
        }, 80);
      }
    }

    // Atualiza UI do botão clicado para "Stop"
    const icon = btn.querySelector('.material-symbols-rounded');
    if (icon) {
      icon.textContent = 'stop';
      icon.classList.remove('ml-1'); // Remove ajuste de margem do play
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 1. Lógica do Checklist
    const checklistItem = target.closest('.checklist-item');
    if (checklistItem) {
      const id = checklistItem.getAttribute('data-id');
      if (id) {
        const newState = { ...checklistState, [id]: !checklistState[id] };
        setChecklistState(newState);
        localStorage.setItem('checklist_progress', JSON.stringify(newState));
      }
      return;
    }

    // 2. Lógica do Botão de Exemplo (Áudio Inline)
    const playBtn = target.closest('.play-example-btn');
    if (playBtn) {
      e.preventDefault();
      const audioUrl = playBtn.getAttribute('data-src');
      if (audioUrl) {
        handleInlinePlay(audioUrl, playBtn as HTMLElement);
      }
      return;
    }

    // 3. Lógica do Botão de Concluir Prática (Gatilho da Lorena IA)
    const completeBtn = target.closest('.complete-practice-btn');
    if (completeBtn) {
      e.preventDefault();
      setCritiqueType('oratoria');
      setShowCritiqueModal(true);
      return;
    }
  };

  const toggleModule = (id: string, isLocked: boolean) => {
    if (isLocked) {
      // Optional: show toast/alert for locked modules
      return;
    }
    onExpandedModuleChange(expandedModule === id ? null : id);
  };

  const getVocalizesForModule = (moduleId: string) => {
    return VOCALIZES.filter(v => v.moduleId === moduleId);
  };

  const activeCourse = courses.find(c => c.slug === activeCourseSlug);
  const courseModules = MODULES.filter(m => (m.courseId || 'canto') === activeCourseSlug);

  // Calcular progresso do curso
  const calculateCourseProgress = () => {
    if (courseModules.length === 0) return 0;
    let totalTopics = 0;
    let completedTopics = 0;
    courseModules.forEach(m => {
      m.topics.forEach(t => {
        totalTopics++;
        if (checklistState[t.id]) completedTopics++;
      });
    });
    return totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  };

  const progress = calculateCourseProgress();

  const handleLessonOpen = (topic: { id: string; title: string; content?: string }, moduleId: string) => {
    setSelectedTopic(topic);
    const lessonData = { moduleId, topicId: topic.id, title: topic.title };
    setLastLesson(lessonData);
    localStorage.setItem('last_accessed_lesson', JSON.stringify(lessonData));
  };

  if (loading) {
    return <div className="min-h-screen bg-[#101622] flex items-center justify-center text-white">Carregando Academia...</div>;
  }

  // Se não houver curso ativo e não estiver carregando, mostra o seletor forçado
  if (!activeCourseSlug && !isSelectorOpen) {
    return (
      <div className="min-h-screen bg-[#101622] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <img src={MINIMALIST_LOGO_URL} className="w-12 h-12 object-contain" alt="Logo" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Bem-vindo à Academia</h2>
        <p className="text-gray-400 text-sm mb-8">Selecione um dos seus cursos para começar a estudar.</p>
        <button
          onClick={() => setIsSelectorOpen(true)}
          className="px-8 py-4 bg-brand-gradient rounded-2xl text-white font-bold shadow-lg"
        >
          Escolher Curso
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101622] pb-24 flex flex-col relative">
      {/* Topic Content Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-[60] bg-[#101622] flex flex-col animate-in slide-in-from-bottom duration-300 max-w-md mx-auto left-0 right-0 shadow-2xl">
          {selectedTopic.id.startsWith('10.1') ? (
            <div className="flex-1 bg-[#101622] p-4">
              <RepertoireView onBack={() => setSelectedTopic(null)} />
            </div>
          ) : (
            <>
              <div className="pt-8 px-6 pb-4 bg-[#101622]/95 border-b border-white/5 flex items-center gap-3 sticky top-0">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10"
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
                <h2 className="text-lg font-bold text-white flex-1 truncate">{selectedTopic.title}</h2>
              </div>
              <div
                className="flex-1 overflow-y-auto p-6 hide-scrollbar"
                ref={contentRef}
                onClick={handleContentClick}
              >
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedTopic.content }}
                />
                <div className="h-12"></div>
              </div>
            </>
          )}
        </div>
      )}

      {/* HEADER DO CURSO (CONTEXTO FIXO) */}
      <header className="pt-8 pb-4 px-6 sticky top-0 bg-[#101622]/95 backdrop-blur-md z-20 border-b border-white/5 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tighter">
                {activeCourse?.nome || 'Academia'}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0081FF] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-500">{progress}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSelectorOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10"
          >
            <span className="material-symbols-rounded">swap_horiz</span>
          </button>
        </div>

        {/* ABAS INTERNAS DO CURSO */}
        <div className="flex gap-2 p-1 bg-black/20 rounded-xl">
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'modules' ? 'bg-[#1A202C] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Módulos
          </button>
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'routine' ? 'bg-[#1A202C] text-white shadow-sm' : 'text-gray-500'}`}
          >
            Rotina
          </button>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="px-6 py-6 space-y-4 overflow-y-auto hide-scrollbar flex-1"
      >
        {activeTab === 'modules' ? (
          <>
            {/* CONTINUAR DE ONDE PAREI */}
            {lastLesson && lastLesson.moduleId && (
              <div
                onClick={() => {
                  const mod = MODULES.find(m => m.id === lastLesson.moduleId);
                  const top = mod?.topics.find(t => t.id === lastLesson.topicId);
                  if (top) handleLessonOpen(top, lastLesson.moduleId);
                }}
                className="bg-brand-gradient p-5 rounded-2xl shadow-[0_10px_30px_rgba(111,76,231,0.2)] mb-4 cursor-pointer group hover:scale-[1.02] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">AULA EM ANDAMENTO</span>
                  <span className="material-symbols-rounded text-white animate-pulse">play_circle</span>
                </div>
                <h4 className="text-white font-bold leading-tight mb-1">{lastLesson.title}</h4>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white/20 rounded-lg text-white font-black text-[9px] uppercase tracking-widest">
                    Continuar de onde parei
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {courseModules.map((module, index) => {
                const isActive = expandedModule === module.id;
                const moduleExercises = getVocalizesForModule(module.id);
                const isTrial = user?.status === 'trial';
                const isLocked = isTrial && index > 0;

                // Calcular status do módulo
                const moduleTopics = module.topics;
                const completedCount = moduleTopics.filter(t => checklistState[t.id]).length;
                const status = completedCount === 0 ? 'not_started' : (completedCount === moduleTopics.length ? 'completed' : 'in_progress');

                return (
                  <div
                    key={module.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isActive
                      ? 'bg-[#1A202C] border-[#6F4CE7]/50 shadow-[0_0_30px_rgba(111,76,231,0.1)]'
                      : (isLocked ? 'bg-[#1A202C]/30 border-white/5 opacity-70' : 'bg-[#1A202C]/50 border-white/5')
                      }`}
                  >
                    <button
                      onClick={() => toggleModule(module.id, isLocked)}
                      className="w-full flex items-start p-5 text-left relative"
                    >
                      <div className={`mr-4 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg transition-colors ${isActive ? 'bg-brand-gradient text-white' : (status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-gray-500')
                        }`}>
                        {isLocked ? <span className="material-symbols-rounded text-xl">lock</span> : (status === 'completed' ? <span className="material-symbols-rounded">check</span> : module.number)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {status === 'in_progress' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>}
                          <p className={`text-[9px] font-black uppercase tracking-widest ${status === 'completed' ? 'text-green-500' : (status === 'in_progress' ? 'text-blue-500' : 'text-gray-600')}`}>
                            {status === 'completed' ? 'CONCLUÍDO' : (status === 'in_progress' ? 'EM ANDAMENTO' : 'NÃO INICIADO')}
                          </p>
                        </div>
                        <h3 className={`font-bold text-lg leading-tight mb-1 ${isActive ? 'text-white' : (isLocked ? 'text-gray-400' : 'text-gray-300')}`}>
                          {module.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{module.description}</p>
                      </div>

                      <div className={`ml-2 mt-1 transition-transform duration-300 ${isActive ? 'rotate-180 text-[#6F4CE7]' : 'text-gray-600'}`}>
                        {isLocked ? null : <span className="material-symbols-rounded">expand_more</span>}
                      </div>
                    </button>

                    <div className={`transition-all duration-500 ease-in-out ${isActive ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-5 pb-5 pt-0">
                        <div className="mb-6 pl-4 border-l border-white/10 space-y-3">
                          {module.topics.map(topic => (
                            <div
                              key={topic.id}
                              className={`relative p-2 rounded-lg transition-colors flex items-center justify-between ${topic.content || topic.id.startsWith('10.1') ? 'hover:bg-white/5 cursor-pointer group' : ''}`}
                              onClick={() => {
                                if (topic.content || topic.id.startsWith('10.1')) {
                                  handleLessonOpen(topic, module.id);
                                }
                              }}
                            >
                              <div className="flex-1">
                                <p className={`text-sm font-semibold ${checklistState[topic.id] ? 'text-gray-500 line-through' : (topic.content || topic.id.startsWith('10.1') ? 'text-[#0081FF] group-hover:text-white' : 'text-white')}`}>
                                  {topic.title}
                                </p>
                                <p className="text-[10px] text-gray-600">{topic.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {checklistState[topic.id] && <span className="material-symbols-rounded text-green-500 text-sm">check_circle</span>}
                                {(topic.content || topic.id.startsWith('10.1')) && (
                                  <span className="material-symbols-rounded text-gray-600 text-sm group-hover:text-white">
                                    {topic.id.startsWith('10.1') ? 'play_circle' : 'article'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {moduleExercises.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Exercícios Práticos</h4>
                            {moduleExercises.map(exercise => (
                              <div
                                key={exercise.id}
                                onClick={() => {
                                  if (DISABLE_ALL_PLAYERS && !isAdmin) {
                                    alert("Ativo para assinantes");
                                    return;
                                  }
                                  onPlayVocalize(exercise);
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-black/20 hover:bg-white/5 border border-white/5 cursor-pointer group transition-colors"
                              >
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FF00BC] group-hover:bg-[#FF00BC]/10 transition-colors">
                                  <span className="material-symbols-rounded text-lg">play_arrow</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{exercise.title}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-gray-500">{exercise.difficulty} • {exercise.duration}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <RoutineView onNavigate={onNavigate} />
        )}
        <div className="h-4"></div>
      </div>

      {/* SELETOR DE CURSOS (BOTTOM SHEET) */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-300">
          <div
            className="w-full max-w-md mx-auto bg-[#1A202C] rounded-t-[2.5rem] border-t border-white/10 p-8 pb-32 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[80vh]"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Escolha seu Curso</h2>
              <button
                onClick={() => setIsSelectorOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {courses.map(course => {
                const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';
                const isGuest = user?.id === 'guest' || user?.status === 'trial';
                const isEnrolled = userCourses.some(uc => uc.course_id === course.id && uc.status === 'ativo') || isAdminOrTeacher || isGuest;
                const isActive = activeCourseSlug === course.slug;

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      if (isEnrolled) {
                        setActiveCourseSlug(course.slug);
                        setIsSelectorOpen(false);
                      }
                    }}
                    className={`relative p-5 rounded-3xl border transition-all flex items-center gap-4 ${isActive ? 'bg-[#0081FF]/10 border-[#0081FF] shadow-lg shadow-[#0081FF]/10' : (isEnrolled ? 'bg-white/5 border-white/5' : 'bg-black/20 border-white/5 opacity-50')}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isActive ? 'bg-[#0081FF] text-white' : 'bg-white/5'}`}>
                      {(() => {
                        const s = course.slug.toLowerCase();
                        if (s.includes('canto') || s.includes('voz')) return '🎤';
                        if (s.includes('violao')) return '🎸';
                        if (s.includes('guitarra')) return '🎸';
                        if (s.includes('bateria')) return '🥁';
                        if (s.includes('oratoria') || s.includes('fala')) return '🗣️';
                        if (s.includes('musicalizacao') || s.includes('infantil')) {
                          return <img src="/musicalizacao-icon-dark.png" alt="Musicalização" className="w-full h-full object-cover rounded-2xl" />;
                        }
                        if (s.includes('piano') || s.includes('teclado')) return '🎹';
                        if (s.includes('violino')) return '🎻';
                        if (s.includes('saxofone') || s.includes('sax')) return '🎷';
                        if (s.includes('producao') || s.includes('studio')) return '🎧';
                        return '🎹';
                      })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{course.nome}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isEnrolled ? 'text-green-500' : 'text-gray-500'}`}>
                        {isAdminOrTeacher ? 'ACESSO TOTAL (ADM)' : (isEnrolled ? 'ATIVO NO SEU PLANO' : 'BLOQUEADO')}
                      </p>
                    </div>
                    {!isEnrolled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('https://wa.me/5535997565329', '_blank');
                        }}
                        className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#FF00BC] hover:bg-[#FF00BC] hover:text-white transition-all"
                      >
                        Contratar
                      </button>
                    )}
                    {isActive && <span className="material-symbols-rounded text-[#0081FF]">check_circle</span>}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Quer aprender um instrumento novo? Entre em contato com nossa equipe para adicionar novos conteúdos à sua trilha.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* CRITIQUE MODAL (LORENA IA REINFORCEMENT) */}
      {showCritiqueModal && (
        <div className="fixed inset-0 z-[110] bg-[#101622]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#1A202C] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            {/* Header com Avatar */}
            <div className="bg-gradient-to-br from-[#2D3748] to-[#1A202C] p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF00BC] blur-[60px] opacity-10"></div>
              <div className="w-20 h-20 rounded-full bg-brand-gradient p-1 mx-auto mb-4 relative z-10 shadow-xl shadow-purple-900/40">
                <div className="w-full h-full bg-[#1A202C] rounded-full overflow-hidden flex items-center justify-center">
                  <img src={LORENA_AVATAR_URL} className="w-full h-full object-cover" alt="Lorena IA" />
                </div>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter relative z-10">Análise da Mentora</h3>
              <p className="text-[10px] text-[#FF00BC] font-bold uppercase tracking-widest mt-1 relative z-10">Lorena IA • Feedback de Performance</p>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <span className="material-symbols-rounded text-[#0081FF] text-xl shrink-0">task_alt</span>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase mb-1">Checklist de Clareza</h4>
                    <p className="text-[11px] text-gray-400">As consoantes foram o ponto focal. A agilidade muscular é o que separa o amador do profissional.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="material-symbols-rounded text-yellow-500 text-xl shrink-0">bolt</span>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase mb-1">Gestão de Tensão</h4>
                    <p className="text-[11px] text-gray-400">Fique atento à Arquitetura Corporal. Se sentir peso na garganta, reorganize seus ombros e queixo imediatamente.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="material-symbols-rounded text-[#EE13CA] text-xl shrink-0">shield</span>
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase mb-1">Reforço de Autoridade</h4>
                    <p className="text-[11px] text-gray-300 font-medium italic">"Nunca peça desculpas por ocupar o espaço com sua voz. Sua intenção deve ser absoluta."</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCritiqueModal(false)}
                className="w-full py-4 bg-[#0081FF] hover:bg-[#006bd1] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95"
              >
                Entendido, Mentora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
