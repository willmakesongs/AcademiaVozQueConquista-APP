
import React, { useState, useEffect, useRef } from 'react';
import { Screen } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { PianoScreen } from './PianoScreen';
import * as Tone from 'tone';

interface Props {
    onNavigate: (screen: Screen) => void;
    onLogout: () => void;
}

// --- DADOS E CONSTANTES DO TESTE VOCAL ---
const VOCAL_RANGES_DATA = [
    { name: 'Baixo', min: 28, max: 52, type: 'Masculina', desc: 'E1 - E3' },
    { name: 'Barítono', min: 33, max: 57, type: 'Masculina', desc: 'A1 - A3' },
    { name: 'Tenor', min: 36, max: 60, type: 'Masculina', desc: 'C2 - C4' },
    { name: 'Contralto', min: 41, max: 65, type: 'Feminina', desc: 'F2 - F4' },
    { name: 'Mezzo-soprano', min: 45, max: 69, type: 'Feminina', desc: 'A2 - A4' },
    { name: 'Soprano', min: 48, max: 72, type: 'Feminina', desc: 'C3 - C5' }
];

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// --- FUNÇÕES DE ÁUDIO (Pitch Detection Otimizado) ---
function autoCorrelate(buf: Float32Array, sampleRate: number) {
    let SIZE = buf.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        const val = buf[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.03) return -1; // Noise gate

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
        if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    }
    for (let i = 1; i < SIZE / 2; i++) {
        if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    }

    buf = buf.slice(r1, r2);
    SIZE = buf.length;

    let c = new Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE - i; j++) {
            c[i] = c[i] + buf[j] * buf[j + i];
        }
        // Normalização crucial para evitar erro de oitava (bias para lags menores)
        // Sem isso, frequências mais altas (lags menores/C3) ganham da fundamental (lags maiores/C2)
        // porque somam mais amostras.
        if (SIZE - i > 0) {
            c[i] = c[i] / (SIZE - i);
        }
    }

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
        if (c[i] > maxval) {
            maxval = c[i];
            maxpos = i;
        }
    }
    let T0 = maxpos;

    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
}

function getNoteFromFrequency(frequency: number) {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    return Math.round(noteNum) + 69;
}

function getNoteStringFromMidi(midi: number) {
    const note = NOTE_STRINGS[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${note}${octave}`;
}

// --- FUNÇÃO AUXILIAR DE DATA ---
function formatDateBR(dateString?: string) {
    if (!dateString) return '---';
    try {
        // Se a data vier no formato ISO 2026-02-02...
        const parts = dateString.split(' ')[0].split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
}

function formatDayOfMonth(dateString?: string) {
    if (!dateString) return '05';
    try {
        const parts = dateString.split(' ')[0].split('-');
        if (parts.length === 3) {
            return parts[2]; // Retorna apenas o DD
        }
        return dateString;
    } catch (e) {
        return '05';
    }
}

export const ProfileScreen: React.FC<Props> = ({ onNavigate, onLogout }) => {
    const { user } = useAuth();

    // Navigation State
    const [activeView, setActiveView] = useState<'menu' | 'personal_data' | 'subscription' | 'contract' | 'vocal_test' | 'piano' | 'tuner'>('menu');

    // --- ESTADO DE EDIÇÃO DE VENCIMENTO ---
    const [isEditingDueDate, setIsEditingDueDate] = useState(false);
    const [editDueDateDay, setEditDueDateDay] = useState('02');

    // --- ESTADOS DO TESTE VOCAL & AFINADOR ---
    // --- ESTADOS DO TESTE VOCAL & AFINADOR ---
    const [rangeStep, setRangeStep] = useState<'intro' | 'gender_select' | 'low' | 'high' | 'questionnaire' | 'result'>('intro');
    const [vocalType, setVocalType] = useState<string>('Indefinido');
    const [userVocalRange, setUserVocalRange] = useState<string>('--');
    const [isMicOn, setIsMicOn] = useState(false);

    // Novas variáveis para lógica aprimorada
    const [vocalGender, setVocalGender] = useState<'Masculina' | 'Feminina'>('Masculina');
    const [comfortZone, setComfortZone] = useState<'grave' | 'medio' | 'agudo'>('medio');
    const [difficultyZone, setDifficultyZone] = useState<'grave' | 'medio' | 'agudo'>('agudo');

    const [pitchNote, setPitchNote] = useState('-');
    const [pitchOctave, setPitchOctave] = useState<number | null>(null);
    const [pitchMidi, setPitchMidi] = useState(0);
    const [pitchCents, setPitchCents] = useState(0); // Para o afinador fino
    const [detectedLowMidi, setDetectedLowMidi] = useState<number | null>(null);
    const [detectedHighMidi, setDetectedHighMidi] = useState<number | null>(null);
    const [rangeAnalysisStatus, setRangeAnalysisStatus] = useState('Aguardando som...');

    // Refs de Áudio
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const synthRef = useRef<Tone.Synth | null>(null);

    // --- ESTADOS DO FORMULÁRIO DADOS PESSOAIS ---
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: 'usuario@email.com', // Mock, já que user não tem email no tipo atual
        phone: '(11) 99999-9999',
        bio: 'Apaixonado por música e buscando evoluir minha técnica vocal.'
    });
    const [isEditing, setIsEditing] = useState(false);

    // --- ESTADO DO CONTRATO ---
    const [contractAgreed, setContractAgreed] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [hasSignature, setHasSignature] = useState(false);

    // --- ESTADO DO BOTÃO PIX ---
    const [pixCopyStatus, setPixCopyStatus] = useState('Copiar Chave');

    // Limpeza de áudio ao sair
    useEffect(() => {
        return () => {
            stopMic();
            if (synthRef.current) synthRef.current.dispose();
        };
    }, []);

    // --- LÓGICA DE ÁUDIO ---
    const startMic = async () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioCtx;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = audioCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 4096; // Aumentado para melhor resolução em graves
            source.connect(analyser);
            analyserRef.current = analyser;
            setIsMicOn(true);
            updatePitch();
        } catch (err) {
            console.error("Erro mic:", err);
            alert("Erro ao acessar microfone.");
        }
    };

    const stopMic = () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (sourceRef.current) {
            sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
            sourceRef.current.disconnect();
        }
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        setIsMicOn(false);
        setPitchNote('-');
        setPitchOctave(null);
        setPitchMidi(0);
        setPitchCents(0);
    };

    const updatePitch = () => {
        if (!analyserRef.current) return;
        const buf = new Float32Array(analyserRef.current.fftSize);
        analyserRef.current.getFloatTimeDomainData(buf);
        const freq = autoCorrelate(buf, audioContextRef.current?.sampleRate || 44100);

        if (freq !== -1 && freq > 50 && freq < 1400) {
            const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
            const midi = Math.round(noteNum) + 69;
            const note = NOTE_STRINGS[midi % 12];
            const octave = Math.floor(midi / 12) - 1;

            // Cents calculation for Tuner
            const idealFreq = 440 * Math.pow(2, (midi - 69) / 12);
            const cents = 1200 * Math.log2(freq / idealFreq);

            setPitchNote(note);
            setPitchOctave(octave);
            setPitchMidi(midi);
            setPitchCents(cents);
        }
        rafIdRef.current = requestAnimationFrame(updatePitch);
    };

    useEffect(() => {
        if (activeView === 'vocal_test' && isMicOn && pitchMidi > 0) {
            if (rangeStep === 'low') {
                if (pitchMidi > 33) {
                    if (detectedLowMidi === null || pitchMidi < detectedLowMidi) {
                        setDetectedLowMidi(pitchMidi);
                        setRangeAnalysisStatus(`Detectado: ${getNoteStringFromMidi(pitchMidi)}`);
                    }
                }
            } else if (rangeStep === 'high') {
                if (pitchMidi < 96) {
                    if (detectedHighMidi === null || pitchMidi > detectedHighMidi) {
                        setDetectedHighMidi(pitchMidi);
                        setRangeAnalysisStatus(`Detectado: ${getNoteStringFromMidi(pitchMidi)}`);
                    }
                }
            }
        }
    }, [pitchMidi, activeView, isMicOn, rangeStep, detectedLowMidi, detectedHighMidi]);

    const calculateClassification = () => {
        stopMic();
        if (detectedLowMidi && detectedHighMidi) {

            // 1. Filtrar por Gênero
            const genderRanges = VOCAL_RANGES_DATA.filter(r => r.type === vocalGender);

            let bestMatch = 'Indefinido';
            let maxScore = -999;

            const userLow = detectedLowMidi;
            const userHigh = detectedHighMidi;

            genderRanges.forEach(range => {
                let score = 0;

                // Critério 1: Overlap com a região de referência (Core Range)
                const rangeMin = range.min;
                const rangeMax = range.max;
                const rangeSpan = rangeMax - rangeMin;

                // Calcular intersecção
                const overlapStart = Math.max(userLow, rangeMin);
                const overlapEnd = Math.min(userHigh, rangeMax);
                const overlap = Math.max(0, overlapEnd - overlapStart);

                // Pontuação por cobertura da região fundamental da voz
                if (rangeSpan > 0) {
                    score += (overlap / rangeSpan) * 20; // Peso alto para "ter as notas da classificação"
                }

                // Critério 2: Ajuste por Conforto Declarado (Peso: 5 pontos)
                if (comfortZone === 'grave') {
                    if (range.name === 'Baixo' || range.name === 'Contralto') score += 15;
                    else if (range.name === 'Barítono' || range.name === 'Mezzo-soprano') score += 5;
                }
                if (comfortZone === 'medio') {
                    if (range.name === 'Barítono' || range.name === 'Mezzo-soprano') score += 15;
                    else if (range.name === 'Tenor' || range.name === 'Contralto') score += 5;
                }
                if (comfortZone === 'agudo') {
                    if (range.name === 'Tenor' || range.name === 'Soprano') score += 15;
                    else if (range.name === 'Mezzo-soprano') score += 5;
                }

                // Critério 3: Penalidade se a dificuldade for na região principal da voz
                if (difficultyZone === 'grave') {
                    if (range.name === 'Baixo' || range.name === 'Contralto') score -= 10;
                }
                if (difficultyZone === 'agudo') {
                    if (range.name === 'Tenor' || range.name === 'Soprano') score -= 10;
                }

                // Critério 4: Penalidade se o range do usuário não alcança o mínino essencial da voz
                // Ex: Se quer ser baixo mas não tem o E2 (40), perde ponto. (No caso E1-28)
                if (userLow > rangeMin + 7) { // Se o grave do user é muito mais agudo que o minimo da voz
                    score -= 20;
                }

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = range.name;
                }
            });

            setVocalType(bestMatch);
            setUserVocalRange(`${getNoteStringFromMidi(detectedLowMidi)} - ${getNoteStringFromMidi(detectedHighMidi)}`);
            setRangeStep('result');
        } else {
            // Fallback
            setRangeStep('result');
        }
    };

    const resetTest = () => {
        setRangeStep('intro');
        setDetectedLowMidi(null);
        setDetectedHighMidi(null);
        setVocalType('Indefinido');
        setUserVocalRange('--');
        setRangeAnalysisStatus('Aguardando som...');
        stopMic();
    };

    const playNote = async (note: string) => {
        if (!synthRef.current) {
            synthRef.current = new Tone.Synth().toDestination();
        }
        try {
            await Tone.start();
            if (Tone.context.state !== 'running') await Tone.context.resume();
            synthRef.current.triggerAttackRelease(note, "8n");
        } catch (err) {
            console.error("Audio playback error:", err);
        }
    };

    const handleCopyPix = () => {
        navigator.clipboard.writeText("lorenapimenteloficial@gmail.com");
        setPixCopyStatus('Copiado!');
        setTimeout(() => setPixCopyStatus('Copiar Chave'), 2000);
    };

    // --- LÓGICA DE ASSINATURA ---
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = '#0081FF';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsSigning(true);
        setHasSignature(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isSigning) return;
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsSigning(false);
    };

    const clearSignature = () => {
        const canvas = signatureCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    // --- RENDERIZADORES DE VIEW ---

    const renderHeader = (title: string, onBackAction: () => void) => (
        <div className="pt-8 px-6 pb-4 bg-[#101622]/95 z-20 border-b border-white/5 flex items-center gap-3 sticky top-0">
            <button
                onClick={onBackAction}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
                <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
    );

    const renderMenu = () => (
        <div className="flex-1 overflow-y-auto hide-scrollbar animate-in slide-in-from-left duration-300">
            {/* Header Profile Info */}
            <div className="pt-10 px-6 pb-8 bg-gradient-to-b from-[#1A202C] to-[#101622] text-center border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[150%] h-[200px] bg-[#0081FF]/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto rounded-full p-[3px] bg-brand-gradient mb-4 shadow-xl shadow-blue-900/20">
                        <div className="w-full h-full rounded-full bg-[#151A23] p-1">
                            <img
                                src={user?.avatarUrl || 'https://picsum.photos/200'}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{user?.name || 'Visitante'}</h2>
                    <div className="flex justify-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#0081FF]/10 text-[#0081FF] border border-[#0081FF]/20 text-[10px] font-bold uppercase tracking-wider">
                            {user?.role === 'admin' ? 'Fundador / ADM' : (user?.role === 'teacher' ? 'Professor' : 'Aluno Pro')}
                        </span>
                        {vocalType !== 'Indefinido' && (
                            <span className="px-3 py-1 rounded-full bg-[#6F4CE7]/10 text-[#6F4CE7] border border-[#6F4CE7]/20 text-[10px] font-bold uppercase tracking-wider">
                                {vocalType}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Seção Ferramentas */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Meu Estúdio</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setActiveView('vocal_test')}
                            className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 hover:border-[#6F4CE7]/50 transition-all group text-left relative overflow-hidden hover:shadow-lg hover:shadow-purple-900/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#6F4CE7]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-10 h-10 rounded-xl bg-[#6F4CE7]/20 flex items-center justify-center text-[#6F4CE7] mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-rounded">graphic_eq</span>
                            </div>
                            <h4 className="font-bold text-white text-sm">Extensão Vocal</h4>
                            <p className="text-[10px] text-gray-500 mt-1">Descubra sua classificação.</p>
                        </button>

                        <button
                            onClick={() => setActiveView('piano')}
                            className="bg-[#1A202C] p-4 rounded-2xl border border-white/5 hover:border-[#FF00BC]/50 transition-all group text-left relative overflow-hidden hover:shadow-lg hover:shadow-pink-900/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF00BC]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-10 h-10 rounded-xl bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC] mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-rounded">piano</span>
                            </div>
                            <h4 className="font-bold text-white text-sm">Piano Virtual</h4>
                            <p className="text-[10px] text-gray-500 mt-1">Teclado para treino.</p>
                        </button>

                        <button
                            onClick={() => setActiveView('tuner')}
                            className="col-span-2 bg-[#1A202C] p-4 rounded-2xl border border-white/5 hover:border-[#0081FF]/50 transition-all group flex items-center gap-4 relative overflow-hidden hover:shadow-lg hover:shadow-blue-900/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0081FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-10 h-10 rounded-xl bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF] group-hover:scale-110 transition-transform shrink-0">
                                <span className="material-symbols-rounded">tune</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Afinador Cromático</h4>
                                <p className="text-[10px] text-gray-500 mt-0.5">Verifique sua afinação em tempo real.</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Seção Minha Conta */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">Minha Conta</h3>
                    <div className="bg-[#1A202C] rounded-2xl border border-white/5 overflow-hidden">
                        <button
                            onClick={() => setActiveView('personal_data')}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <span className="material-symbols-rounded text-lg">person</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-semibold text-white block">Dados Pessoais</span>
                                    <span className="text-[10px] text-gray-500 block">Nome, contato e bio</span>
                                </div>
                            </div>
                            <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                        </button>

                        {/* Ocultar Assinatura para Admins/Professores */}
                        {(user?.role !== 'admin' && user?.role !== 'teacher') && (
                            <button
                                onClick={() => setActiveView('subscription')}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                                        <span className="material-symbols-rounded text-lg">credit_card</span>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-semibold text-white block">Assinatura</span>
                                        <span className="text-[10px] text-gray-500 block">Gerenciar plano e pagamentos</span>
                                    </div>
                                </div>
                                <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                            </button>
                        )}

                        <button
                            onClick={() => setActiveView('contract')}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-t border-white/5"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                                    <span className="material-symbols-rounded text-lg">description</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-sm font-semibold text-white block">Contrato de Matrícula</span>
                                    <span className="text-[10px] text-gray-500 block">Visualizar e assinar termos</span>
                                </div>
                            </div>
                            <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                        </button>

                        {/* Mostrar Painel Administrativo para Admins e Professores */}
                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <button
                                onClick={() => onNavigate(Screen.ADMIN_DASHBOARD)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <span className="material-symbols-rounded text-lg">admin_panel_settings</span>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-semibold text-white block">Painel Administrativo</span>
                                        <span className="text-sm text-gray-500 block">Financeiro, Relatórios e Gestão ADM</span>
                                    </div>
                                </div>
                                <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                            </button>
                        )}

                        {/* Ajustes - Exclusivo para Admins/Professores por enquanto, pois leva ao TeacherDashboard */}
                        {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <button
                                onClick={() => onNavigate(Screen.ADMIN_SETTINGS)}
                                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-400">
                                        <span className="material-symbols-rounded text-lg">settings</span>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-sm font-semibold text-white block">Ajustes</span>
                                        <span className="text-[10px] text-gray-500 block">Configurações do App</span>
                                    </div>
                                </div>
                                <span className="material-symbols-rounded text-gray-600">chevron_right</span>
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full py-4 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/5 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-rounded">logout</span>
                    Sair da Conta
                </button>

                <div className="text-center pb-8 pt-4">
                    <p className="text-[10px] text-gray-600">Versão 2.1.0 • Build 2405</p>
                    <div className="flex justify-center mt-2 opacity-30">
                        <Logo size="sm" />
                    </div>
                </div>
            </div >
        </div >
    );

    const renderPersonalData = () => (
        <div className="flex-1 flex flex-col bg-[#101622] animate-in slide-in-from-right">
            {renderHeader('Dados Pessoais', () => setActiveView('menu'))}

            <div className="p-6 flex-1 overflow-y-auto hide-scrollbar">
                <div className="bg-[#1A202C] p-6 rounded-2xl border border-white/5 mb-6 text-center">
                    <div className="relative inline-block mb-4">
                        <img
                            src={user?.avatarUrl}
                            className="w-20 h-20 rounded-full border-2 border-white/10"
                            alt="Avatar"
                        />
                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0081FF] border-2 border-[#1A202C] flex items-center justify-center text-white">
                            <span className="material-symbols-rounded text-sm">edit</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">Toque para alterar a foto</p>
                </div>

                <div className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                        <input
                            type="text"
                            value={formData.name}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-12 bg-[#1A202C] rounded-xl border border-white/10 px-4 text-white text-sm focus:border-[#0081FF] disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-mail</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled={true}
                            className="w-full h-12 bg-[#1A202C] rounded-xl border border-white/10 px-4 text-gray-400 text-sm opacity-50 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-gray-600 ml-1">O e-mail não pode ser alterado.</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Telefone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-12 bg-[#1A202C] rounded-xl border border-white/10 px-4 text-white text-sm focus:border-[#0081FF] disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Bio / Objetivos</label>
                        <textarea
                            value={formData.bio}
                            disabled={!isEditing}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full h-24 bg-[#1A202C] rounded-xl border border-white/10 p-4 text-white text-sm focus:border-[#0081FF] disabled:opacity-50 resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#151A23]">
                {isEditing ? (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="w-full h-12 rounded-xl bg-[#0081FF] text-white font-bold hover:bg-[#006bd1] transition-colors"
                    >
                        Salvar Alterações
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-full h-12 rounded-xl bg-white/5 border border-white/5 text-white font-bold hover:bg-white/10 transition-colors"
                    >
                        Editar Perfil
                    </button>
                )}
            </div>
        </div>
    );

    const renderSubscription = () => (
        <div className="flex-1 flex flex-col bg-[#101622] animate-in slide-in-from-right">
            {renderHeader('Assinatura', () => setActiveView('menu'))}

            <div className="p-6 flex-1 overflow-y-auto hide-scrollbar">
                {/* Cartão do Plano Customizado com Nova Arte */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-purple-900/30 group bg-black">
                    <img
                        src="https://sedjnyryixudxmmkeoam.supabase.co/storage/v1/object/public/VOCALIZES%20mp3/Fotos/Capa%20Pagamento.png"
                        alt="Cartão Assinatura"
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Overlay Content */}
                    <div className="relative z-10 flex flex-col justify-between h-full p-6">
                        <div className="flex justify-between items-start">
                            <div></div> {/* Empty Left Side */}
                            <span className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm text-white border border-white/10 shadow-sm">PRO</span>
                        </div>

                        {/* Status Moved to Right */}
                        <div className="text-right">
                            <p className="text-xs text-white/90 mb-1 font-medium drop-shadow-md shadow-black">Status do Plano</p>
                            <div className="flex items-center justify-end gap-2">
                                {user?.status === 'blocked' ? (
                                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span>
                                ) : user?.status === 'overdue' ? (
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]"></span>
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]"></span>
                                )}
                                <span className="text-lg font-bold text-white drop-shadow-md shadow-black">
                                    {user?.status === 'blocked' ? 'Bloqueado' : user?.status === 'overdue' ? 'Em Atraso' : 'Ativo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-white font-bold mb-3">Detalhes do Plano</h3>
                        <div className="bg-[#1A202C] rounded-xl border border-white/5 divide-y divide-white/5">
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm text-gray-400">Renovação</span>
                                <span className="text-sm text-white font-medium">{formatDateBR(user?.nextDueDate)}</span>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm text-gray-400">Valor</span>
                                <span className="text-sm text-white font-medium">R$ {user?.amount || '0,00'} / mês</span>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-sm text-gray-400">Forma de Pagamento</span>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-rounded text-gray-400 text-sm">credit_card</span>
                                    <span className="text-sm text-white font-medium">PIX / Cartão</span>
                                </div>
                            </div>

                            {/* Chave PIX adicionada aqui */}
                            <div className="p-4 bg-white/5 flex flex-col gap-2">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Chave PIX (E-mail)</span>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-[#101622] border border-white/10 rounded-lg px-3 py-2 flex items-center">
                                        <span className="text-xs text-white font-mono select-all truncate">
                                            lorenapimenteloficial@gmail.com
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopyPix}
                                        className={`px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${pixCopyStatus === 'Copiado!'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        <span className="material-symbols-rounded text-sm">
                                            {pixCopyStatus === 'Copiado!' ? 'check' : 'content_copy'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-3">Histórico</h3>
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                            <span className="material-symbols-rounded text-sm">check</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium">Pagamento Efetuado</p>
                                            <p className="text-[10px] text-gray-500">02 de {['Janeiro', 'Dezembro', 'Novembro'][i - 1]}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-300">R$ 97,00</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );



    const renderContract = () => (
        <div className="flex-1 flex flex-col bg-[#101622] animate-in slide-in-from-right">
            {renderHeader('Contrato de Matrícula', () => setActiveView('menu'))}

            <div className="p-6 flex-1 overflow-y-auto hide-scrollbar space-y-8 pb-32">
                {/* Student Card */}
                <div className="bg-[#1A202C] rounded-3xl p-6 border border-white/5 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={user?.avatarUrl} className="w-16 h-16 rounded-full border-2 border-[#0081FF]/30 p-0.5" alt="" />
                        <div>
                            <h4 className="text-lg font-bold text-white leading-tight">{user?.name}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Plano {user?.plan || 'Vocalizes Pro'}</p>
                        </div>
                    </div>

                    <div className="bg-[#101622] rounded-2xl p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mensalidade</span>
                            <span className="text-sm font-black text-[#0081FF]">R$ {user?.amount || '97,00'}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-3">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Vencimento</span>
                            <div className="flex items-center gap-2">
                                {isEditingDueDate ? (
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={editDueDateDay}
                                            onChange={(e) => setEditDueDateDay(e.target.value.padStart(2, '0'))}
                                            className="w-12 h-8 bg-[#101622] border border-[#0081FF]/30 rounded-lg text-center text-sm font-bold text-white focus:outline-none"
                                        />
                                        <button
                                            onClick={() => setIsEditingDueDate(false)}
                                            className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center"
                                        >
                                            <span className="material-symbols-rounded text-sm">check</span>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-sm font-bold text-white uppercase">Todo dia: {editDueDateDay} do mês</span>
                                        <button
                                            onClick={() => {
                                                setEditDueDateDay(formatDayOfMonth(user?.nextDueDate));
                                                setIsEditingDueDate(true);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center hover:text-white"
                                        >
                                            <span className="material-symbols-rounded text-sm">edit</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                    <h3 className="text-xl font-black text-white tracking-tight">Termos e Condições</h3>
                    <div className="bg-[#1A202C] rounded-3xl p-6 border border-white/5 space-y-6 max-h-[400px] overflow-y-auto hide-scrollbar">
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">1. Sobre este contrato</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Este contrato estabelece as regras da prestação de serviços educacionais entre a Escola de Música e o Aluno.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">2. Serviços oferecidos</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                A escola oferece aulas conforme o plano contratado, além de acesso ao App com conteúdos pedagógicos.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">3. Compromissos do aluno</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                O aluno deve comparecer às aulas, avisar faltas com antecedência e manter os pagamentos em dia.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">4. Faltas e reposição</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Avisos devem ser feitos com no mínimo 24 horas de antecedência. Faltas sem aviso ou feriados nacionais não geram reposição.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">5. Pagamentos</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                O pagamento deve ser realizado até a data de vencimento acordada.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">6. Bloqueio por atraso</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Após 7 dias de atraso, o acesso ao App será automaticamente bloqueado até a regularização.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">7. Atrasos nas aulas</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Há tolerância de até 10 minutos. A aula termina no horário previsto.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">8. Cancelamento</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Cancelamentos devem ser solicitados com 30 dias de antecedência.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">9. Uso do App</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                O conteúdo é de uso exclusivo do aluno e não pode ser compartilhado.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">10. Boa-fé</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Situações não previstas serão resolvidas com diálogo e bom senso.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-bold text-white text-sm">11. Férias e funcionamento em modelo híbrido</h5>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                A escola atua em modelo híbrido, com atividades presenciais e digitais por meio do App. Durante as férias ou recesso, as aulas presenciais são suspensas, mas o processo continua via App com rotinas de estudos e conteúdos orientados. Por ser um plano contínuo, a mensalidade permanece ativa para assegurar sua vaga e o acesso à plataforma. As aulas presenciais retornam normalmente ao término do recesso.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Digital Signature */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <h3 className="text-lg font-black text-white">Assinatura Digital</h3>
                        <button onClick={clearSignature} className="text-[10px] font-black text-[#0081FF] uppercase hover:underline">Limpar Assinatura</button>
                    </div>
                    <div className="relative bg-white/5 border-2 border-dashed border-white/10 rounded-3xl h-48 overflow-hidden">
                        <canvas
                            ref={signatureCanvasRef}
                            width={400}
                            height={200}
                            className="w-full h-full cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                        {!hasSignature && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <p className="text-gray-600 font-bold text-sm">Assine aqui com o dedo</p>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-600 text-center italic">Ao assinar, você confirma ser o responsável legal ou o próprio aluno (se maior de idade).</p>
                </div>

                {/* Footer Agreement */}
                <div className="bg-[#101622] pt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${contractAgreed ? 'bg-[#0081FF] border-[#0081FF]' : 'border-white/10 bg-white/5 group-hover:border-white/20'}`}>
                            {contractAgreed && <span className="material-symbols-rounded text-white text-lg">check</span>}
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={contractAgreed}
                                onChange={(e) => setContractAgreed(e.target.checked)}
                            />
                        </div>
                        <span className="text-xs text-gray-300 font-bold flex-1">
                            Li e concordo com todos os termos e condições descritos no contrato acima.
                        </span>
                    </label>

                    <button
                        disabled={!contractAgreed || !hasSignature}
                        onClick={() => {
                            alert("Contrato assinado com sucesso!");
                            setActiveView('menu');
                        }}
                        className="w-full h-14 rounded-2xl bg-[#0081FF] text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-30 disabled:grayscale transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="material-symbols-rounded">edit_square</span>
                        Assinar e Confirmar
                    </button>
                </div>
            </div>
        </div>
    );

    const renderTuner = () => (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right">
            {renderHeader('Afinador', () => { stopMic(); setActiveView('menu'); })}

            <div className="flex-1 flex flex-col items-center justify-center p-6">
                {!isMicOn ? (
                    <div className="text-center">
                        <div className="w-24 h-24 bg-[#1A202C] rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <span className="material-symbols-rounded text-4xl text-gray-500">mic_off</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                            Ative o microfone para começar a detectar a nota que você está cantando.
                        </p>
                        <button
                            onClick={startMic}
                            className="px-8 py-3 rounded-xl bg-[#0081FF] text-white font-bold hover:bg-[#006bd1] transition-colors shadow-lg shadow-blue-900/20"
                        >
                            Ligar Microfone
                        </button>
                    </div>
                ) : (
                    <div className="text-center w-full max-w-xs">
                        <div className={`relative w-64 h-64 mx-auto rounded-full border-8 flex items-center justify-center transition-colors duration-300 ${Math.abs(pitchCents) < 10 && pitchNote !== '-' ? 'border-green-500 bg-green-500/5' : 'border-[#1A202C] bg-[#1A202C]'
                            }`}>
                            <div>
                                <div className="text-8xl font-bold text-white font-mono tracking-tighter">
                                    {pitchNote}
                                </div>
                                {pitchOctave !== null && (
                                    <div className="text-2xl text-gray-500 font-medium">
                                        {pitchOctave}
                                    </div>
                                )}
                            </div>

                            {/* Gauge Needle */}
                            {pitchNote !== '-' && (
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-red-500 origin-center transition-transform duration-100 ease-linear rounded-full opacity-70"
                                    style={{ transform: `rotate(${pitchCents}deg)` }}
                                ></div>
                            )}
                        </div>

                        <div className="mt-8 flex justify-center items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${pitchCents < -10 ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">
                                {Math.abs(pitchCents) < 10 && pitchNote !== '-' ? 'AFINADO' : (pitchCents < 0 ? 'BAIXO' : 'ALTO')}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${pitchCents > 10 ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                        </div>

                        <button
                            onClick={stopMic}
                            className="mt-12 px-6 py-2 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10 transition-colors"
                        >
                            Parar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderVocalTest = () => (
        <div className="flex-1 flex flex-col relative animate-in zoom-in-95 duration-300">
            {/* Header Específico do Teste with close capability */}
            <div className="pt-8 px-6 pb-2 flex items-center justify-between z-10">
                <button
                    onClick={() => {
                        stopMic();
                        setActiveView('menu');
                        setRangeStep('intro');
                    }}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10"
                >
                    <span className="material-symbols-rounded">close</span>
                </button>
                <h2 className="font-bold text-white text-sm uppercase tracking-widest">Analisador Vocal</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#6F4CE7]/20 blur-[100px] rounded-full pointer-events-none"></div>

                {/* STEP 1: INTRO */}
                {rangeStep === 'intro' && (
                    <div className="text-center w-full max-w-sm animate-in fade-in relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-tr from-[#0081FF] to-[#6F4CE7] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-900/40">
                            <span className="material-symbols-rounded text-5xl text-white">mic</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">Descubra sua Voz</h2>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed px-4">
                            Este teste identificará sua classificação vocal com base na sua extensão e tessitura confortável.
                        </p>

                        <div className="bg-[#1A202C] p-4 rounded-xl border border-yellow-500/20 mb-8 mx-2">
                            <p className="text-xs text-yellow-500 text-left">
                                <span className="font-bold block mb-1">⚠  Importante</span>
                                Este teste não substitui um professor de canto. A classificação vocal pode mudar conforme sua técnica evolui.
                            </p>
                        </div>

                        <button
                            onClick={() => { setRangeStep('gender_select'); }}
                            className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg"
                        >
                            Começar
                        </button>
                    </div>
                )}

                {/* STEP 2: GENDER SELECTION */}
                {rangeStep === 'gender_select' && (
                    <div className="text-center w-full max-w-sm animate-in slide-in-from-right relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-6">Qual seu sexo vocal?</h2>
                        <p className="text-gray-400 text-sm mb-8">
                            Isso ajuda a calibrar os parâmetros de classificação base.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => { setVocalGender('Feminina'); setRangeStep('low'); startMic(); }}
                                className="w-full p-4 rounded-2xl bg-[#1A202C] border border-white/10 hover:border-[#FF00BC]/50 flex items-center gap-4 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#FF00BC]/20 flex items-center justify-center text-[#FF00BC]">
                                    <span className="material-symbols-rounded">female</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-bold">Voz Feminina</h3>
                                    <p className="text-xs text-gray-500">Agudos naturais</p>
                                </div>
                            </button>

                            <button
                                onClick={() => { setVocalGender('Masculina'); setRangeStep('low'); startMic(); }}
                                className="w-full p-4 rounded-2xl bg-[#1A202C] border border-white/10 hover:border-[#0081FF]/50 flex items-center gap-4 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#0081FF]/20 flex items-center justify-center text-[#0081FF]">
                                    <span className="material-symbols-rounded">male</span>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-bold">Voz Masculina</h3>
                                    <p className="text-xs text-gray-500">Graves naturais</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3 & 4: DETECTION (LOW & HIGH) */}
                {(rangeStep === 'low' || rangeStep === 'high') && (
                    <div className="text-center w-full max-w-sm animate-in slide-in-from-right relative z-10">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 ${rangeStep === 'low' ? 'bg-[#0081FF]/20 text-[#0081FF]' : 'bg-[#FF00BC]/20 text-[#FF00BC]'}`}>
                            {rangeStep === 'low' ? 'Passo 2: Graves' : 'Passo 3: Agudos'}
                        </span>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            {rangeStep === 'low' ? 'Desça o tom...' : 'Suba o tom...'}
                        </h2>
                        <p className="text-gray-400 text-sm mb-8">
                            {rangeStep === 'low' ? 'Faça um "Uooo" bem grave (sem vocal fry).' : 'Faça um "Iiiii" agudo (confortável, sem gritar).'}
                        </p>

                        <div className="bg-[#1A202C]/80 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/10 relative overflow-hidden shadow-2xl">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-2">Nota Detectada</p>
                            <div className="text-7xl font-bold text-white mb-2 font-mono tracking-tighter">
                                {pitchNote !== '-' ? `${pitchNote}${pitchOctave}` : '--'}
                            </div>
                            <div className={`h-1 w-full rounded-full overflow-hidden bg-gray-800 mt-4`}>
                                <div className={`h-full transition-all duration-100 ${pitchNote !== '-' ? (rangeStep === 'low' ? 'bg-[#0081FF] w-full' : 'bg-[#FF00BC] w-full') : 'w-0'}`}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl mb-8">
                            <span className="text-gray-400 text-xs">Melhor registro:</span>
                            <span className="text-xl font-bold text-white font-mono">
                                {rangeStep === 'low'
                                    ? (detectedLowMidi ? getNoteStringFromMidi(detectedLowMidi) : '--')
                                    : (detectedHighMidi ? getNoteStringFromMidi(detectedHighMidi) : '--')}
                            </span>
                        </div>

                        {rangeStep === 'low' ? (
                            <button
                                onClick={() => { if (detectedLowMidi) { setRangeStep('high'); setRangeAnalysisStatus('Aguardando agudos...'); } }}
                                disabled={!detectedLowMidi}
                                className="w-full py-4 rounded-xl bg-[#0081FF] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#006bd1] transition-colors"
                            >
                                Ir para Agudos
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setRangeStep('low'); setDetectedLowMidi(null); setRangeAnalysisStatus('Reiniciando...'); }}
                                    className="px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold"
                                >
                                    <span className="material-symbols-rounded">undo</span>
                                </button>
                                <button
                                    onClick={() => { if (detectedHighMidi) { stopMic(); setRangeStep('questionnaire'); } }}
                                    disabled={!detectedHighMidi}
                                    className="flex-1 py-4 rounded-2xl bg-[#FF00BC] text-white font-bold disabled:opacity-50 disabled:bg-gray-700 transition-all font-mono"
                                >
                                    Confirmar
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] text-gray-500 mt-6 max-w-xs mx-auto">
                            Mantenha a nota por alguns segundos para estabilizar a detecção.
                        </p>
                    </div>
                )}

                {/* STEP 4: QUESTIONNAIRE (Tessitura) */}
                {rangeStep === 'questionnaire' && (
                    <div className="text-center w-full max-w-sm animate-in slide-in-from-right relative z-10 pb-10">
                        <h2 className="text-xl font-bold text-white mb-2">Para finalizar...</h2>
                        <p className="text-gray-400 text-xs mb-6">Isso refina o resultado além da extensão pura.</p>

                        <div className="space-y-6 text-left">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Onde sua voz é mais CONFORTÁVEL?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['grave', 'medio', 'agudo'].map((zone) => (
                                        <button
                                            key={zone}
                                            onClick={() => setComfortZone(zone as any)}
                                            className={`py-3 rounded-lg border text-sm font-bold capitalize ${comfortZone === zone ? 'bg-[#0081FF] border-[#0081FF] text-white' : 'bg-[#1A202C] border-white/10 text-gray-400'}`}
                                        >
                                            {zone}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Onde você tem mais DIFICULDADE (Quebras/Tensão)?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['grave', 'medio', 'agudo'].map((zone) => (
                                        <button
                                            key={zone}
                                            onClick={() => setDifficultyZone(zone as any)}
                                            className={`py-3 rounded-lg border text-sm font-bold capitalize ${difficultyZone === zone ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-[#1A202C] border-white/10 text-gray-400'}`}
                                        >
                                            {zone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={calculateClassification}
                            className="w-full mt-8 py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg"
                        >
                            Ver Resultado
                        </button>
                    </div>
                )}

                {/* STEP 5: RESULT */}
                {rangeStep === 'result' && (
                    <div className="flex-1 w-full max-w-md animate-in zoom-in-50 duration-500 flex flex-col pb-8">
                        {/* Result Card */}
                        <div className="flex-1 bg-gradient-to-b from-[#1A202C] to-[#151A23] rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center mb-6">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">Classificação Sugerida</p>

                            <h2 className="text-4xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
                                {vocalType}
                            </h2>
                            <div className="h-1 w-16 bg-[#0081FF] rounded-full mb-6"></div>

                            <div className="w-full bg-[#101622] rounded-xl p-4 border border-white/5 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-gray-500 font-bold uppercase">Extensão Detectada</span>
                                    <span className="text-xs text-[#0081FF] font-mono">{userVocalRange}</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                                    {/* Visual Bar representation - simplified */}
                                    <div className="absolute left-[10%] right-[10%] top-0 bottom-0 bg-white/10"></div>
                                    <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-[#0081FF] shadow-[0_0_10px_#0081FF]"></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                                    <span>Grave (Conforto)</span>
                                    <span>Agudo (Limite)</span>
                                </div>
                            </div>

                            {/* Educational Info */}
                            <div className="bg-[#0081FF]/10 rounded-lg p-4 border border-[#0081FF]/20 text-left w-full">
                                <h4 className="text-[#0081FF] text-xs font-bold mb-1 flex items-center gap-1">
                                    <span className="material-symbols-rounded text-sm">info</span>
                                    Entenda seu resultado
                                </h4>
                                <p className="text-[10px] text-gray-300 leading-relaxed">
                                    Sua classificação é baseada na tessitura (onde sua voz brilha) e não apenas na nota mais aguda.
                                    <strong> Extensão</strong> é tudo que você canta; <strong>Tessitura</strong> é onde você canta com qualidade.
                                    Não se prenda a rótulos: sua voz pode mudar com o treino!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={resetTest}
                                className="flex-1 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors border border-white/5"
                            >
                                Refazer Teste
                            </button>
                            <button
                                onClick={() => { stopMic(); setActiveView('menu'); }}
                                className="flex-1 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg"
                            >
                                Concluir
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // --- RENDER MAIN ---
    return (
        <div className="min-h-screen bg-[#101622] flex flex-col relative overflow-hidden">
            {activeView === 'menu' && renderMenu()}
            {activeView === 'personal_data' && renderPersonalData()}
            {activeView === 'subscription' && renderSubscription()}
            {activeView === 'contract' && renderContract()}
            {activeView === 'vocal_test' && renderVocalTest()}
            {activeView === 'piano' && <PianoScreen onBack={() => setActiveView('menu')} />}
            {activeView === 'tuner' && renderTuner()}
        </div>
    );
};
