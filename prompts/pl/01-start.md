# 01 — Start

Zakłada w folderze repozytorium projekt Astro z Tailwindem, uruchamia serwer deweloperski
i zapisuje projekt w twoim repozytorium na GitHubie. Bez stron i bez treści.

---

```text
Załóż w tym folderze nowy projekt strony internetowej.

Użyj Astro z Tailwind CSS. Statyczny output — bez Reacta, Vue ani Svelte, bez serwera, bez
bazy danych. Node jest już zainstalowany.

Potem uruchom serwer deweloperski i podaj mi adres, który mam otworzyć w przeglądarce.

Nie buduj jeszcze żadnych stron. Nie wymyślaj żadnej treści. Design przyjdzie w następnym
kroku i chcę, żeby strona była wtedy nadal pusta.

W trakcie pracy mów mi jedną linijką, co robi każda komenda. Nigdy wcześniej nie używałem
terminala i chcę nadążać.

Potem zrób commit wszystkiego z opisem, co zrobił ten krok, i zrób push. Powiedz mi, że krok
jest skończony, żebym mógł wyczyścić sesję.
```

---

**Oczekiwany wynik.** Kilka minut instalacji, potem linijka w rodzaju
`Local http://localhost:4321/`. Pod tym adresem jest strona zastępcza Astro. Agent trzyma
serwer uruchomiony. Potem robi commit projektu i push: commit widać w twoim repozytorium na
github.com.

**Codex pyta, czy ufasz folderowi.** Odpowiedz tak. Codex nie pracuje w folderze, któremu
nie kazano mu ufać.

**Po tym prompcie wpisz `/clear` i naciśnij Enter.** `/clear` kończy rozmowę i zaczyna nową,
z pustym kontekstem, w Claude Code i w Codeksie. Nic nie przepada: kolejny prompt czyta to,
czego potrzebuje, z plików w projekcie.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Zaczyna budować landing page | `Stop. Cofnij strony, które utworzyłeś. Chcę pusty projekt, dopóki nie dam ci designu.` |
| `Not inside a trusted directory` | Codex pyta o zgodę. Odpowiedz tak. |
| `command not found: npm` | Node nie jest zainstalowany. Wróć na stronę Przygotowanie. |
| Prosi o wybór szablonu | `Wybierz minimalny albo pusty szablon. Bez przykładowej treści.` |
| „Katalog nie jest pusty" | W folderze jest coś poza plikami gita, na przykład folder `design`. Wyjmij go, uruchom ten prompt i włóż go z powrotem przed promptem 02. |
| Przez dwie minuty nic się nie wypisuje | Instaluje. Poczekaj do pięciu minut. |
| `git push` nie działa albo prosi o hasło | Uruchom `gh auth status` w drugim terminalu. Jeśli nie jesteś zalogowany, powtórz krok Zaloguj się ze strony Przygotowanie, potem powiedz `Zrób push jeszcze raz.` |

---

### Dlaczego jest tak napisany

- „Nie buduj jeszcze żadnych stron": bez tego agent wymyśla hero, siatkę funkcji i opinie klientów, zanim zobaczy design.
- Commit na końcu każdego kroku: każdy krok jest zapisany w repozytorium i do każdego da się wrócić.
- `/clear` między krokami: każdy prompt zaczyna z pustym kontekstem i czyta stan z plików, a nie z długiej rozmowy.
