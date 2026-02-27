import { describe, it, expect } from 'vitest';
import { calculateRisk } from '../background/riskEngine';
import { ExtensionSnapshot } from '../types';

describe('Risk Engine', () => {
    const baseSnapshot: ExtensionSnapshot = {
        id: 'test-id',
        name: 'Test Extension',
        version: '1.0.0',
        enabled: true,
        installType: 'normal' as any,
        permissions: [],
        hostPermissions: []
    };

    it('Alacsony kockázatot ad átlagos bővítményre', () => {
        const result = calculateRisk(baseSnapshot);
        expect(result.score).toBe(0);
        expect(result.reasons.length).toBe(0);
    });

    it('Nagy kockázatot ad szenzitív API-k esetén', () => {
        const snapshot = { ...baseSnapshot, permissions: ['cookies', 'management'] };
        const result = calculateRisk(snapshot);
        expect(result.score).toBeGreaterThanOrEqual(30);
        expect(result.reasons[0]).toContain('Szenzitív API');
    });

    it('Nagy kockázatot ad globális host jogosultság esetén', () => {
        const snapshot = { ...baseSnapshot, hostPermissions: ['<all_urls>'] };
        const result = calculateRisk(snapshot);
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.reasons[0]).toContain('<all_urls>');
    });

    it('Megnöveli a kockázatot frissítéskori jogosultságváltozáskor', () => {
        const prevSnapshot: ExtensionSnapshot = { ...baseSnapshot, version: '1.0.0' };
        const newSnapshot: ExtensionSnapshot = {
            ...baseSnapshot,
            version: '1.1.0',
            permissions: ['cookies']
        };

        const result = calculateRisk(newSnapshot, prevSnapshot);
        expect(result.score).toBeGreaterThanOrEqual(35); // 15 (szenzitív) + 20 (új hirtelen jog)
        expect(result.reasons.some(r => r.includes('legutóbbi frissítés során hirtelen új'))).toBe(true);
    });

    it('A pontszám nem mehet 100 fölé', () => {
        const snapshot: ExtensionSnapshot = {
            ...baseSnapshot,
            permissions: ['management', 'cookies', 'webRequest', 'debugger', 'downloads'],
            hostPermissions: ['<all_urls>', 'mail.google.com', 'docs.google.com', '*://*/*']
        };
        const result = calculateRisk(snapshot);
        expect(result.score).toBe(100);
    });
});
