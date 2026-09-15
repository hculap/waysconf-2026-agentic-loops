# Idee

## Plan warsztatu

| Godzina | Część | Co robisz |
|---|---|---|
| 14:55 | Wprowadzenie | Słuchasz. |
| 15:03 | Start | Otwierasz terminal w folderze `turbine`, uruchamiasz agenta, wklejasz prompt 01. |
| 15:10 | Projekt | Wkładasz `turbine.fig` do `design/`. Plan mode, prompt 02: agent planuje i buduje dekoder `npm run design`, który zapisuje dane projektu w JSON. Odpowiadasz na jego otwarte pytania. |
| 15:25 | Checker, najpierw testy | Plan mode, prompt 03: agent pisze `npm run check` z danych projektu, zanim powstanie jakakolwiek strona. Test nie przechodzi. Pokaz: test, który nie przechodzi, i jego raport. |
| 15:40 | Budowa | Plan mode, prompt 04: agent buduje całą stronę i raz uruchamia test. Przeglądasz stronę sekcja po sekcji. |
| 15:55 | Pętla | Prompt 05: agent poprawia stronę, aż test przejdzie. |
| 16:05 | Publikacja | `/clear`, prompt 06: strona trafia na produkcję, a test uruchamia się na adresie na żywo. |
| 16:12 | Review | `/clear`, prompt 07: agent ze świeżym kontekstem próbuje zepsuć stronę. Wybierasz prawdziwe uwagi; agent je poprawia, test dalej przechodzi, a strona jest publikowana ponownie. |
| 16:20 | Ograniczenia i pytania | Słuchasz, pytasz. |

Prompty od 02 do 05 zależą od siebie: checker potrzebuje danych projektu, a strona checkera. Jeśli krok nie skończy się na czas, użyj paczki awaryjnej poniżej i idź dalej. Prompt 08 to prompty od 01 do 07 w jednej wiadomości, do użycia po warsztacie.

## Paczki awaryjne

Dwie paczki z pełnego przebiegu tych promptów. Każda zastępuje jeden krok.

| Jeśli o | Nie masz | Pobierz | Potem |
|---|---|---|---|
| RESCUE_TIME_1 | `design/data` z promptu 02 | [design-data.zip](../../design-data.zip) | Napisz agentowi `Rozpakuj design-data.zip z mojego folderu Pobrane do tego projektu, uruchom npm install i zrób commit.` Potem `/clear` i prompt 03. |
| RESCUE_TIME_2 | działającego `npm run check` z promptu 03 | [checker.zip](../../checker.zip) | Napisz agentowi `Rozpakuj checker.zip z mojego folderu Pobrane do tego projektu, uruchom npm install i zrób commit.` Potem `/clear` i prompt 04. |

---

## Jak przebiega każdy krok

Prompty 02, 03 i 04 budują coś konkretnego: dekoder, checker, stronę. Każdy przebiega tak samo:

1. **Plan mode.** Zanim wkleisz prompt, przełącz agenta w tryb planowania: w Claude Code naciskaj `Shift+Tab`, aż w stopce pojawi się *plan mode on*; w Codeksie wpisz `/plan`. Agent robi rozpoznanie i pokazuje plan. Nie może zmieniać plików, dopóki go nie zatwierdzisz.
2. **Implementacja.** Przeczytaj plan, popraw go zwykłymi słowami, zatwierdź. W Claude Code wybierz *Yes, auto-accept edits*: agent zmienia wtedy pliki bez pytania. Kiedy pierwszy raz uruchamia nowy rodzaj komendy (`npm run check`, `git push`), wybierz *Yes, and don't ask again*. Przed promptem 05, który nie ma planu, naciśnij `Shift+Tab`, aż w stopce pojawi się *accept edits on* (Codex: `/permissions`).
3. **Commit.** Na końcu kroku agent robi commit z opisem tego, co zrobił ten krok, i wypycha go do twojego repozytorium na GitHubie. Żeby cofnąć krok, napisz agentowi `Wróć do commita z kroku 03` (albo z innego kroku).
Żeby zatrzymać agenta w trakcie pracy, naciśnij `Esc`. `Ctrl+C` dwa razy zamyka agenta; uruchom go ponownie przez `claude --continue` albo `codex resume --last`.

4. **Czyszczenie.** Wpisz `/clear` (ta sama komenda w Claude Code i w Codeksie). Następny prompt zaczyna z pustym kontekstem i czyta to, czego potrzebuje, z plików: dane projektu, raport i `notes.md`.

---

## Dane projektu, nie obrazek

Prompt 02 nie dekoduje pliku `.fig` jednorazowo. Agent pisze małe narzędzie, `npm run design`, które czyta plik i zapisuje w `design/data/` jako JSON to, czego potrzebują strona i checker: sekcje, kolory, typografię, layout, komponenty, teksty i obrazy. Każdy kolejny krok czyta te pliki. Kiedy projekt się zmieni, uruchom `npm run design` jeszcze raz.

Agent, który dostaje zrzut ekranu, wyprowadza każdy kolor i wymiar z pikseli i trafia prawie. Kiedy dostaje plik, odczytuje z niego `#FF6A1A`.

---

## Najpierw testy

Test-driven development to pisanie testu przed kodem. Na tym warsztacie testem jest `npm run check`, a prompt 03 pisze go, zanim powstanie strona:

1. **Czerwono.** Test powstaje z danych projektu i uruchamia się na pustym projekcie. Nie przechodzi, a raport wypisuje wszystko, czego strona jeszcze nie ma.
2. **Zielono.** Prompt 04 buduje stronę, a prompt 05 poprawia ją, aż test przejdzie.

Test napisany po stronie zwykle opisuje stronę, która już jest. Test napisany wcześniej może opisać tylko projekt.

---

## Pętla

::diagram:01-the-loop::

- **Plan.** Agent mówi, co zmieni i dlaczego. Od drugiej rundy plan zaczyna się od raportu.
- **Implementacja.** Agent pisze kod. Za pierwszym razem generuje stronę, potem poprawia to, co wskazuje raport.
- **Weryfikacja.** Test z promptu 03, `npm run check`, sam buduje i serwuje stronę, a potem sprawdza ją w prawdziwej przeglądarce i kończy się kodem 0 (zaliczone) albo 1 (niezaliczone). Przy 1 zapisuje raport.

Pętla kończy się, gdy test zwraca 0. Wtedy praca trafia do commita, a strona na produkcję.

---

## Kto sprawdza pracę

::diagram:02-fake-loop-vs-real-loop::

Agent może sprawdzać pracę pod dwoma warunkami: nie wykonywał jej w tym samym kontekście i ma szukać błędów, a nie potwierdzać wynik.

| Kto sprawdza | Do czego się nadaje |
|---|---|
| Ten sam agent, w tym samym kontekście | Do niczego. Powtarza rozumowanie, które stworzyło pracę. |
| Program: `npm run check` | Do wszystkiego, co ma dokładną odpowiedź: sekcje, kolory, teksty, kontrast, przewijanie w poziomie. |
| Agenci ze świeżym kontekstem, którzy mają atakować (adversarial review) | Do tego, czego program nie zmierzy: kolejność czytania, bezużyteczny tekst alternatywny, tekst na zdjęciach, teksty niepasujące do marki. |

Program i review uruchamiaj równolegle. Błędy i potwierdzone uwagi trafiają do jednego raportu, a strona idzie na produkcję, gdy raport jest pusty. Na warsztacie strona najpierw trafia na produkcję, żeby każdy miał adres. Review to prompt 07 w nowej sesji, a jego poprawki są publikowane ponownie.

---

## Poziomy sprawdzania

::diagram:03-verification-tiers::

1. **Testy deterministyczne.** Build, błędy w konsoli, sekcje, kolory, teksty, kontrast, przewijanie w poziomie. Za każdym razem ten sam wynik.
2. **Porównanie mierzone.** Zrzuty ekranu porównane z projektem. Wykrywa zmianę, ale jej nie ocenia. Rysunek pokazuje checker gotowej strony; checker, który piszesz w prompcie 03, obejmuje poziom 1.
3. **Adversarial review.** Agenci ze świeżym kontekstem szukają tego, czego poziomy 1 i 2 nie zmierzą. Każda uwaga musi wskazać konkretny element i przetrwać próbę obalenia.

---

## Raport z błędami

Test zapisuje każdy błąd do pliku. Przykład:

```md
**3. [check 4] tekst poniżej minimalnego kontrastu**

- Gdzie: linijka pod nazwą w każdej karcie sekcji lineup
- Oczekiwane: kolor projektu "text / secondary", co najmniej 4.5:1 do tła
- Faktyczne: kolor projektu "text / muted", 4.07:1
- Wskazówka: muted jest przeznaczony tylko na tekst prawny i stopkę
```

Każdy błąd ma cztery pola: co nie przeszło, gdzie, czego oczekuje projekt, co jest na stronie. W następnej rundzie agent czyta ten plik, a nie swoją pamięć poprzedniej rundy.

Agent nigdy nie może edytować checkera. Jeśli może zmienić test, zaliczenie nic nie znaczy.

---

## Kontekst i notatki

Długa sesja zbiera porzucone próby i stare rozumowanie. Kiedy agent zwalnia albo odpowiada ogólnikami, przenieś stan do plików i zacznij nową sesję.

| Długa sesja | Nowa sesja |
|---|---|
| Trzyma wszystkie wcześniejsze próby | Czyta raport: aktualne błędy |
| Powtarza własne wcześniejsze rozumowanie | Czyta `notes.md`: co próbowano i z jakim skutkiem |
| Zwalnia | Czyta `design/data/`: projekt w JSON, zapisany w prompcie 02 |

```text
Zapisz do notes.md, co zostało do zrobienia, w dziesięciu linijkach: co próbowałeś,
co zadziałało, co nie i dlaczego.
```

Potem wpisz `/clear` i każ agentowi przeczytać `notes.md` i raport.

---

## Pętle i workflow

::diagram:07-loop-vs-workflow::

- **Pętla:** plan, implementacja i weryfikacja powtarzane, aż warunek będzie spełniony. Ty definiujesz warunek wyjścia. Prompt 05; w Claude Code także `/goal npm run check exits 0`.
- **Workflow:** fazy w ustalonej kolejności, z warunkiem, który musi być spełniony przed następną fazą. Faza może uruchomić kilku agentów jednocześnie. Ty definiujesz fazy. Prompt 08.

Workflow może zawierać pętlę: faza 05 promptu 08 to pętla z promptu 05.

### Wzorce workflow

Sześć sposobów układania kilku agentów w workflow. Prompt 08 używa trzech: rozgałęzienie i scalenie (faza 04), pętla do skutku (faza 05) i adversarial verification (faza 07).

#### 1. Klasyfikuj i działaj

::diagram:08-pattern-1-classify-and-act::

**Jak działa:** jeden agent czyta zadanie i przekazuje je dokładnie jednemu wyspecjalizowanemu agentowi.

**Kiedy użyć:** zadania różnego rodzaju, które wymagają różnych instrukcji. Przykład: zgłoszenia błędów kierowane do agenta od projektu, od tekstów albo od dostępności.

#### 2. Rozgałęzienie i scalenie

::diagram:08-pattern-2-fan-out-and-synthesize::

**Jak działa:** zadanie dzieli się na niezależne części, każdą obsługuje osobny agent równolegle, a ostatni krok scala wyniki.

**Kiedy użyć:** części, które od siebie nie zależą. Przykład: faza 04 promptu 08 buduje każdą sekcję strony osobnym agentem i składa je w kolejności.

#### 3. Adversarial verification

::diagram:08-pattern-3-adversarial-verification::

**Jak działa:** jeden agent daje wynik, kilku agentów ze świeżym kontekstem próbuje go podważyć, a ich uwagi wracają do pierwszego agenta.

**Kiedy użyć:** do wszystkiego, czego nie sprawdzi program. Przykład: prompt 07 i faza 07 promptu 08.

#### 4. Generuj i filtruj

::diagram:08-pattern-4-generate-and-filter::

**Jak działa:** kilku agentów tworzy wiele propozycji, a filtr z kryteriami usuwa duplikaty i słabe propozycje.

**Kiedy użyć:** potrzebujesz opcji, a nie jednej odpowiedzi. Przykład: dziesięć wersji nagłówka hero, z których trzy trafiają do projektanta.

#### 5. Turniej

::diagram:08-pattern-5-tournament::

**Jak działa:** agenci-sędziowie porównują propozycje parami, a zwycięzcy przechodzą dalej, aż zostanie jedna.

**Kiedy użyć:** wybór między kompletnymi wersjami, gdy nie ma liczbowej oceny. Przykład: cztery wersje sekcji lineup porównywane po dwie.

#### 6. Pętla do skutku

::diagram:08-pattern-6-loop-until-done::

**Jak działa:** agent pracuje, test sprawdza, czy pojawiło się coś nowego, i zaczyna się kolejna runda, aż nic nowego się nie pojawi.

**Kiedy użyć:** poprawianie, aż test przejdzie, albo review, aż runda nie znajdzie nic nowego. Przykład: prompt 05.

---

## Publikacja i sprawdzenie strony na żywo

Prompt 06 uruchamia te komendy za ciebie; nie wpisuj ich sam. Pierwszy deploy zakłada stronę: `netlify deploy --prod --dir=dist --site-name turbine-<twoja nazwa na GitHubie>`. Kolejne trafiają na tę samą stronę.

Po publikacji porównaj serwowaną stronę z plikami w `dist` i uruchom `npm run check -- --url <adres>` na adresie na żywo. Zaliczony test lokalny nie dowodzi, że strona na żywo jest ta sama: stary build, zły folder albo kod dodany przez hosting mogą ją zmienić. Prompt 06 robi oba kroki.

---

## Ograniczenia automatycznych testów

- Automatyczne reguły dostępności obejmują około 30 do 40% WCAG. Zaliczenie oznacza brak znanych błędów, a nie dostępną stronę.
- axe nie ocenia tekstu na zdjęciach ani gradientach. Oznacza takie pary jako *incomplete*, a test z regułą „zero naruszeń” traktuje incomplete jak zaliczenie. Twój checker musi zmierzyć takie pary z wyrenderowanych pikseli i nie przejść, jeśli nie da się ich zmierzyć.
- Porównanie zrzutów ekranu wykrywa zmianę. Nie mówi, czy zmiana jest lepsza.
- Żaden z tych testów nie ocenia, czy sam projekt jest dobry.

---

## Częste problemy

| Objaw | Przyczyna | Co zrobić |
|---|---|---|
| Test zmienia się na zielony, a nic nie zostało poprawione | Agent edytował test | Przywróć test i przeczytaj różnice |
| Dwa błędne stany na zmianę | Dwa wymagania, które nie mogą być spełnione naraz | Zatrzymaj pętlę. Sprzeczność jest w projekcie albo w briefie |
| Pracuje dalej, choć zadanie jest skończone | Nic nie uruchamia testu na początku | Uruchamiaj test przed każdą poprawką |
| Zwalnia i odpowiada ogólnikami | Kontekst jest pełny | Zapisz stan do `notes.md`, zacznij nową sesję |
| „Już działa”, a nie działa | Agent relacjonuje zamiast mierzyć | Ufaj tylko kodowi wyjścia `npm run check` |
| Długo nic się nie dzieje | Krok czeka na dane bez limitu czasu | Daj każdemu krokowi limit czasu |

---

## Po warsztacie

Zacznij od jednego testu, nie od całej strony:

1. Wybierz test, który twój zespół robi ręcznie.
2. Zamień go w program, który kończy się kodem 0 albo 1.
3. Zapisuj jego wynik do pliku, który agent może przeczytać.
4. Dopiero wtedy postaw przed nim agenta.
