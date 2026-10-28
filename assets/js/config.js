/* Setări care se pot schimba fără să atingi codul.

   AFYZE_API   — adresa backend-ului.
     ""  → site-ul caută backend-ul pe același domeniu (de ex. http://localhost:3000 când rulezi npm start).
     Pe GitHub Pages, fără backend, site-ul funcționează normal: formularul deschide e-mailul.
     Când publici backend-ul (de ex. https://api.afyze.com), scrie adresa aici.

   AFYZE_CONTACT — butoanele de mesagerie. Cât timp sunt goale, butoanele rămân ascunse.
     telegram: numele de utilizator, fără @ (ex. "afyze")
     viber:    numărul de telefon, cu prefix (ex. "+37360000000")
   Dacă backend-ul rulează, valorile din panou (Conținut → Date de contact) au prioritate. */
window.AFYZE_API = "";
window.AFYZE_CONTACT = {
  telegram: "",
  viber: ""
};
