
import React from 'react';
import { ErrorIcon, ImageIcon } from './icons';

interface ResultsDisplayProps {
    isLoading: boolean;
    editedMapImage: string | null;
    threeDImageUrl: string | null;
    error: string | null;
}

const LoadingPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="w-full aspect-video bg-gray-700/50 rounded-lg flex flex-col items-center justify-center animate-pulse">
        <ImageIcon className="w-12 h-12 text-gray-500 mb-2" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">{title}</h3>
        <div className="w-4/5 h-2 bg-gray-600 rounded-full mb-1"></div>
        <div className="w-3/5 h-2 bg-gray-600 rounded-full"></div>
    </div>
);

const ImageResult: React.FC<{ title: string; imageUrl: string }> = ({ title, imageUrl }) => (
     <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 text-center">{title}</h3>
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        </div>
    </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, editedMapImage, threeDImageUrl, error }) => {
    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/20 border-2 border-red-500/50 rounded-lg p-6 text-center">
                <ErrorIcon className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-red-400">오류 발생</h3>
                <p className="text-red-300 mt-2">{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <LoadingPlaceholder title="1. 태양광 설치 후 지도 모습" />
                <LoadingPlaceholder title="2. 3D 시뮬레이션 이미지" />
            </div>
        );
    }
    
    if (!editedMapImage && !threeDImageUrl) {
         return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700/50 rounded-lg p-6 text-center">
                <ImageIcon className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">결과가 여기에 표시됩니다</h3>
                <p className="text-gray-500 mt-2">주소 검색 후, 지도 위에 영역을 선택하면 AI가 생성한 이미지를 볼 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {editedMapImage && <ImageResult title="1. 태양광 설치 후 지도 모습" imageUrl={editedMapImage} />}
            {threeDImageUrl && <ImageResult title="2. 3D 시뮬레이션 이미지" imageUrl={threeDImageUrl} />}
        </div>
    );
};
