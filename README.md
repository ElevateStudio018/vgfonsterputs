# Västgöta Fönsterputs – ny webbplats

Statisk omarbetning av vgfonsterputs.se. All text och alla bilder kommer från originalsajten
(bilderna är nedskalade till max 1600 px och rensade från EXIF/GPS-data).

- `index.html` – en sida: hero med snabbpris, nyckeltal, tjänster, RUT, företaget, referenser (lightbox), prisräknare/offert, kontakt
- `assets/style.css` – design (Poppins, marinblått med logotypens gula som accent)
- `assets/app.js` – meny, galleri och prisräknaren

## Prisräknaren
Alla priser ligger i objektet `PRICES` högst upp i `assets/app.js` (fönstertyper, tillval,
höjdtillägg, abonnemangsrabatter, framkörning, minimidebitering, RUT 50 %, moms).
**Priserna är exempelvärden – justera dem till verkliga priser innan publicering.**

Privatkunder ser pris efter RUT-avdrag (endast arbetskostnad, ej framkörning). Företag ser pris exkl. moms.

Förfrågan skickas till samma Formspree-formulär som gamla sajten (`xwpeoova`) med en färdig
sammanfattning i fältet `offert_sammanfattning`. Om sändningen misslyckas erbjuds e-post som reserv.
