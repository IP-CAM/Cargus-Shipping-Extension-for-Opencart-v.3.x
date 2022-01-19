## Manual instalare modul Cargus OpenCart

### Abonarea la API

- Se acceseaza https://cargus.portal.azure-api.net/
- Se apasa butonul `Sign up` si se completeaza formularul (nu se pot folosi credentialele pe care clientul le are pentru UrgentOnline / WebExpress)
- Se confirma inregistrarea prin click pe link-ul primit pe mail (trebuie folosita o adresa de email reala)
- In pagina https://cargus.portal.azure-api.net/developer se da click pe `PRODUCTS` in menu, apoi pe `UrgentOnlineAPI` si se apasa `Subscribe`, apoi `Confirm`
- Dupa ce echipa Cargus confirma subscriptia la API, clientul primeste un email de confirmare
- In pagina https://cargus.portal.azure-api.net/developer se da click pe numele utilizatorului din partea dreapta-sus, apoi se apasa `Profile`
- Cele doua subscription keys sunt mascate de caracterele `xxx...xxx` si se apasa `Show` in dreptul fiecareia pentru afisare
- Se recomanda utilizarea `Primary key` in modulul Cargus

### Instalarea modulului

- In admin OpenCart se acceseaza `Extensions`, apoi `Extension Installer`
- Prin click pe `Upload` se alege fisierul `cargus.ocmod.zip`, dupa care se apasa `Continue`
- Dupa confirmarea instalarii extensiei, se acceseaza `Extensions`, apoi `Modifications`
- Se da click pe butonul albastru `Refresh` din partea dreapta-sus a paginii
- In menu-ul principal din partea stanga o sa apara o optinue noua, numita `Cargus`
- Se acceseaza pagina `Cargus`, apoi `Configuration` si se completeaza formularul, dupa care se apasa butonul albastru `Save` din partea dreapta-sus a paginii

### Configurarea modulului

- API Url: https://urgentcargus.azure-api.net/api
- Subscription Key: Primary key obtinuta in pasul A. Abonarea la API
- Username: numele de utilizator al contului clientului in platforma UrgentOnline / WebExpress
- Password: parola aferenta contului mentionat mai sus
- Tax Class: se alege clasa de taxe aferenta TVA-ului din Romania, de obicei aceeasi ca la produse
- Geo Zone: se alege regiunea geografica in care metoda de livrare Cargus sa fie disponibila
- Status: se alege daca metoda de livrare este activa sau nu
- Sort Order: se adauga o valoare numerica, aferenta ordinii intre celelalte metode de livrare active

### Setarea preferintelor in modul

- Se acceseaza pagina `Cargus`, apoi `Preferences` si se completeaza formularul, dupa care se apasa butonul albastru `Save` din partea dreapta-sus a paginii
- Pickup Location: se alege unul din punctele de ridicare dispnibile. Daca nu exista niciun punct de ridicare disponibil, trebuie adaugat unul din UrgentOnline / WebExpress
- Insurance: se alege daca livrarea se face cu asigurare sau fara
- Saturday Delivery: se alege daca este permisa livrarea in zilele de sambata
- Morning Delivery: se alge daca este utilizat serviciul livrare matinala
- Open Package: se alege daca este utilizat serviciul deschidere colet
- Repayment: se alege tipul rambursului – Cash (Numerar) sau Bank (Cont colector)
- Payer: se alege platitorul costului de livrare – Sender (Expeditorul) sau Recipinet (Destinatarul)
- Default shipment type: se alege tipul de expeditie uzuala – Parcel (Colet) sau Envelope (Plic)
- Free shipping after: se introduce limita pentru care cumparaturile mai mari de beneficiaza de transport gratuit (plata transportului se face automat la expeditor)
- Pickup from Cargus: se alege daca este oferita posibilitatea ridicarii coletului de catre destinatar din cel mai apropiat depozit Cargus
- Fixed shipping price: se alege un cost fix de livrare sau se lasa necompletat, pentru ca modulul sa calculeze automat tariful
