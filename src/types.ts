export interface ExtensionSnapshot {
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    installType: chrome.management.ExtensionInstallType;
    updateUrl?: string;
    permissions: string[];
    hostPermissions: string[];
    previousPermissions?: string[];
    previousHostPermissions?: string[];
}

export interface RiskScoreResult {
    score: number;
    reasons: string[];
    recommendedActions: string[];
}

export type EventType = 'installed' | 'uninstalled' | 'enabled' | 'disabled' | 'updated' | 'permissions_changed';

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    extensionId: string;
    extensionName: string;
    eventType: EventType;
    diffSummary?: string;
    riskScore?: number;
    reasons?: string[];
}

export interface AppConfig {
    whitelistedExtensionIds: string[];
    riskSensitivity: 'low' | 'normal' | 'high';
}

export interface AppStorage {
    extensionsBaseline: Record<string, ExtensionSnapshot>;
    auditLog: AuditLogEntry[];
    watchModeDomains: string[];
    config: AppConfig;
}
