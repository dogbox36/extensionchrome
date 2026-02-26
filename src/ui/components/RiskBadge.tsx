import React from 'react';

interface RiskBadgeProps {
    score: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score }) => {
    let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
    let label = 'Ismeretlen';

    if (score >= 70) {
        colorClass = 'bg-red-50 text-red-700 border-red-200';
        label = 'Magas Kockázat';
    } else if (score >= 40) {
        colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        label = 'Közepes Kockázat';
    } else if (score >= 0) {
        colorClass = 'bg-green-50 text-green-700 border-green-200';
        label = 'Alacsony Kockázat';
    }

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium border ${colorClass}`}>
            <span className="mr-1.5 font-bold">{score}/100</span>
            <span>{label}</span>
        </div>
    );
};
