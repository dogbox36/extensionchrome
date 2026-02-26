# Biztonsági Modell (Threat Model & Limitations)

Ez a dokumentum a Trust Monitor biztonsági hatályát, fenyegetés-modelljét és a korlátozó tényezőket írja le. Célunk a transzparencia: nem ígérünk "feltörhetetlen" védelmet, hanem egy robosztus helyi pajzsot építettünk a gyanús változások (jogosultság eszkalációk) ellen.

## Értékelési Mechanizmus (Heurisztika)
A Trust Monitor nem tartalmaz távoli malware adatbázist, hogy elkerülje az adatvédelmi incidenseket. Helyette **jogosultásg-alapú kockázatelemzésre (Heurisztikára)** támaszkodik:
- Ha egy bővítmény gyanús jogokat ("management", "cookies") kér a felhasználótól.
- Ha egy bővítmény globális `<all_urls>` vagy egyedi érzékeny domainhez kér címet.
- Ha a frissítést követően ezek a jogok jelentősen kibővülnek.

### Korlátozások (Limitations)
*A Bővítmény NEM helyettesít egy vírusirtó szoftvert (Antivirus).*
1. **Manifest V3 korlátok**: Obfuszkált vagy futásidőben dinamikusan betöltött ártalmas logika (ami nem engedélyszintű) rejtve maradhat, mivel mi pusztán az engedélykéréseket monitorozzuk a Manifest-ből.
2. **Nincsenek "Zero-Day" Signatúrák**: Mivel offline működünk, nem rendelkezünk feketelistákkal konkrét extension ID-kre vonatkozóan, csak a kért jogokat vizsgáljuk.

## Védelmi Mechanizmusok (Watch Mode)
Az opcionális **Watch Mode** egy extra tartalom vizsgáló script, amely az explicit jóváhagyott oldalkon (pl. Gmail) gyanús DOM módosításokat (rejtett vagy teljes képernyős iFrame overlayer - clickjacking) keres. Ezt sosem futtatjuk globálisan, a túlzott *host permission* elkerülése végett.

## Sebezhetőségek jelentése
Kérjük, a forráskóddal vagy a Chrome bővítménnyel kapcsolatos sebezhetőségeket ne a publikus Issue trackerbe tegye, hanem vegye fel velünk közvetlenül a kapcsolatot.
