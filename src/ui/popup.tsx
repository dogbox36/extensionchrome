import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const Popup = () => {
    const openDashboard = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/ui/pages/dashboard.html') });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="px-4 py-3 bg-blue-600 text-white flex items-center shadow-md">
                <h1 className="text-lg font-bold">Trust Monitor</h1>
            </header>
            <main className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <p className="text-gray-600 text-sm">
                    A telepített böngészőbővítmények folyamatos megfigyelése biztonsági kockázatok után kutatva.
                </p>
                <button
                    onClick={openDashboard}
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors w-full"
                >
                    Irányítópult megnyitása
                </button>
            </main>
            <footer className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
                Védve a káros bővítményektől
            </footer>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
