import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { ExtensionSnapshot, AppConfig } from '../../types';
import { storage } from '../../background/storage';
import { ExtensionCard } from '../components/ExtensionCard';
import { calculateRisk } from '../../background/riskEngine';
import { Search, ShieldCheck, Settings } from 'lucide-react';

export const Dashboard = () => {
    const [extensions, setExtensions] = useState<ExtensionSnapshot[]>([]);
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    useEffect(() => {
        const loadData = async () => {
            const currentConfig = await storage.getConfig();
            setConfig(currentConfig);

            chrome.storage.local.get('extensionsBaseline', (result) => {
                const data = result.extensionsBaseline;

                if (!data) {
                    // Ha a scanner még nem futott le, jelezzük a felhasználónak
                    setExtensions([]);
                    setLoading(false);
                    return;
                }

                const extArray = Object.values(data) as ExtensionSnapshot[];

                // Alapértelmezett rendezés kockázat szerint csökkenő
                extArray.sort((a, b) => {
                    const riskA = calculateRisk(a, undefined, currentConfig).score;
                    const riskB = calculateRisk(b, undefined, currentConfig).score;
                    return riskB - riskA;
                });

                setExtensions(extArray);
                setLoading(false);
            });
        };

        loadData();

        // Figyeljük a változásokat is
        const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.extensionsBaseline) {
                loadData();
            }
        };
        chrome.storage.onChanged.addListener(listener);

        return () => {
            chrome.storage.onChanged.removeListener(listener);
        };
    }, []);

    const filteredExtensions = extensions.filter(ext => {
        // Szűrés név/id alapján
        const matchesSearch = ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ext.id.toLowerCase().includes(searchTerm.toLowerCase());

        // Szűrés kockázat alapján
        const risk = calculateRisk(ext, undefined, config || undefined).score;
        let matchesRisk = true;
        if (filterRisk === 'high') matchesRisk = risk >= 70;
        else if (filterRisk === 'medium') matchesRisk = risk >= 40 && risk < 70;
        else if (filterRisk === 'low') matchesRisk = risk < 40;

        return matchesSearch && matchesRisk;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center text-blue-600">
                        <ShieldCheck size={32} className="mr-3 text-blue-500" />
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Extension Trust Monitor
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span>Összesen: {extensions.length} db</span>
                        <button
                            onClick={() => chrome.runtime.openOptionsPage()}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                        >
                            <Settings size={16} />
                            <span>Beállítások</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Vezérlősáv */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Keresés név vagy ID alapján..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="sm:w-64 shrink-0">
                        <select aria-label="Kockázati szűrő"
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border bg-white dark:bg-gray-700 dark:text-white"
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value as any)}
                        >
                            <option value="all">Minden Kockázati Színt</option>
                            <option value="high">Magas Kockázat (70+)</option>
                            <option value="medium">Közepes Kockázat (40-69)</option>
                            <option value="low">Alacsony Kockázat (0-39)</option>
                        </select>
                    </div>
                </div>

                {/* Eredménylista */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredExtensions.length > 0 ? (
                    <div className="space-y-4">
                        {filteredExtensions.map(ext => (
                            <ExtensionCard key={ext.id} extension={ext} config={config} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <ShieldCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nincs találat</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Próbálj meg más keresési feltételt megadni.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Dashboard />);
}
