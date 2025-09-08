
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point } from '../types';
import { DrawIcon, RedoIcon } from './icons';

interface MapCanvasProps {
    imageUrl: string;
    onGenerationStart: (canvasImage: string) => void;
    isDrawingActive: boolean;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ imageUrl, onGenerationStart, isDrawingActive }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            if (points.length > 0) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)'; // red-500
                ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
                ctx.lineWidth = 4;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                
                if (isDrawing) {
                    // Don't close path while drawing
                } else {
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.stroke();
            }
        };
        img.onerror = () => {
            ctx.fillStyle = '#374151'; // gray-700
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('이미지를 불러올 수 없습니다.', canvas.width / 2, canvas.height / 2);
        };
    }, [imageUrl, points, isDrawing]);
    
    useEffect(() => {
        draw();
    }, [draw]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingActive) return;
        
        if (!isDrawing) {
            setIsDrawing(true);
            setPoints([]);
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);
        setPoints(prevPoints => [...prevPoints, { x, y }]);
    };
    
    const handleResetDrawing = () => {
        setPoints([]);
        setIsDrawing(false);
    };

    const handleFinishDrawing = () => {
        if (points.length < 3) return;
        setIsDrawing(false);
        // A short delay to allow the final closed polygon to render before capturing
        setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                const dataUrl = canvas.toDataURL('image/jpeg');
                onGenerationStart(dataUrl);
            }
        }, 100);
    };

    return (
        <div className="w-full h-full relative">
            <canvas
                ref={canvasRef}
                width={1024}
                height={768}
                onClick={handleCanvasClick}
                className={`w-full h-full object-contain ${isDrawingActive ? 'cursor-crosshair' : 'cursor-default'}`}
            />
            {isDrawingActive && (
                <div className="absolute top-2 left-2 right-2 bg-black/60 p-2 rounded-lg text-center text-sm">
                    <p className="flex items-center justify-center gap-2">
                        <DrawIcon className="w-5 h-5" />
                        <span>설치할 지붕 영역의 꼭지점을 순서대로 클릭해주세요. (최소 3개)</span>
                    </p>
                </div>
            )}
             {isDrawingActive && isDrawing && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <button
                        onClick={handleFinishDrawing}
                        disabled={points.length < 3}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-colors"
                    >
                        완료
                    </button>
                    <button
                        onClick={handleResetDrawing}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
                    >
                        <RedoIcon className="w-5 h-5" />
                        <span className="pr-2">다시 그리기</span>
                    </button>
                </div>
            )}
        </div>
    );
};
