import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const Options = () => {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Trust Monitor Beállítások</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Itt lesznek a beállítások. (Hamarosan)</p>
            </div>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
