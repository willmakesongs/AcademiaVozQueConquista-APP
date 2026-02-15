
import React, { useEffect, useRef, useState } from 'react';
import { AlphaTabApi, Settings } from '@coderline/alphatab';

export const TabPlayer: React.FC = () => {
    const alphaTabRef = useRef<HTMLDivElement>(null);
    const [api, setApi] = useState<AlphaTabApi | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    useEffect(() => {
        if (!alphaTabRef.current) return;

        const settings: any = {
            core: {
                engine: 'html5',
            },
            display: {
                scale: 1.0,
            },
            player: {
                enablePlayer: true,
                enableCursor: true,
                soundFont: 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/soundfont/sonivox.sf2',
            },
        };

        const alphaTab = new AlphaTabApi(alphaTabRef.current, settings);

        // Event listeners
        alphaTab.playerStateChanged.on((e) => {
            setIsPlaying(e.state === 1); // 1 = playing
        });

        alphaTab.playerPositionChanged.on((e) => {
            setCurrentTime(e.currentTime);
            setDuration(e.endTime);
        });

        alphaTab.renderFinished.on(() => {
            console.log('Tablatura renderizada com sucesso!');
        });

        setApi(alphaTab);

        return () => {
            alphaTab.destroy();
        };
    }, []);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !api) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            api.load(arrayBuffer);
            setSelectedFile(file.name);
        };
        reader.readAsArrayBuffer(file);
    };

    const togglePlayPause = () => {
        if (!api) return;
        if (isPlaying) {
            api.pause();
        } else {
            api.play();
        }
    };

    const stop = () => {
        if (!api) return;
        api.stop();
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#0d1017] text-white">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <h1 className="text-3xl font-black mb-2">Tab Player</h1>
                <p className="text-sm text-gray-400">Importe arquivos Guitar Pro (.gp, .gpx, .gp5)</p>
            </div>

            {/* File Upload */}
            <div className="p-6 border-b border-white/10">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#0081FF]/30 rounded-2xl cursor-pointer hover:border-[#0081FF]/60 transition-all bg-black/20">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <span className="material-symbols-rounded text-[#0081FF] text-4xl mb-2">upload_file</span>
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500">.gp, .gpx, .gp5, .gp4, .gp3</p>
                        {selectedFile && (
                            <p className="mt-2 text-xs text-[#FF00BC] font-bold">{selectedFile}</p>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept=".gp,.gpx,.gp5,.gp4,.gp3"
                        onChange={handleFileUpload}
                    />
                </label>
            </div>

            {/* Player Controls */}
            {selectedFile && (
                <div className="p-6 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={togglePlayPause}
                            className="w-14 h-14 rounded-full bg-[#0081FF] flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                        >
                            <span className="material-symbols-rounded text-3xl text-white">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>
                        <button
                            onClick={stop}
                            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                        >
                            <span className="material-symbols-rounded text-2xl text-white">stop</span>
                        </button>
                        <div className="flex-1 flex items-center gap-3">
                            <span className="text-sm font-mono text-gray-400">{formatTime(currentTime)}</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#0081FF] transition-all"
                                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                />
                            </div>
                            <span className="text-sm font-mono text-gray-400">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* AlphaTab Container */}
            <div className="flex-1 overflow-auto p-6">
                <div
                    ref={alphaTabRef}
                    className="w-full min-h-[600px] bg-white rounded-2xl shadow-2xl"
                    data-tex="true"
                />
            </div>
        </div>
    );
};
