

import React from 'react';
import { Metronome } from '../components/Studio/Metronome';


interface Props {
    onBack: () => void;
}

export const StudioScreen: React.FC<Props> = ({ onBack }) => {
    return (
        <div className="h-screen bg-[#101622] flex flex-col pb-24">
            {/* Metronome Container - Full Height for Immersion */}
            <div className="flex-1 flex flex-col p-4">
                <div className="flex-1 w-full h-full relative">
                    <Metronome exerciseName="Estúdio Livre" />
                </div>
            </div>
        </div>
    );
};
