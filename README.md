# KSA Admin
Deze website wordt voornamelijk gebruikt voor het backend CMS systeem van KSA Petegem. Via dit platform ([admin.ksapetegem.be](https://admin.ksapetegem.be)) kan de webmaster van KSA Petegem alle content van de website ([ksapetegem.be](https://www.ksapetegem.be)) beheren.

## Tech-stack
- Hosting via Netlify
- Database & Auth via SupaBase
- Project coded in React Router (TS)

## Inhoud
#### Via dit platform kunnen beheerders het volgende doen:
- __Berichten__ maken / bewerken / verwijderen
- __Activiteiten__ maken / bewerken / verwijderen
- __Leidingprofielen__ maken / bewerken / verwijderen
- Documenten van de site (inschrijvingsfiche, privacyverklaring) aanpassen
- Maandelijkse brieven van groepen uploaden / aanpassen

## Required
Om dit project te kunnen draaien zul je SupaBase ENV values nodig hebben. Zet dit in een `.env.local` file.

```text
VITE_SUPABASE_URL=(URL)
VITE_SUPABASE_ANON_KEY=(KEY)
```