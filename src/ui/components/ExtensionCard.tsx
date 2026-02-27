import React, { useState } from 'react';
import { ExtensionSnapshot, AppConfig } from '../../types';
import { RiskBadge } from './RiskBadge';
import { calculateRisk } from '../../background/riskEngine';
import { AlertCircle, ChevronDown, ChevronUp, ExternalLink, ShieldAlert, Trash2, PowerOff } from 'lucide-react';

interface ExtensionCardProps {
    extension: ExtensionSnapshot;
    config: AppConfig | null;
}

export const ExtensionCard: React.FC<ExtensionCardProps> = ({ extension, config }) => {
    const [expanded, setExpanded] = useState(false);
    const risk = calculateRisk(extension, undefined, config || undefined); // Kiszámoljuk helyben a UI-hoz

    // Diff készítés a Permissions részére
    const oldPerms = new Set(extension.previousPermissions || extension.permissions);
    const currPerms = new Set(extension.permissions);
    const addedPerms = extension.permissions.filter(p => !oldPerms.has(p));
    const removedPerms = (extension.previousPermissions || []).filter(p => !currPerms.has(p));
    const unchangedPerms = extension.permissions.filter(p => oldPerms.has(p));

    // Diff készítés a Host Permissions részére
    const oldHosts = new Set(extension.previousHostPermissions || extension.hostPermissions);
    const currHosts = new Set(extension.hostPermissions);
    const addedHosts = extension.hostPermissions.filter(p => !oldHosts.has(p));
    const removedHosts = (extension.previousHostPermissions || []).filter(p => !currHosts.has(p));
    const unchangedHosts = extension.hostPermissions.filter(p => oldHosts.has(p));

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
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${risk.score >= 70 ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'} overflow-hidden transition-all`}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500">
                        {/* Opcionális: extension icon */}
                        <ShieldAlert size={20} className={risk.score >= 70 ? 'text-red-500' : (risk.score >= 40 ? 'text-yellow-500' : 'text-green-500')} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                            {extension.name}
                            {!extension.enabled && <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">Kikapcsolva</span>}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Verzió: {extension.version} | ID: {extension.id}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <RiskBadge score={risk.score} />
                    {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Bal oszlop: Értékelés és Okok */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 uppercase tracking-wider">Kockázatelemzés</h4>
                            {risk.reasons.length > 0 ? (
                                <ul className="space-y-2">
                                    {risk.reasons.map((reason, idx) => (
                                        <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                                            <AlertCircle size={16} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span>{reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <ShieldAlert size={16} className="text-green-500 mr-2" />
                                    Nem találtunk gyanús jogosultságot.
                                </p>
                            )}

                            {risk.recommendedActions.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm border border-blue-100 dark:border-blue-800/50">
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
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 uppercase tracking-wider">Használt API engedélyek</h4>
                            {extension.permissions.length > 0 || removedPerms.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {addedPerms.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-mono">
                                            +{p}
                                        </span>
                                    ))}
                                    {removedPerms.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 font-mono line-through">
                                            -{p}
                                        </span>
                                    ))}
                                    {unchangedPerms.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Nincsenek extra API engedélyek.</p>
                            )}

                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2 uppercase tracking-wider">Weboldal hozzáférések</h4>
                            {extension.hostPermissions.length > 0 || removedHosts.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {addedHosts.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 font-mono">
                                            +{p}
                                        </span>
                                    ))}
                                    {removedHosts.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 font-mono line-through">
                                            -{p}
                                        </span>
                                    ))}
                                    {unchangedHosts.map((p: string) => (
                                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 font-mono">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nincs specifikus weboldal hozzáférés.</p>
                            )}
                        </div>

                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleOpenStore}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
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
