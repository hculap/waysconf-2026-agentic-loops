# 01 — Start

Na wejściu pusty folder, na wyjściu strona działająca na twoim komputerze. Nic jeszcze nie
jest zaprojektowane; to tylko warsztat pracy.

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
```

---

**Codex zapyta, czy ufa temu folderowi.** Odpowiedz tak. Nie pracuje w katalogu, o którym mu nie powiedziano, więc w nowym, pustym folderze pierwsze, co zrobi, to zatrzyma się i zapyta. To narzędzie jest ostrożne, a nie coś się psuje.

**Co powinieneś zobaczyć.** Kilka minut instalowania, potem linijkę w rodzaju
`Local http://localhost:4321/`. Otwórz ją. Dostaniesz stronę zastępczą Astro — prostą,
brzydką, poprawną.

**Terminal jest teraz zajęty.** To okno uruchamia stronę i nie przyjmie kolejnej komendy.
Zostaw je i otwórz drugie. W Claude Code i w Codeksie możesz po prostu pisać dalej; one to
ogarniają.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| I tak zaczyna budować landing page | `Stop. Cofnij strony, które utworzyłeś. Chcę pusty projekt, dopóki nie dam ci designu.` |
| `Not inside a trusted directory` | To Codex pyta o zgodę. Odpowiedz tak albo najpierw uruchom w folderze `git init`. |
| `command not found: npm` | Node nie jest zainstalowany. Wróć na zakładkę **Przed** albo przejdź tam na wersję w przeglądarce. |
| Prosi o wybór szablonu | `Wybierz minimalny albo pusty szablon. Bez przykładowej treści.` |
| „Katalog nie jest pusty" | Włożyłeś folder z designem przed tym promptem. Wyjmij go, uruchom ten prompt i włóż go z powrotem przed promptem 02. |
| Przez dwie minuty nic się nie dzieje | Instaluje. Instalowanie wygląda dokładnie jak zawieszenie. Daj mu pięć. |

---

### Dlaczego to jest tak sformułowane

**„Nie buduj jeszcze żadnych stron."** Zostawiony sam sobie agent zapełni ciszę — wymyśli
hero, siatkę funkcji i trzy opinie klientów, zanim powiesz słowo o tym, czego chcesz.
Mówienie, czego *nie* robić, to połowa promptowania, i to jest ta połowa, którą ludzie
pomijają.

**„Mów mi jedną linijką, co robi każda komenda."** Możesz o to prosić. Agent to nie tylko
maszyna produkująca pliki; to jedyny cierpliwy tłumacz, jakiego będziesz miał przez całe
popołudnie.
