# Chrome Web Store Listing

## Extension Name
Extension Trust Monitor

## Short Description
Átfogó biztonsági pajzs a telepített Chrome bővítményei védelmére. Figyeli a kockázatos jogosultság-változásokat és frissítéseket.

## Detailed Description
**Fedezze fel és kezelje a gyanús böngészőbővítményeket egyetlen kattintással!**
Számos bővítmény ártalmatlannak tűnik, de a frissítések során rejtve adathalász vagy felesleges hozzáférési engedélyekhez juthatnak ("jogosultsági eszkaláció"). Az *Extension Trust Monitor* a böngészőjén belüli biztonsági testőrként szolgál, folyamatosan figyelve a kockázatos tevékenységekre. 

### 🛡️ Kiemelt Funkciók (Features):
* **Folyamatos Figyelés:** Figyel minden telepített bővítményt, és detektálja az engedélyek kritikus változásait.
* **Érthető Kockázatelemzés (Risk Engine):** 0-100-ig terjedő skálán értékeli a bővítményeket, és pontosan elmagyarázza emberi nyelven, MILYEN veszélye van a kért jogoknak.
* **Változások Naplózása (Audit Log):** Visszamenőlegesen megnézheti, melyik kiegészítő mikor frissült, és mikor kért új jogokat, az egészet pedig utána letöltheti JSON fájlban.
* **Tartalmi Védelem (Watch Mode):** Kiemelt oldalakon (mint a levelezése) védelmet biztosít a "Clickjacking" és álcázott beavatkozók ellen (Opcionális).

### 🔒 Privacy-First
Ez a bővítmény **NEM CSERÉL ADATOT SEMMILYEN SZERVERREL**. Minden adat – a profilozástól a naplózásig – kizárólag az Ön saját számítógépén él. Nincs telemetria. 

### Miért kéri a `management` engedélyt?
A Bővítmény a Chrome *management API*-ját (és a `management` manifest permission-t) használja a telepített alkalmazások naplózására (verzió és jogosultságok ellenőrzése), ahhoz, hogy detektálni tudja, egy harmadik féltől származó alkalmazás próbálja-e rosszindulatúan megváltoztatni saját beállításait. A telepített alkalmazások listáját semmilyen szerverre nem töltjük fel.

### Figyelmeztetés (Korlátozások):
Az *Extension Trust Monitor* a Manifest alapú engedélyeket auditálja, ezáltal a leggyakoribb esetekben jól teljesít, de nem helyettesíti az olyan tradicionális anti-vírus szoftvereket, amik a memóriában lévő futtatható kódokat vizsgálják.

---

## Required Clearances for Reviewer
Tiszteletben tartva a "Chrome Web Store Developer Program Policies" elveket:
1. **Single Purpose:** A kiegészítő kizárólagos célja az egyéb bővítmények jogosultsági és biztonsági elemzése.
2. **Minimal Permissions:** A `management` API az egyetlen út a többi kiegészítő állapotának olvasásához, az `alarms` a háttér futáshoz, és a `storage` a lokális adatok mentéséhez.
3. **No Deceptive Behavior:** Transzparens magyarázatot adunk, a fenyegetéseket nem tupírozzuk fel, hanem edukáljuk a felhasználót. Nincsenek hamis rendszer/OS figyelmeztetés klónok.
