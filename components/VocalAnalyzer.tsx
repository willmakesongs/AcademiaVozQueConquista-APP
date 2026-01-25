
import React, { useState, useEffect, useRef } from 'react';
import { autoCorrelate, getNoteFromFrequency, getNoteStringFromMidi, VOCAL_RANGES_DATA, NOTE_STRINGS } from '../utils/vocalUtils';

interface Props {
    onBack: () => void;
    onComplete?: (result: { type: string; range: string; gender: string }) => void;
}

export const VocalAnalyzer: React.FC<Props> = ({ onBack, onComplete }) => {
    // Standard Vocal Analyzer States
    const [rangeStep, setRangeStep] = useState<'intro' | 'gender_select' | 'low' | 'high' | 'questionnaire' | 'result'>('intro');
    const [pitchNote, setPitchNote] = useState<string>('-');
    const [pitchOctave, setPitchOctave] = useState<number>(0);
    const [detectedLowMidi, setDetectedLowMidi] = useState<number | null>(null);
    const [detectedHighMidi, setDetectedHighMidi] = useState<number | null>(null);
    const [rangeAnalysisStatus, setRangeAnalysisStatus] = useState<string>('Aguardando...');
    const [comfortZone, setComfortZone] = useState<'grave' | 'medio' | 'agudo'>('medio');
    const [difficultyZone, setDifficultyZone] = useState<'grave' | 'medio' | 'agudo'>('agudo');
    const [vocalType, setVocalType] = useState<string>('Buscando...');
    const [userVocalRange, setUserVocalRange] = useState<string>('C2 - C4');
    const [vocalGender, setVocalGender] = useState<string>('Masculina');

    // Audio Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const javascriptNodeRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopMic = () => {
        if (javascriptNodeRef.current) javascriptNodeRef.current.onaudioprocess = null;
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(e => console.error("Error closing context", e));
        }
    };

    const startMic = async () => {
        try {
            stopMic(); // Reset any previous
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;

            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;

            const microphone = audioContext.createMediaStreamSource(stream);
            microphoneRef.current = microphone;

            const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
            javascriptNodeRef.current = javascriptNode;

            microphone.connect(analyser);
            analyser.connect(javascriptNode);
            javascriptNode.connect(audioContext.destination);

            javascriptNode.onaudioprocess = () => {
                const buffer = new Float32Array(analyser.fftSize);
                analyser.getFloatTimeDomainData(buffer);
                const fundalmentalFreq = autoCorrelate(buffer, audioContext.sampleRate);

                if (fundalmentalFreq !== -1) {
                    const midi = getNoteFromFrequency(fundalmentalFreq);
                    const noteStr = NOTE_STRINGS[midi % 12];
                    const oct = Math.floor(midi / 12) - 1;

                    setPitchNote(noteStr);
                    setPitchOctave(oct);

                    // Update detections based on step
                    if (rangeStep === 'low') {
                        setDetectedLowMidi(prev => (prev === null || midi < prev) ? midi : prev);
                    } else if (rangeStep === 'high') {
                        setDetectedHighMidi(prev => (prev === null || midi > prev) ? midi : prev);
                    }
                }
            };
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setRangeAnalysisStatus('Erro ao acessar microfone. Verifique as permissões.');
        }
    };

    const calculateClassification = () => {
        if (!detectedLowMidi || !detectedHighMidi) return;

        const lowNote = getNoteStringFromMidi(detectedLowMidi);
        const highNote = getNoteStringFromMidi(detectedHighMidi);
        setUserVocalRange(`${lowNote} - ${highNote}`);

        // Find match in VOCAL_RANGES_DATA
        const filtered = VOCAL_RANGES_DATA.filter(r => r.type === vocalGender);

        let bestMatch = filtered[0];
        let minDiff = 999;

        filtered.forEach(range => {
            const centerMidi = (range.min + range.max) / 2;
            const currentCenter = (detectedLowMidi + detectedHighMidi) / 2;
            const diff = Math.abs(centerMidi - currentCenter);
            if (diff < minDiff) {
                minDiff = diff;
                bestMatch = range;
            }
        });

        // Heurística de Tessitura
        let finalType = bestMatch.name;
        if (vocalGender === 'Masculina') {
            if (comfortZone === 'grave' && detectedLowMidi < 35) finalType = 'Baixo';
            else if (comfortZone === 'agudo' && detectedHighMidi > 55) finalType = 'Tenor';
            else if (comfortZone === 'medio') finalType = 'Barítono';
        } else {
            if (comfortZone === 'grave' && detectedLowMidi < 45) finalType = 'Contralto';
            else if (comfortZone === 'agudo' && detectedHighMidi > 68) finalType = 'Soprano';
            else if (comfortZone === 'medio') finalType = 'Mezzo-soprano';
        }

        setVocalType(finalType);
        setRangeStep('result');
        onComplete?.({ type: finalType, range: `${lowNote} - ${highNote}`, gender: vocalGender });
    };

    const resetTest = () => {
        setRangeStep('intro');
        setDetectedLowMidi(null);
        setDetectedHighMidi(null);
        setPitchNote('-');
        setVocalType('Buscando...');
    };

    useEffect(() => {
        return () => stopMic();
    }, []);

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative animate-in zoom-in-95 duration-300 min-h-[400px]">
            {/* STEP 1: INTRO */}
            {rangeStep === 'intro' && (
                <div className="text-center w-full max-w-sm animate-in fade-in relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-tr from-[#0081FF] to-[#6F4CE7] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-900/40">
                        <span className="material-symbols-rounded text-5xl text-white">mic</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3 tracking-tighter">Descubra sua Voz</h2>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed px-4">
                        Este teste identificará sua classificação vocal com base na sua extensão e tessitura confortável.
                    </p>

                    <div className="bg-[#1A202C] p-4 rounded-xl border border-[#6F4CE7]/20 mb-8 mx-2 text-left">
                        <p className="text-[10px] text-[#6F4CE7] uppercase font-bold mb-1">⚠ Importante</p>
                        <p className="text-[11px] text-gray-400">
                            Este teste não substitui um professor de canto. A classificação vocal pode mudar conforme sua técnica evolui.
                        </p>
                    </div>

                    <button
                        onClick={() => { setRangeStep('gender_select'); }}
                        className="w-full py-4 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg"
                    >
                        Começar
                    </button>

                    <button
                        onClick={onBack}
                        className="mt-4 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            )}

            {/* STEP 2: GENDER SELECTION */}
            {rangeStep === 'gender_select' && (
                <div className="text-center w-full max-w-sm animate-in slide-in-from-right relative z-10 px-4">
                    <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Qual seu sexo vocal?</h2>

                    <div className="space-y-4">
                        <button
                            onClick={() => { setVocalGender('Feminina'); setRangeStep('low'); startMic(); }}
                            className="w-full n-p-4 p-4 rounded-2xl bg-[#1A202C] border border-white/10 hover:border-[#FF00BC]/50 flex items-center gap-4 transition-all group"
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
                <div className="text-center w-full max-w-sm animate-in slide-in-from-right relative z-10 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 ${rangeStep === 'low' ? 'bg-[#0081FF]/20 text-[#0081FF]' : 'bg-[#FF00BC]/20 text-[#FF00BC]'}`}>
                        {rangeStep === 'low' ? 'Passo 2: Graves' : 'Passo 3: Agudos'}
                    </span>

                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                        {rangeStep === 'low' ? 'Desça o tom...' : 'Suba o tom...'}
                    </h2>
                    <p className="text-gray-400 text-sm mb-8">
                        {rangeStep === 'low' ? 'Faça um "Uooo" bem grave (sem vocal fry).' : 'Faça um "Iiiii" agudo (confortável, sem gritar).'}
                    </p>

                    <div className="bg-[#1A202C]/80 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/10 relative overflow-hidden shadow-2xl">
                        <p className="text-gray-500 text-[10px] uppercase font-bold mb-2 tracking-widest">Nota Detectada</p>
                        <div className="text-7xl font-bold text-white mb-2 font-mono tracking-tighter">
                            {pitchNote !== '-' ? `${pitchNote}${pitchOctave}` : '--'}
                        </div>
                        <div className={`h-1 w-full rounded-full overflow-hidden bg-gray-800 mt-4`}>
                            <div className={`h-full transition-all duration-100 ${pitchNote !== '-' ? (rangeStep === 'low' ? 'bg-[#0081FF] w-full' : 'bg-[#FF00BC] w-full') : 'w-0'}`}></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl mb-8 border border-white/5">
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Melhor registro:</span>
                        <span className="text-xl font-bold text-white font-mono">
                            {rangeStep === 'low'
                                ? (detectedLowMidi ? getNoteStringFromMidi(detectedLowMidi) : '--')
                                : (detectedHighMidi ? getNoteStringFromMidi(detectedHighMidi) : '--')}
                        </span>
                    </div>

                    {rangeStep === 'low' ? (
                        <button
                            onClick={() => { if (detectedLowMidi) { setRangeStep('high'); } }}
                            disabled={!detectedLowMidi}
                            className="w-full py-4 rounded-xl bg-[#0081FF] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#006bd1] transition-all shadow-lg shadow-blue-500/10"
                        >
                            Ir para Agudos
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setRangeStep('low'); setDetectedLowMidi(null); }}
                                className="px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                            >
                                <span className="material-symbols-rounded">undo</span>
                            </button>
                            <button
                                onClick={() => { if (detectedHighMidi) { stopMic(); setRangeStep('questionnaire'); } }}
                                disabled={!detectedHighMidi}
                                className="flex-1 py-4 rounded-2xl bg-[#FF00BC] text-white font-bold disabled:opacity-50 disabled:bg-gray-800 transition-all font-mono shadow-lg shadow-pink-500/10"
                            >
                                Confirmar
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 4: QUESTIONNAIRE */}
            {rangeStep === 'questionnaire' && (
                <div className="text-center w-full max-w-sm animate-in slide-in-from-right relative z-10 pb-10 px-4">
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Análise de Tessitura</h2>
                    <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest">Refine seu resultado</p>

                    <div className="space-y-8 text-left">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-3 block tracking-widest">Onde sua voz é mais CONFORTÁVEL?</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['grave', 'medio', 'agudo'].map((zone) => (
                                    <button
                                        key={zone}
                                        onClick={() => setComfortZone(zone as any)}
                                        className={`py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${comfortZone === zone ? 'bg-[#0081FF] border-[#0081FF] text-white shadow-lg shadow-blue-500/20' : 'bg-[#1A202C] border-white/5 text-gray-600'}`}
                                    >
                                        {zone}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-3 block tracking-widest">Onde você tem mais DIFICULDADE?</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['grave', 'medio', 'agudo'].map((zone) => (
                                    <button
                                        key={zone}
                                        onClick={() => setDifficultyZone(zone as any)}
                                        className={`py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${difficultyZone === zone ? 'bg-[#FF00BC]/20 border-[#FF00BC] text-[#FF00BC] shadow-lg shadow-pink-500/10' : 'bg-[#1A202C] border-white/5 text-gray-600'}`}
                                    >
                                        {zone}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={calculateClassification}
                        className="w-full mt-10 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors shadow-xl"
                    >
                        Ver Resultado
                    </button>
                </div>
            )}

            {/* STEP 5: RESULT */}
            {rangeStep === 'result' && (
                <div className="flex-1 w-full max-w-md animate-in zoom-in-50 duration-500 flex flex-col pb-8 px-4">
                    <div className="flex-1 bg-gradient-to-b from-[#1A202C] to-[#151A23] rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center mb-6">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0081FF]/40 to-transparent"></div>

                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Classificação Sugerida</p>

                        <h2 className="text-4xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 tracking-tighter text-center">
                            {vocalType}
                        </h2>
                        <div className="h-1 w-16 bg-[#0081FF] rounded-full mb-8 shadow-[0_0_10px_#0081FF]"></div>

                        <div className="w-full bg-black/40 rounded-2xl p-6 border border-white/5 mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Extensão Detectada</span>
                                <span className="text-xs text-[#0081FF] font-black font-mono">{userVocalRange}</span>
                            </div>
                            <div className="h-2 bg-gray-900 rounded-full overflow-hidden relative border border-white/5">
                                <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-[#0081FF]/20"></div>
                                <div className="absolute left-[35%] right-[35%] top-0 bottom-0 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                            </div>
                            <div className="flex justify-between mt-3 text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                                <span>Grave Máximo</span>
                                <span>Agudo Máximo</span>
                            </div>
                        </div>

                        <div className="bg-[#0081FF]/10 rounded-2xl p-5 border border-[#0081FF]/20 text-left w-full">
                            <h4 className="text-[#0081FF] text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                                <span className="material-symbols-rounded text-sm">info</span>
                                Entenda seu resultado
                            </h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                Sua classificação é baseada na tessitura (onde sua voz brilha) e não apenas na nota mais aguda.
                                <strong className="text-white"> Extensão</strong> é tudo que você canta; <strong className="text-white">Tessitura</strong> é onde você canta com qualidade.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={resetTest}
                            className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors border border-white/10 uppercase tracking-widest text-[10px]"
                        >
                            Refazer Teste
                        </button>
                        <button
                            onClick={onBack}
                            className="flex-1 py-4 rounded-2xl bg-white text-black font-black hover:bg-gray-200 transition-colors shadow-lg uppercase tracking-widest text-[10px]"
                        >
                            Concluir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
