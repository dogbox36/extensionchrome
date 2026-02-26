import React, { useState } from 'react';
import { ExtensionSnapshot } from '../../types';
import { RiskBadge } from './RiskBadge';
import { calculateRisk } from '../../background/riskEngine';
import { AlertCircle, ChevronDown, ChevronUp, ExternalLink, ShieldAlert, Trash2, PowerOff } from 'lucide-react';

interface ExtensionCardProps {
    extension: ExtensionSnapshot;
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({ extension }) => {
    const [expanded, setExpanded] = useState(false);
    const risk = calculateRisk(extension); // Kiszámoljuk helyben a UI-hoz

    const handleOpenStore = () => {
        chrome.tabs.create({ url: `chrome://extensions/?id=${extension.id}` });
    };

    const handleDisable = () => {
        chrome.management.setEnabled(extension.id, false, () => {
            // Reload page or handle state update in parent
            window.location.reload();
        });
    };

    const handleUninstall = () => {
        chrome.management.uninstall(extension.id, { showConfirmDialog: true }, () => {
            window.location.reload();
        });
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${risk.score >= 70 ? 'border-red-300' : 'border-gray-200'} overflow-hidden transition-all`}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        {/* Opcionális: extension icon */}
                        <ShieldAlert size={20} className={risk.score >= 70 ? 'text-red-500' : (risk.score >= 40 ? 'text-yellow-500' : 'text-green-500')} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            {extension.name}
                            {!extension.enabled && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Kikapcsolva</span>}
                        </h3>
                        <p className="text-sm text-gray-500">Verzió: {extension.version} | ID: {extension.id}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <RiskBadge score={risk.score} />
                    {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Bal oszlop: Értékelés és Okok */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Kockázatelemzés</h4>
                            {risk.reasons.length > 0 ? (
                                <ul className="space-y-2">
                                    {risk.reasons.map((reason, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-700">
                                            <AlertCircle size={16} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 flex items-center">
                                    <ShieldAlert size={16} className="text-green-500 mr-2" />
                                    Nem találtunk gyanús jogosultságot.
                                </p>
                            )}

                            {risk.recommendedActions.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
                                    <p className="font-semibold mb-1">Javaslat:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {risk.recommendedActions.map((action, idx) => (
                                            <li key={idx}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Jobb oszlop: Engedélyek */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Használt API engedélyek</h4>
                            {extension.permissions.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {extension.permissions.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800 font-mono">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4">Nincsenek extra API engedélyek.</p>
                            )}

                            <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Weboldal hozzáférések</h4>
                            {extension.hostPermissions.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {extension.hostPermissions.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 font-mono">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nincs specifikus weboldal hozzáférés.</p>
                            )}
                        </div>

                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleOpenStore}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ExternalLink size={16} className="mr-2" />
                            Bővítménykezelő
                        </button>
                        {extension.enabled && (
                            <button
                                onClick={handleDisable}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                            >
                                <PowerOff size={16} className="mr-2" />
                                Kikapcsolás
                            </button>
                        )}
                        <button
                            onClick={handleUninstall}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 size={16} className="mr-2" />
                            Eltávolítás
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
