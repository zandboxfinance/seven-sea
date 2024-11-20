import React, { useCallback, useRef, useState, useEffect } from 'react';

interface WhaleSliderProps {
  sliderValue: number;
  setSliderValue: (value: number) => void;
  getWhaleHeadSrc: () => string;
  availableBalance: number | string; // Added availableBalance to show balance above the slider
  setInputValue: (value: string) => void; // Added to update input field value based on slider movement
}

const WhaleSlider: React.FC<WhaleSliderProps> = ({
  sliderValue,
  setSliderValue,
  getWhaleHeadSrc,
  availableBalance,
  setInputValue,
}) => {
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const whaleHeadRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartDrag = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleEndDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (isDragging && sliderContainerRef.current) {
        const bounds = sliderContainerRef.current.getBoundingClientRect();
        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
        const mouseX = clientX - bounds.left;
        const newValue = Math.max(0, Math.min(100, (mouseX / bounds.width) * 100));
        setSliderValue(newValue);

        // Update input value based on slider position
        if (typeof availableBalance === 'number' && !isNaN(availableBalance)) {
          const calculatedValue = ((availableBalance * newValue) / 100).toFixed(2);
          setInputValue(calculatedValue);
        }
      }
    },
    [isDragging, setSliderValue, availableBalance, setInputValue]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEndDrag);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEndDrag);
    }

    return () => {
      if (isDragging) {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEndDrag);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEndDrag);
      }
    };
  }, [isDragging, handleMove, handleEndDrag]);

  const getConditionalPosition = (type: 'tail' | 'body' | 'head') => {
    if (windowWidth < 768) {
      // Mobile screens
      switch (type) {
        case 'tail':
          return '-60px';
        case 'body':
          return '-20px';
        case 'head':
          return `calc(${sliderValue}% - 30px)`;
        default:
          return '0';
      }
    } else if (windowWidth >= 768 && windowWidth < 1024) {
      // Tablet screens
      switch (type) {
        case 'tail':
          return '-70px';
        case 'body':
          return '-25px';
        case 'head':
          return `calc(${sliderValue}% - 40px)`;
        default:
          return '0';
      }
    } else {
      // Desktop screens
      switch (type) {
        case 'tail':
          return '-80px';
        case 'body':
          return '-35px';
        case 'head':
          return `calc(${sliderValue}% - 48px)`;
        default:
          return '0';
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div ref={sliderContainerRef} className="slider-container relative w-[85%] h-[80px] mb-5">
        {/* Whale Tail */}
        <img
          src="./whale/tail.png"
          alt="Whale Tail"
          className="absolute bottom-0 w-[50px] h-[54.5px]"
          style={{ left: getConditionalPosition('tail') }}
        />

        {/* Whale Body */}
        <div
          className="absolute bottom-0 h-[34px]"
          style={{
            left: getConditionalPosition('body'),
            width: `calc(${sliderValue}% - 0px)`,
            backgroundImage: 'url(./whale/body.png)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'contain',
          }}
        ></div>

        {/* Whale Head */}
        <img
          ref={whaleHeadRef}
          src={getWhaleHeadSrc()}
          alt="Whale Head"
          className="absolute cursor-pointer bottom-0 top-[43px] w-[60px] h-[44px]"
          style={{
            left: getConditionalPosition('head'),
            transform: isHovered ? 'scale(1.05)' : 'scale(1.01)',
            transition: 'transform 0.1s ease',
          }}
          onMouseDown={handleStartDrag}
          onTouchStart={handleStartDrag}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      </div>

      {/* Preset Buttons */}
      <div className="buttons-container flex justify-between w-full">
        {[25, 50, 75, 100].map((val) => (
          <button
            key={val}
            onClick={() => {
              setSliderValue(val);
              if (typeof availableBalance === 'number' && !isNaN(availableBalance)) {
                const calculatedValue = ((availableBalance * val) / 100).toFixed(2);
                setInputValue(calculatedValue);
              }
            }}
            className="text-sm w-[20%] py-1 rounded-full transition-colors duration-200 border-2 hover:bg-white hover:text-black"
          >
            {val === 100 ? 'All In' : `${val}%`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WhaleSlider;
