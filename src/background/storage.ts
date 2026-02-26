import { AppStorage, ExtensionSnapshot, AuditLogEntry } from '../types';

export const storage = {
    async get<K extends keyof AppStorage>(key: K): Promise<AppStorage[K] | null> {
        const data = await chrome.storage.local.get(key);
        return data[key] as AppStorage[K] || null;
    },

    async set<K extends keyof AppStorage>(key: K, value: AppStorage[K]): Promise<void> {
        await chrome.storage.local.set({ [key]: value });
    },

    async getBaseline(): Promise<Record<string, ExtensionSnapshot>> {
        const data = await this.get('extensionsBaseline');
        return data || {};
    },

    async saveBaseline(baseline: Record<string, ExtensionSnapshot>): Promise<void> {
        await this.set('extensionsBaseline', baseline);
    },

    async getAuditLog(): Promise<AuditLogEntry[]> {
        const data = await this.get('auditLog');
        return data || [];
    },

    async addAuditLogEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
        const currentLog = await this.getAuditLog();
        const newEntry: AuditLogEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: Date.now()
        };

        // Maximálisan 500 bejegyzés megtartása (a legújabbak elöl)
        currentLog.unshift(newEntry);
        if (currentLog.length > 500) {
            currentLog.pop();
        }

        await this.set('auditLog', currentLog);
    }
};
