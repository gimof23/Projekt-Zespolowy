# CinemaŚty - System Zarządzania Kinem

Projekt zespołowy realizowany w ramach studiów na kierunku Informatyka. Aplikacja webowa typu Full-stack służąca do kompleksowej obsługi kina: od procesu rezerwacji biletów po zaawansowane panele administracyjne i analizę sprzedaży.

---

## Struktura Zespołu i Role

| Rola | Zakres odpowiedzialności |
| :--- | :--- |
| **Team Leader / Tester** | Koordynacja prac, zarządzanie repozytorium, testy funkcjonalne i akceptacyjne. |
| **Backend Developers** | Architektura serwerowa, logika biznesowa, API, integracja z bazą danych, bezpieczeństwo. |
| **Frontend Developers** | Implementacja widoków, responsywność (RWD), integracja z silnikiem szablonów. |
| **UX/UI Designer** | Projektowanie interfejsu użytkownika, makiety systemu rezerwacji i map sal. |
| **Database Manager** | Modelowanie relacyjnej bazy danych, optymalizacja zapytań i spójność danych. |

---

## Technologie i Architektura

Projekt stawia na wydajność oraz wykorzystanie nowoczesnych standardów programowania.

* **Backend:** Node.js z frameworkiem Express.js.
* **Frontend:** Silnik szablonów Handlebars (HBS) oraz Tailwind CSS (Modern CSS).
* **Baza danych:** Relacyjna baza danych MySQL.
* **Bezpieczeństwo:** Szyfrowanie haseł przy użyciu biblioteki bcrypt.js oraz zarządzanie sesjami (Express-Session).
* **Integracje:** System generowania biletów PDF (PDFKit), generowanie kodów QR do weryfikacji oraz obsługa powiadomień SMTP (Nodemailer).

---

## Funkcjonalności Systemu

* **Panel Klienta:** Przeglądanie aktualnego repertuaru, interaktywny wybór miejsc na mapie sali (miejsce/fotel/kanapa), zakup biletów online oraz automatyczny odbiór biletów PDF z kodem QR na e-mail.
* **Panel Pracownika:** Obsługa sprzedaży stacjonarnej w kasie kinowej, weryfikacja biletów poprzez skanowanie kodów QR oraz generowanie raportów dziennych (utarg i frekwencja).
* **Panel Administratora:** Zarządzanie bazą filmów i seansów, edytor układu foteli w salach kinowych oraz analityka statystyk sprzedaży.

---

## Dokumentacja

Szczegółowa dokumentacja projektowa zawierająca diagramy przypadków użycia (UML), diagramy aktywności oraz harmonogram realizacji prac (Sprinty) znajduje się w folderze /docs niniejszego repozytorium.
