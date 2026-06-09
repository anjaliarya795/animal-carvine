import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Eye, PlayCircle } from 'lucide-react';
import { VIDEO_LIST, VideoItem } from '../Videodata';

// --- Configuration ---
const MOBILE_WIDTH = 340;
const TABLET_WIDTH = 450;
const DESKTOP_WIDTH = 700;
const GAP = 32;
const SPEED = 0.8;
const RESUME_DELAY = 10000; // 10 Seconds

interface VideoIframeCardProps {
  video: VideoItem;
  isActive: boolean;
  width: number;
  onInteract: () => void;
  onLeave: () => void;
  onPlay: () => void;
}

const VideoSlider: React.FC = () => {
  const [videos] = useState<VideoItem[]>(VIDEO_LIST);
  const [cardWidth, setCardWidth] = useState<number>(DESKTOP_WIDTH);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
  const [activeVideoKey, setActiveVideoKey] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isSnapping, setIsSnapping] = useState<boolean>(false);
  const [isDelayedResume, setIsDelayedResume] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef<number>(0);
  const reqIdRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Responsive ---
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWindowWidth(w);
      if (w < 640) setCardWidth(MOBILE_WIDTH);
      else if (w < 1024) setCardWidth(TABLET_WIDTH);
      else setCardWidth(DESKTOP_WIDTH);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Static check
  const ITEM_WIDTH = cardWidth + GAP;
  const isStatic = videos.length * ITEM_WIDTH < windowWidth + 100; 

  // --- Pause/Resume Logic ---
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleVideoLeave = () => {
    setIsHovered(false);
    if (activeVideoKey) {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      setIsDelayedResume(true);
      
      resumeTimerRef.current = setTimeout(() => {
        setIsDelayedResume(false);
        setActiveVideoKey(null); 
      }, RESUME_DELAY);
    }
  };

  const isPaused = isHovered || activeVideoKey !== null || isSnapping || isStatic || isDelayedResume;

  const animate = useCallback(() => {
    if (isStatic) return;

    if (!isPaused) {
      positionRef.current -= SPEED;
      
      const totalWidth = videos.length * ITEM_WIDTH;
      if (positionRef.current <= -totalWidth) {
        positionRef.current += totalWidth;
      }
      
      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${positionRef.current}px)`;
      }
    }
    reqIdRef.current = requestAnimationFrame(animate);
  }, [isPaused, isStatic, videos.length, ITEM_WIDTH]);

  useEffect(() => {
    if (!isStatic) {
      reqIdRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (reqIdRef.current !== null) cancelAnimationFrame(reqIdRef.current);
    };
  }, [animate, isStatic]);

  // ---  to Center ---
  const snapToCenter = (index: number) => {
    if (!containerRef.current || isStatic) return;

    setIsSnapping(true);
    const containerCenter = windowWidth / 2;
    const itemCenter = (index * ITEM_WIDTH) + (cardWidth / 2);
    let targetX = containerCenter - itemCenter;

    containerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    containerRef.current.style.transform = `translateX(${targetX}px)`;
    positionRef.current = targetX;

    setTimeout(() => {
      if(containerRef.current) containerRef.current.style.transition = 'none';
      setIsSnapping(false);
    }, 600);
  };

  const handleVideoClick = (id: string, index: number) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setIsDelayedResume(false);
    setIsHovered(true);
    snapToCenter(index);
    setActiveVideoKey(id);
  };

  const slide = (direction: 'prev' | 'next') => {
    if (isSnapping || isStatic) return;
    
    setActiveVideoKey(null);
    setIsSnapping(true);

    const currentIdx = Math.round(Math.abs(positionRef.current) / ITEM_WIDTH);
    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    const targetPos = -(targetIdx * ITEM_WIDTH);

    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.5s ease-out';
      containerRef.current.style.transform = `translateX(${targetPos}px)`;
    }

    setTimeout(() => {
      positionRef.current = targetPos;
      if (containerRef.current) containerRef.current.style.transition = 'none';
      const totalWidth = videos.length * ITEM_WIDTH;
      if (Math.abs(positionRef.current) >= totalWidth) {
         positionRef.current = 0;
      }
      setIsSnapping(false);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      setIsDelayedResume(true);
      resumeTimerRef.current = setTimeout(() => {
        setIsDelayedResume(false);
      }, RESUME_DELAY);
    }, 500);
  };

  const renderList = isStatic ? videos : [...videos, ...videos, ...videos];

  return (
    <>
      <div className="container mx-auto px-4 pt-20 pb-10 text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Popular Videos <span className="text-white/50">&</span> Podcasts</h2>
      </div>

      <div className="w-full bg-black pb-20 overflow-hidden flex flex-col justify-center min-h-[500px] relative border-t border-white/5 group">
        
        {!isStatic && windowWidth >= 1024 && (
          <>
            <button 
                onClick={() => slide('prev')}
                className="absolute left-8 top-[40%] z-30 bg-gray-900/80 hover:bg-orange-600 border border-white/10 text-white p-3 rounded-full transition-all hover:scale-110"
            >
                <ChevronLeft size={28} />
            </button>
            <button 
                onClick={() => slide('next')}
                className="absolute right-8 top-[40%] z-30 bg-gray-900/80 hover:bg-orange-600 border border-white/10 text-white p-3 rounded-full transition-all hover:scale-110"
            >
                <ChevronRight size={28} />
            </button>
          </>
        )}

        {/* SLIDER AREA */}
        <div 
            className="w-full h-full relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
          <div 
            ref={containerRef}
            className={`flex items-stretch ${isStatic ? 'justify-center w-full flex-wrap gap-8' : 'relative w-max'}`}
            style={{ 
              gap: `${GAP}px`,
              paddingLeft: isStatic ? 0 : (windowWidth < 1024 ? 20 : 0) 
            }}
          >
            {renderList.map((video, index) => {
              const uniqueKey = `${video.id}-${index}`;
              return (
                <VideoIframeCard 
                  key={uniqueKey}
                  video={video}
                  width={cardWidth}
                  isActive={activeVideoKey === uniqueKey}
                  onInteract={handleMouseEnter}
                  onPlay={() => handleVideoClick(uniqueKey, index)}
                  onLeave={handleVideoLeave}
                />
              );
            })}
          </div>
        </div>

        {!isStatic && windowWidth < 1024 && (
            <div className="flex justify-center gap-6 mt-8 z-20">
                <button onClick={() => slide('prev')} className="bg-gray-900 border border-white/20 text-white p-4 rounded-full active:bg-orange-600 transition-colors"><ChevronLeft size={24} /></button>
                <button onClick={() => slide('next')} className="bg-gray-900 border border-white/20 text-white p-4 rounded-full active:bg-orange-600 transition-colors"><ChevronRight size={24} /></button>
            </div>
        )}

      </div>
    </>
  );
};

const VideoIframeCard: React.FC<VideoIframeCardProps & { onLeave: () => void }> = ({ video, isActive, width, onInteract, onPlay, onLeave }) => {
  
  const thumbnailUrl = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;

  return (
    <div 
      className={`
        relative transition-all duration-300 ease-out bg-[#121212] overflow-hidden rounded-xl border border-white/10 flex flex-col
        ${isActive ? 'md:shadow-[0_0_50px_rgba(249,115,22,0.3)] z-20 scale-[1.02]' : 'z-10 hover:border-orange-500/30'}
      `}
      style={{ 
        width: `${width}px`,
        height: 'auto', 
        flexShrink: 0
      }}
      onTouchStart={onInteract}
      onMouseEnter={onInteract}
      onMouseLeave={onLeave}
    >
      
      {/* VIDEO AREA */}
      <div 
        className="relative w-full bg-black border-b border-white/5 shrink-0"
        style={{ aspectRatio: '16/9' }}
      >
        {!isActive ? (
          <div 
            className="absolute inset-0 z-20 cursor-pointer group"
            onClick={(e) => {
                e.stopPropagation();
                onPlay();
            }}
          >
             <img 
               src={thumbnailUrl} 
               alt={video.title} 
               className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-10 md:w-16 md:h-11 bg-[#ff0000] rounded-xl flex items-center justify-center shadow-2xl opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 md:w-8 md:h-8 ml-1">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
             </div>
          </div>
        ) : (
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
                title={video.title}
                frameBorder="0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full relative z-10"
            ></iframe>
        )}
      </div>

      {/* INFO ROW */}
      <div className="p-4 flex flex-col gap-3 bg-[#151515] flex-grow justify-between">
          
          <div>
            <h3 className="text-[#ffffff] font-semibold text-lg leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
                {video.title}
            </h3>

            <div className="flex items-end justify-between mt-2">
                
                <div className="flex flex-col">
                    <span className="text-[#f1f1f1] text-sm font-medium hover:text-white cursor-pointer truncate max-w-[150px] md:max-w-[200px]">
                        {video.channel}
                    </span>
                    <span className="text-[#aaaaaa] text-xs mt-1">
                        {video.subs}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-[#aaaaaa] text-xs lg:bg-[#222] px-2 py-1 rounded">
                    <Eye size={14} />
                    <span>{video.views}</span>
                </div>

            </div>
          </div>
      </div>

    </div>
  );
};

export default VideoSlider;