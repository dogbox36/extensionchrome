export function showHighRiskNotification(extensionName: string, reason: string, extensionId: string) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon48.png', // Fallback ha nincs icon, működni fog
        title: 'Biztonsági Figyelmeztetés',
        message: `A(z) ${extensionName} bővítmény gyanús változást mutat:\n${reason}`,
        buttons: [
            { title: 'Áttekintés' },
            { title: 'Figyelmen kívül hagyás' }
        ],
        priority: 2
    });

    // Gomb kattintás eseménykezelése az index.ts-ben lesz beregisztrálva,
    // de ideális esetben itt is lehet tárolni a callbacket.
}
