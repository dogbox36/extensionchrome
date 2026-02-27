import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { storage } from '../background/storage';
import { AppConfig } from '../types';
import './index.css';

const Options = () => {
    const [config, setConfig] = useState<AppConfig>({ whitelistedExtensionIds: [], riskSensitivity: 'normal' });
    const [whitelistText, setWhitelistText] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        storage.getConfig().then(data => {
            setConfig(data);
            setWhitelistText(data.whitelistedExtensionIds.join(', '));
        });
    }, []);

    const handleSave = async () => {
        const ids = whitelistText.split(/[\s,]+/).filter(id => id.trim().length > 0);
        const newConfig = { ...config, whitelistedExtensionIds: ids };
        await storage.saveConfig(newConfig);
        setConfig(newConfig);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const downloadJson = (data: any, filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportAuditLog = async () => {
        const log = await storage.getAuditLog();
        downloadJson(log, 'trust_monitor_audit_log.json');
    };

    const handleExportBaseline = async () => {
        const baseline = await storage.getBaseline();
        downloadJson(baseline, 'trust_monitor_baseline.json');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Beállítások</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        A Trust Monitor működésének finomhangolása és adatexportálás.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-5 sm:p-6 space-y-6">

                        {/* Whitelisting */}
                        <div>
                            <label htmlFor="whitelist" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Fehérlistázott Bővítmények (ID-k)
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="whitelist"
                                    rows={3}
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="abcdefghijklmnop..., qrstuvwxyz..."
                                    value={whitelistText}
                                    onChange={(e) => setWhitelistText(e.target.value)}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Vesszővel vagy szóközzel elválasztott bővítmény ID-k, amelyeket a Risk Engine nem fog vizsgálni.
                            </p>
                        </div>

                        {/* Érzékenység */}
                        <div>
                            <label htmlFor="sensitivity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Kockázatelemzés Érzékenysége
                            </label>
                            <select
                                id="sensitivity"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                value={config.riskSensitivity}
                                onChange={(e) => setConfig({ ...config, riskSensitivity: e.target.value as any })}
                            >
                                <option value="low">Megengedő (Alacsonyabb pontszámok)</option>
                                <option value="normal">Normál (Ajánlott)</option>
                                <option value="high">Szigorú (Magasabb pontszámok)</option>
                            </select>
                        </div>

                        {/* Mentés */}
                        <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                            {saved ? <span className="text-sm text-green-600 dark:text-green-400 font-medium">Beállítások elmentve!</span> : <span></span>}
                            <button
                                onClick={handleSave}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Mentés
                            </button>
                        </div>
                    </div>
                </div>

                {/* Adatkezelés */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-5 sm:p-6 space-y-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Adatkezelés</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            A rendszer minden adatot lokálisan tárol. Itt kimentheted a naplókat külső elemzés céljából.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                onClick={handleExportAuditLog}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                            >
                                Audit Log Exportálása (JSON)
                            </button>
                            <button
                                onClick={handleExportBaseline}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-800 shadow-sm text-sm font-medium rounded-md text-blue-700 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                            >
                                Aktuális Baseline Exportálása (JSON)
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Options />);
}
