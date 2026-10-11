import React, { useRef, useEffect } from 'react';

interface SliderPickerProps {
    LevelsMap: { [key: number]: { index: number, color: string, displayedVal?: string, label: string } };
    selectedLevel: number | null;
    sectionId: string;
    onLevelChange: any;
}

const SliderPicker:React.FC<SliderPickerProps> = ({LevelsMap, selectedLevel, sectionId, onLevelChange}) => {

    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    const levelInfo = selectedLevel == null ? null : LevelsMap[selectedLevel] ?? null;

    const updateSliderPosition = () => {
        if ( sliderRef.current && containerRef.current ) {
            const container = containerRef.current;
            const buttonWidth = container.offsetWidth / Object.keys(LevelsMap).length;

            if (!levelInfo) {
                sliderRef.current.style.opacity = '0';
                return;
            }

            if (levelInfo.index >= 0) {
                sliderRef.current.style.opacity = '0.7';
                sliderRef.current.style.width = `${buttonWidth}px`;

                sliderRef.current.style.backgroundColor = levelInfo.color;
                sliderRef.current.style.transform = `translateX(${levelInfo.index * buttonWidth}px)`;
            }
        }
    }

    useEffect(() => {
        if (!parentRef.current) return;
        updateSliderPosition();

        const handleResize = () => {
            updateSliderPosition();
        }

        const observer = new ResizeObserver(() => {
            handleResize();
        });

        observer.observe(parentRef.current);

        return () => observer.disconnect();
    
    }, [selectedLevel, LevelsMap]);

    const handleButtonClick = (level: number) => {
        onLevelChange(sectionId, level);
        updateSliderPosition();
    }

    return (
        <div ref={parentRef} className='flex flex-col space-y-2 w-full'>   
            <div className='flex flex-row items-baseline gap-x-2'>
                <label className="text-sm font-semibold text-[#1d1d1f]">Level:</label>
                <p 
                    className='text-sm font-semibold tracking-[-0.01em]' 
                    style={{ color: levelInfo?.color ?? '#9c9ca4' }}>
                    {levelInfo ? levelInfo.label : 'Choose a level'}
                </p>
            </div>

            <div ref={containerRef} className='relative flex divide-x divide-[#d2d2d7] flex-row border border-[#d2d2d7] h-11 overflow-hidden rounded-xl'>
                <div 
                    ref={sliderRef}
                    className='absolute transition-all duration-400 ease-in-out h-11 rounded-xl'
                ></div>
                {Object.keys(LevelsMap).map((level) => {
                    return (
                        <button
                            key={level}
                            className='w-full cursor-pointer z-10 text-sm font-semibold tracking-[-0.01em]'
                            style={{ color: '#1d1d1f' }}
                            onClick={() => handleButtonClick(Number(level))}
                        > {LevelsMap[Number(level)].displayedVal} </button>
                    );
                })}
            </div>

        </div>
    );
}

export default SliderPicker;