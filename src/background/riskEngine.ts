import { ExtensionSnapshot, RiskScoreResult } from '../types';

const SENSITIVE_PERMISSIONS = new Set([
    'management', 'cookies', 'webRequest', 'declarativeNetRequest',
    'debugger', 'downloads', 'history', 'nativeMessaging',
    'proxy', 'privacy', 'tabCapture'
]);

const SENSITIVE_DOMAINS = [
    'mail.google.com', 'drive.google.com', 'docs.google.com',
    'web.whatsapp.com', 'outlook.office.com'
];

export function calculateRisk(
    snapshot: ExtensionSnapshot,
    previousSnapshot?: ExtensionSnapshot
): RiskScoreResult {
    let score = 0;
    const reasons: string[] = [];
    const recommendedActions: string[] = [];

    // 1. Szenzitív API engedélyek (Nagy súly)
    const newSensitivePerms = snapshot.permissions.filter(p => SENSITIVE_PERMISSIONS.has(p));
    if (newSensitivePerms.length > 0) {
        score += Math.min(newSensitivePerms.length * 15, 50);
        reasons.push(`Szenzitív API jogosultságokat használ: ${newSensitivePerms.join(', ')}.`);
    }

    // 2. Globális vagy szenzitív Host engedélyek (Nagy súly)
    let globMatches = false;
    const sensitiveHosts: string[] = [];
    for (const host of snapshot.hostPermissions) {
        if (host.includes('<all_urls>') || host.includes('*://*/*')) {
            globMatches = true;
        }
        for (const domain of SENSITIVE_DOMAINS) {
            if (host.includes(domain)) {
                sensitiveHosts.push(domain);
            }
        }
    }

    if (globMatches) {
        score += 40;
        reasons.push('Minden weboldalhoz hozzáférést kér (<all_urls> vagy globális minta).');
    }

    if (sensitiveHosts.length > 0) {
        score += sensitiveHosts.length * 10;
        reasons.push(`Szenzitív weboldalakhoz (pl. levelezés, dokumentumok) kér hozzáférést: ${sensitiveHosts.join(', ')}.`);
    }

    // 3. Tartalom injektálás (Közepes súly)
    const hasScripting = snapshot.permissions.includes('scripting');
    // Egyszerű heurisztika: ha van host permission és scripting, az potenciális injektálás
    if (hasScripting && snapshot.hostPermissions.length > 0) {
        score += 15;
        reasons.push('Képes scripteket futtatni a meglátogatott weboldalakon (Content injection rizikó).');
    }

    // 4. Hirtelen frissülés új jogokkal (Extra súly)
    if (previousSnapshot && previousSnapshot.version !== snapshot.version) {
        const newlyAddedPerms = snapshot.permissions.filter(p => !previousSnapshot.permissions.includes(p) && SENSITIVE_PERMISSIONS.has(p));
        const newlyAddedHosts = snapshot.hostPermissions.filter(h => !previousSnapshot.hostPermissions.includes(h) && (h.includes('<all_urls>') || SENSITIVE_DOMAINS.some(d => h.includes(d))));

        if (newlyAddedPerms.length > 0 || newlyAddedHosts.length > 0) {
            score += 20;
            reasons.push('A legutóbbi frissítés során hirtelen új, szenzitív jogosultságokat kért.');
        }
    }

    // Cap score at 100
    score = Math.min(score, 100);

    if (score >= 70) {
        recommendedActions.push('Erősen javasolt a bővítmény kikapcsolása vagy eltávolítása, ha nem feltétlenül szükséges.');
    } else if (score >= 40) {
        recommendedActions.push('Érdemes átgondolni, hogy valóban szükség van-e a bővítmény által kért jogokra.');
    }

    return { score, reasons, recommendedActions };
}
