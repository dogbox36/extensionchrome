import { storage } from './storage';
import { calculateRisk } from './riskEngine';
import { showHighRiskNotification } from './notifications';
import { ExtensionSnapshot, EventType } from '../types';

export async function captureCurrentState(): Promise<Record<string, ExtensionSnapshot>> {
    return new Promise((resolve) => {
        chrome.management.getAll((extensions) => {
            const state: Record<string, ExtensionSnapshot> = {};
            const ownId = chrome.runtime.id;

            for (const ext of extensions) {
                if (ext.id === ownId) continue; // Saját magunkat nem vizsgáljuk

                state[ext.id] = {
                    id: ext.id,
                    name: ext.name,
                    version: ext.version,
                    enabled: ext.enabled,
                    installType: ext.installType,
                    updateUrl: ext.updateUrl || '',
                    permissions: ext.permissions || [],
                    hostPermissions: ext.hostPermissions || []
                };
            }
            resolve(state);
        });
    });
}

export async function detectChanges(eventType: EventType, targetExtensionId?: string) {
    const currentState = await captureCurrentState();
    const baseline = await storage.getBaseline();
    let baselineModified = false;

    const compareSnapshot = async (extId: string, current: ExtensionSnapshot, prev?: ExtensionSnapshot) => {
        // Kiszámítjuk a kockázatot
        const risk = calculateRisk(current, prev);

        // Ha nagyon magas a kockázat és új vagy változott, szólunk
        if (risk.score >= 70 && eventType !== 'disabled' && eventType !== 'uninstalled') {
            const topReason = risk.reasons.length > 0 ? risk.reasons[0] : 'Magas kockázatú engedélyek.';
            showHighRiskNotification(current.name, topReason, current.id);
        }

        // Naplózás ha valami jelentőset találtunk (nem csak sima szkennelés)
        if (eventType !== 'updated' || (prev && (prev.version !== current.version || prev.enabled !== current.enabled))) {
            const diffs = [];
            if (prev && prev.version !== current.version) diffs.push(`Frissítve: ${prev.version} -> ${current.version}`);
            if (prev && prev.enabled !== current.enabled) diffs.push(current.enabled ? 'Engedélyezve' : 'Kikapcsolva');
            // TODO: Bővebb diff summary a jogokról

            const eventToLog = eventType === 'updated' ? (prev?.version !== current.version ? 'updated' : (prev?.enabled !== current.enabled ? (current.enabled ? 'enabled' : 'disabled') : 'permissions_changed')) : eventType;

            if (eventToLog !== 'updated' || diffs.length > 0) {
                await storage.addAuditLogEntry({
                    extensionId: current.id,
                    extensionName: current.name,
                    eventType: eventToLog as EventType,
                    riskScore: risk.score,
                    reasons: risk.reasons,
                    diffSummary: diffs.join(', ')
                });
            }
        }

        // Frissítjük a baseline-t
        baseline[extId] = current;
        baselineModified = true;
    };

    // Frissítések és új telepítések ellenőrzése
    for (const [id, currentExt] of Object.entries(currentState)) {
        const prevExt = baseline[id];

        if (!prevExt) {
            // Újonnan telepített vagy felfedezett
            await compareSnapshot(id, currentExt);
        } else {
            // Meglévő - változott valami?
            const versionChanged = prevExt.version !== currentExt.version;
            const enabledChanged = prevExt.enabled !== currentExt.enabled;
            const permsChanged = JSON.stringify(prevExt.permissions) !== JSON.stringify(currentExt.permissions);
            const hostsChanged = JSON.stringify(prevExt.hostPermissions) !== JSON.stringify(currentExt.hostPermissions);

            if (versionChanged || enabledChanged || permsChanged || hostsChanged) {
                await compareSnapshot(id, currentExt, prevExt);
            }
        }
    }

    // Eltávolított bővítmények keresése
    for (const id of Object.keys(baseline)) {
        if (!currentState[id]) {
            // Eltávolították
            await storage.addAuditLogEntry({
                extensionId: id,
                extensionName: baseline[id].name,
                eventType: 'uninstalled',
                diffSummary: 'Bővítmény eltávolítva.'
            });
            delete baseline[id];
            baselineModified = true;
        }
    }

    if (baselineModified) {
        await storage.saveBaseline(baseline);
    }
}

export async function initializeScanner() {
    const baseline = await storage.getBaseline();
    if (Object.keys(baseline).length === 0) {
        // Első futás, készítsünk snapshotot
        const state = await captureCurrentState();
        await storage.saveBaseline(state);
        console.log("Trust Monitor: Kezdeti állapot (baseline) rögzítve.");
    } else {
        // Induláskori ellenőrzés (hátha kikapcsolt állapotban történt valami)
        await detectChanges('updated');
    }
}
