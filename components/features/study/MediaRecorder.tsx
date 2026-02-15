import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface Props {
    onComplete: (url: string) => void;
    onCancel: () => void;
    mode: 'audio' | 'video';
    maxDuration?: number; // in seconds
}

export const MediaRecorder: React.FC<Props> = ({
    onComplete,
    onCancel,
    mode,
    maxDuration = 60
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(maxDuration);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startStream();
        return () => {
            stopStream();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startStream = async () => {
        try {
            const constraints = {
                audio: true,
                video: mode === 'video'
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current && mode === 'video') {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('Erro ao acessar câmera/microfone. Por favor, verifique as permissões.');
            onCancel();
        }
    };

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mode === 'video' ? 'video/mp4' : 'audio/mpeg' });
            setRecordedBlob(blob);
            setPreviewUrl(URL.createObjectURL(blob));
        };

        recorder.start();
        setIsRecording(true);
        setTimeLeft(maxDuration);

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleUpload = async () => {
        if (!recordedBlob) return;

        try {
            setIsUploading(true);
            const filename = `recording_${Date.now()}.${mode === 'video' ? 'mp4' : 'mp3'}`;
            const folder = 'ÁUDIO E VIDEO DE ALUNOS';

            // 1. Get Presigned URL from b2-proxy
            const { data, error: proxyError } = await supabase.functions.invoke('b2-proxy', {
                body: {
                    filename,
                    contentType: recordedBlob.type,
                    folder
                }
            });

            if (proxyError) throw proxyError;

            // 2. Upload to B2
            const uploadResponse = await fetch(data.url, {
                method: 'PUT',
                body: recordedBlob,
                headers: {
                    'Content-Type': recordedBlob.type
                }
            });

            if (!uploadResponse.ok) throw new Error('Falha no upload para B2');

            // 3. Return the full public URL
            // Format based on user request: https://AcademiaVQC-App.s3.us-east-005.backblazeb2.com/FOLDER/USER_ID/FILENAME
            const publicUrl = `https://AcademiaVQC-App.s3.us-east-005.backblazeb2.com/${data.path}`;
            onComplete(publicUrl);
        } catch (err) {
            console.error('Upload error:', err);
            alert('Erro ao enviar gravação. Tente novamente.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 p-6 bg-[#1A202C] rounded-[32px] border border-white/10 shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="w-full relative aspect-square bg-black/40 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center">
                {mode === 'video' && !previewUrl && (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                )}

                {mode === 'video' && previewUrl && (
                    <video src={previewUrl} controls className="w-full h-full object-cover" />
                )}

                {mode === 'audio' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500/20 animate-pulse' : 'bg-[#0081FF]/20'}`}>
                            <span className="material-symbols-rounded text-4xl text-[#0081FF]">mic</span>
                        </div>
                        {previewUrl && <audio src={previewUrl} controls className="w-full max-w-[240px]" />}
                    </div>
                )}

                {isRecording && (
                    <div className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-white">{timeLeft}s</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 w-full">
                {!previewUrl ? (
                    <>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isRecording ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-[#0081FF] text-white shadow-[#0081FF]/20'} shadow-lg`}
                        >
                            <span className="material-symbols-rounded">{isRecording ? 'stop' : 'fiber_manual_record'}</span>
                            {isRecording ? 'Parar Gravação' : `Gravar ${mode === 'video' ? 'Vídeo' : 'Áudio'}`}
                        </button>
                        <button onClick={onCancel} className="w-full py-3 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Cancelar</button>
                    </>
                ) : (
                    <>
                        <button
                            disabled={isUploading}
                            onClick={handleUpload}
                            className="w-full py-4 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-rounded">cloud_upload</span>
                                    Enviar Gravação
                                </>
                            )}
                        </button>
                        <button
                            disabled={isUploading}
                            onClick={() => { setPreviewUrl(null); setRecordedBlob(null); }}
                            className="w-full py-3 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10"
                        >
                            Gravar Novamente
                        </button>
                    </>
                )}
            </div>

            <style>{`
                .mirror { transform: scaleX(-1); }
            `}</style>
        </div>
    );
};
