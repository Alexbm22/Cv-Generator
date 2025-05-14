import React, { useRef, useEffect } from 'react';

interface SliderPickerProps {
    LevelsMap: { [key: string]: { index: number, color: string } };
    selectedLevel: string | null;
    sectionId: string;
    onLevelChange: any;
}

const SliderPicker:React.FC<SliderPickerProps> = ({LevelsMap, selectedLevel, sectionId, onLevelChange}) => {

    const sliderRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateSliderPosition = () => {
        if ( sliderRef.current && containerRef.current ) {
            const container = containerRef.current;
            const buttonWidth = container.offsetWidth / Object.keys(LevelsMap).length;

            if(!selectedLevel){
                sliderRef.current.style.opacity = '0';
                return;
            }

            const levelInfo = LevelsMap[selectedLevel];

            if (levelInfo.index >= 0) {
                sliderRef.current.style.opacity = '1';
                sliderRef.current.style.width = `${buttonWidth}px`;

                sliderRef.current.style.backgroundColor = levelInfo.color;
                sliderRef.current.style.transform = `translateX(${levelInfo.index * buttonWidth}px)`;
            }
        }
    }

    useEffect(() => {
            updateSliderPosition();
    
            const handleResize = () => {
                updateSliderPosition();
            }
    
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            }
    
        }, [selectedLevel]);

    const handleButtonClick = (level: any) => {
        onLevelChange(sectionId, level);
        updateSliderPosition();
    }

    return (
        <div className='flex flex-col space-y-2 w-full'>   
            <div className='flex flex-row '>
                <label className="text-base text-gray-600 font-bold">Level: </label>
                <p className='ml-3'> {selectedLevel || 'Choose a level'}</p>
            </div>

            <div ref={containerRef} className=' relative flex divide-x divide-gray-300 flex-row border border-gray-300 shadow-sm h-11 overflow-hidden rounded-md '>
                <div 
                    ref={sliderRef}
                    className='absolute transition-all duration-400 ease-in-out h-11 rounded-md'
                ></div>
                {Object.keys(LevelsMap).map((level) => {
                    return (
                        <button
                            key={level}
                            className='w-full cursor-pointer'
                            onClick={() => handleButtonClick(level)}
                        ></button>
                    );
                })}
            </div>

        </div>
    );
}

export default SliderPicker;