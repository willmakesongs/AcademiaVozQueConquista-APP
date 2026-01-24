
import React, { useRef, useEffect, useState } from 'react';

interface WheelPickerProps {
    items: string[];
    value: string;
    onChange: (value: string) => void;
    width?: string;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({ items, value, onChange, width = 'w-24' }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const itemHeight = 40; // px

    // Add empty items at start and end to allow centering the first and last real items
    const displayItems = ['', '', ...items, '', ''];

    useEffect(() => {
        const index = items.indexOf(value);
        if (index !== -1 && scrollRef.current) {
            scrollRef.current.scrollTop = index * itemHeight;
        }
    }, [value, items]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollTop = e.currentTarget.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (index >= 0 && index < items.length) {
            if (items[index] !== value) {
                onChange(items[index]);
            }
        }
    };

    return (
        <div className={`relative h-[120px] ${width} overflow-hidden font-sans`}>
            {/* Selection Highlight */}
            <div className="absolute top-[40px] left-0 right-0 h-[40px] bg-white/5 border-y border-white/10 pointer-events-none" />

            <div
                ref={scrollRef}
                className="h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar pb-[40px]"
                onScroll={handleScroll}
                style={{ scrollbarWidth: 'none' }}
            >
                {displayItems.map((item, i) => {
                    const realIndex = i - 2;
                    const isSelected = items[realIndex] === value;

                    return (
                        <div
                            key={i}
                            className={`h-[40px] flex items-center justify-center snap-center transition-all duration-200 ${isSelected ? 'text-white text-lg font-bold' : 'text-gray-500 text-sm'}`}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
