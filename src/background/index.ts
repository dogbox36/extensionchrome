import { initializeScanner, detectChanges } from './scanner';

console.log("Trust Monitor Background Service Worker elindítva.");

// Bővítmény telepítésekor alarm beállítása
chrome.runtime.onInstalled.addListener(() => {
    // Napi többszöri (pl. 6 óránkénti) ellenőrzés alarm beállítása
    chrome.alarms.create('periodic-scan', { periodInMinutes: 6 * 60 });
});

// A szkenner minden induláskor lefut, de a scanner.ts onnan folytatja ahol abbahagyta
initializeScanner();

// Alarm kezelő a periodikus ellenőrzéshez
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'periodic-scan') {
        detectChanges('updated'); // A scanner.ts úgy van megírva, hogy felismeri a diff-eket
    }
});

// Chrome Management API Eseményfigyelők
// Amikor egy új bővítményt telepítenek
chrome.management.onInstalled.addListener((info) => {
    if (info.id !== chrome.runtime.id) {
        detectChanges('installed', info.id);
    }
});

// Amikor eltávolítanak egy bővítményt
chrome.management.onUninstalled.addListener((id) => {
    if (id !== chrome.runtime.id) {
        detectChanges('uninstalled', id);
    }
});

// Engedélyezéskor
chrome.management.onEnabled.addListener((info) => {
    if (info.id !== chrome.runtime.id) {
        detectChanges('enabled', info.id);
    }
});

// Letiltáskor
chrome.management.onDisabled.addListener((info) => {
    if (info.id !== chrome.runtime.id) {
        detectChanges('disabled', info.id);
    }
});

// Értesítésre kattintás kezelése
chrome.notifications.onButtonClicked.addListener((_notificationId, buttonIndex) => {
    // A buttonIndex 0 az 'Áttekintés' gomb lesz
    if (buttonIndex === 0) {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/ui/pages/dashboard.html') });
    }
});
