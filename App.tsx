
import React, { useState, useCallback } from 'react';
import { MapCanvas } from './components/MapCanvas';
import { ResultsDisplay } from './components/ResultsDisplay';
import { generateSolarImages } from './services/geminiService';
import { Point } from './types';
import { SolarIcon } from './components/icons';

type AppState = 'SEARCH' | 'DRAWING' | 'GENERATING' | 'RESULTS' | 'ERROR';

export default function App() {
    const [appState, setAppState] = useState<AppState>('SEARCH');
    const [address, setAddress] = useState<string>('');
    const [mapImageUrl, setMapImageUrl] = useState<string>('');
    const [editedMapImage, setEditedMapImage] = useState<string | null>(null);
    const [threeDImageUrl, setThreeDImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleStartSimulation = () => {
        if (address.trim() === '') return;
        // To provide a consistent and realistic experience without a full mapping API,
        // we use a high-quality sample satellite image of a residential area.
        setMapImageUrl('https://i.imgur.com/8o55t3B.jpeg');
        setAppState('DRAWING');
    };

    const handleGeneration = useCallback(async (canvasImage: string) => {
        setAppState('GENERATING');
        setError(null);
        setEditedMapImage(null);
        setThreeDImageUrl(null);
        try {
            const { rooftopView, threeDView } = await generateSolarImages(canvasImage);
            setEditedMapImage(rooftopView);
            setThreeDImageUrl(threeDView);
            setAppState('RESULTS');
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setAppState('ERROR');
        }
    }, []);

    const handleReset = () => {
        setAddress('');
        setMapImageUrl('');
        setEditedMapImage(null);
        setThreeDImageUrl(null);
        setError(null);
        setAppState('SEARCH');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <SolarIcon className="w-12 h-12 text-yellow-400" />
                        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500">
                            AI 태양광 설치 시뮬레이터
                        </h1>
                    </div>
                    <p className="text-gray-400">AI를 이용해 건물 지붕에 태양광 패널을 설치한 모습을 미리 확인해보세요.</p>
                </header>

                <main className="bg-gray-800/50 rounded-2xl shadow-2xl p-6 ring-1 ring-white/10 backdrop-blur-lg">
                    {appState === 'SEARCH' && (
                        <div className="flex flex-col items-center justify-center min-h-[16rem]">
                            <h2 className="text-2xl font-semibold mb-4">1. 시뮬레이션 시작하기</h2>
                            <div className="w-full max-w-lg text-center">
                                 <p className="text-gray-400 mb-4">
                                    AI의 이미지 생성 기능을 체험하기 위해 아무 주소나 입력하고 시작 버튼을 눌러주세요.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="예: 서울특별시 강남구 테헤란로"
                                        className="flex-grow bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleStartSimulation()}
                                        autoComplete="off"
                                    />
                                    <button
                                        onClick={handleStartSimulation}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                                        disabled={!address.trim()}
                                    >
                                        시뮬레이션 시작
                                    </button>
                                </div>
                                <p className="text-gray-500 mt-4 text-sm">
                                    <strong>참고:</strong> 현재는 데모 버전으로, 입력한 주소와 관계없이 AI 성능을 보여주기 위한 고품질 예시 위성 지도가 사용됩니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {(appState === 'DRAWING' || appState === 'GENERATING' || appState === 'RESULTS' || appState === 'ERROR') && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-semibold mb-4 text-center">
                                    {appState === 'DRAWING' ? '2. 지도 위 영역 선택' : '원본 위성 지도'}
                                </h2>
                                <div className="aspect-[4/3] w-full bg-gray-700 rounded-lg overflow-hidden relative shadow-lg">
                                    {mapImageUrl && (
                                        <MapCanvas
                                            imageUrl={mapImageUrl}
                                            onGenerationStart={handleGeneration}
                                            isDrawingActive={appState === 'DRAWING'}
                                        />
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-semibold mb-4 text-center">3. AI 시뮬레이션 결과</h2>
                                <ResultsDisplay
                                    isLoading={appState === 'GENERATING'}
                                    editedMapImage={editedMapImage}
                                    threeDImageUrl={threeDImageUrl}
                                    error={error}
                                />
                            </div>
                        </div>
                    )}

                    {(appState !== 'SEARCH') && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleReset}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 text-white font-bold py-3 px-8 rounded-lg transition-opacity text-lg"
                            >
                                새로 시작하기
                            </button>
                        </div>
                    )}
                </main>
                 <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>Powered by Google Gemini API. Images are for illustrative purposes only.</p>
                </footer>
            </div>
        </div>
    );
}
