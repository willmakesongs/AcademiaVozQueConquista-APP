

import React from 'react';
import { Metronome } from '../components/Studio/Metronome';


interface Props {
    onBack: () => void;
}

export const StudioScreen: React.FC<Props> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-[#101622] pb-32">
            <Metronome exerciseName="Estúdio Livre" />
        </div>
    );
};
