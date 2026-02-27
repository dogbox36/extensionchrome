console.log("Trust Monitor Watch Mode betöltve.");

// Alapvető heurisztikák a DOM-ban történő gyanús beavatkozásokra
// Ezt csak a felhasználó által engedélyezett (érzékeny) oldalakon injektáljuk

let suspended = false;

const BAD_DOMAINS = [
    'malicious.example.com', 'tracker.xyz'
];

function checkOverlays() {
    if (suspended) return;

    const iframes = document.querySelectorAll('iframe');

    for (let i = 0; i < iframes.length; i++) {
        const frame = iframes[i];

        // Vizsgáljuk, hogy az iframe lefedi-e a teljes képernyőt (clickjacking / phishing overlay gyanú)
        const rect = frame.getBoundingClientRect();
        const isFullScreen = (
            rect.width >= window.innerWidth * 0.9 &&
            rect.height >= window.innerHeight * 0.9 &&
            rect.top <= window.innerHeight * 0.1
        );

        // Vizsgáljuk, hogy az src címe gyanús-e (cross-origin és nem ismert google api, ha google oldalon vagyunk)
        let isCrossDomain = false;
        try {
            const srcUrl = new URL(frame.src);
            isCrossDomain = srcUrl.hostname !== window.location.hostname;
        } catch (e) { /* Helyi üres frame lehet */ }

        if (isFullScreen && isCrossDomain) {
            alert("⚠️ Trust Monitor Figyelmeztetés:\n\nEgy másik bővítmény egy teljes képernyős réteget (iframe) helyezett az oldal fölé. Ez biztonsági kockázatot jelenthet (Adathalászat / Clickjacking)!");
            suspended = true; // Csak egyszer szólunk
            break;
        }
    }
}

function checkSuspiciousScripts() {
    if (suspended) return;

    const scripts = document.querySelectorAll('script');
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src) {
            for (const badDomain of BAD_DOMAINS) {
                if (src.includes(badDomain)) {
                    console.error(`Trust Monitor: Gyanús script betöltés blokkolva/jelezve: ${src}`);
                    // alert("⚠️ Trust Monitor Figyelmeztetés: Ismert gyanús script betöltődött ezen az oldalon egy webes bővítmény vagy hirdetés miatt.");
                    suspended = true;
                    break;
                }
            }
        }
    }
}

function checkCryptoMining() {
    if (suspended) return;
    const miningVars = ['CoinHive', 'CryptoNoter', 'JSECoin', 'CH'];
    for (const v of miningVars) {
        if ((window as any)[v]) {
            console.error(`Trust Monitor: Kriptobányász (Cryptomining) script detektálva: ${v}`);
            alert(`⚠️ Trust Monitor Figyelmeztetés:\n\nKriptobányász tevékenység észlelve (${v}) a háttérben!`);
            suspended = true;
            break;
        }
    }
}

function initKeyloggerHeuristics() {
    let lastKeypressTime = 0;
    let rapidKeyCount = 0;

    document.addEventListener('keydown', (e) => {
        if (suspended) return;
        if (!e.isTrusted) {
            rapidKeyCount += 10;
        } else {
            const now = Date.now();
            if (now - lastKeypressTime < 20) {
                rapidKeyCount++;
            } else {
                rapidKeyCount = 1;
            }
            lastKeypressTime = now;
        }

        if (rapidKeyCount > 50) {
            alert("⚠️ Trust Monitor Figyelmeztetés:\n\nGyanús szintetikus billentyűzet-aktivitás (Keylogger/Form manipuláció)!");
            suspended = true;
            rapidKeyCount = 0;
        }
    }, { capture: true, passive: true });
}

initKeyloggerHeuristics();


// Futás kis késleltetéssel és időszakosan
setTimeout(() => {
    checkOverlays();
    checkSuspiciousScripts();
    checkCryptoMining();
}, 2000);

setInterval(() => {
    checkOverlays();
    checkSuspiciousScripts();
    checkCryptoMining();
}, 5000);
