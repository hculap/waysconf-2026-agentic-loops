# Idee

## Plan warsztatu

| Godzina | Część | Co robisz |
|---|---|---|
| 14:55 | Wprowadzenie | Słuchasz. |
| 15:03 | Start | Otwierasz terminal w folderze `turbine`, uruchamiasz agenta, wklejasz prompt 01. |
| 15:10 | Projekt | Wkładasz `turbine.fig` do `design/` i wklejasz prompt 02. Agent dekoduje plik przez 10 do 16 minut. |
| 15:20 | Budowa | Czytasz ustalenia agenta, odpowiadasz na jego otwarte pytania, wklejasz prompt 03. Przeglądasz stronę sekcja po sekcji. |
| 15:35 | Checker | Wklejasz prompt 04. Agent pisze `npm run check`. Pokaz: test, który nie przechodzi, i jego raport. |
| 15:50 | Pętla | Wklejasz prompt 05. Agent poprawia stronę, aż test przejdzie. |
| 16:05 | Publikacja | Wklejasz prompt 06, potem prompt 07. |
| 16:17 | Ograniczenia i pytania | Słuchasz, pytasz. |

Każdy prompt działa samodzielnie. Jeśli któryś się nie uda, każ agentowi przerwać i wklej następny. Prompt 08 to prompty od 01 do 07 w jednej wiadomości, do użycia po warsztacie.

---

## Pętla

::diagram:01-the-loop::

- **Plan.** Agent mówi, co zmieni i dlaczego. Od drugiej rundy plan zaczyna się od raportu.
- **Implementacja.** Agent pisze kod. Za pierwszym razem generuje stronę, potem poprawia to, co wskazuje raport.
- **Weryfikacja.** Program `npm run check` testuje stronę w prawdziwej przeglądarce i kończy się kodem 0 (zaliczone) albo 1 (niezaliczone). Przy 1 zapisuje raport.

Pętla kończy się, gdy test zwraca 0. Wtedy strona idzie na produkcję.

---

## Kto sprawdza pracę

::diagram:02-fake-loop-vs-real-loop::

Agent może sprawdzać pracę pod dwoma warunkami: nie wykonywał jej w tym samym kontekście i ma szukać błędów, a nie potwierdzać wynik.

| Kto sprawdza | Do czego się nadaje |
|---|---|
| Ten sam agent, w tym samym kontekście | Do niczego. Powtarza rozumowanie, które stworzyło pracę. |
| Program: `npm run check` | Do wszystkiego, co ma dokładną odpowiedź: sekcje, kolory, teksty, kontrast, przewijanie w poziomie. |
| Agenci ze świeżym kontekstem, którzy mają atakować (adversarial review) | Do tego, czego program nie zmierzy: kolejność czytania, bezużyteczny tekst alternatywny, tekst na zdjęciach, teksty niepasujące do marki. |

Program i review uruchamiaj równolegle. Błędy i potwierdzone uwagi trafiają do jednego raportu, a strona idzie na produkcję, gdy raport jest pusty. Na warsztacie review to prompt 07, wklejany w nowej sesji.

---

## Najpierw plan, potem kod

W Claude Code naciskaj `Shift+Tab`, aż w stopce pojawi się *plan mode on*. Agent nie może edytować plików, dopóki nie zatwierdzisz planu. W Codeksie poproś o plan wprost:

```text
Nie pisz jeszcze żadnego kodu. Powiedz mi, co znalazłeś i co zamierzasz zbudować, i czekaj.
```

Prompt 02 działa tak samo: agent czyta projekt i nie pisze kodu strony.

---

## Poziomy sprawdzania

::diagram:03-verification-tiers::

1. **Testy deterministyczne.** Build, błędy w konsoli, sekcje, kolory, teksty, kontrast, przewijanie w poziomie. Za każdym razem ten sam wynik.
2. **Porównanie mierzone.** Zrzuty ekranu porównane z projektem. Wykrywa zmianę, ale jej nie ocenia.
3. **Adversarial review.** Agenci ze świeżym kontekstem szukają tego, czego poziomy 1 i 2 nie zmierzą. Każda uwaga musi wskazać konkretny element i przetrwać próbę obalenia.

---

## Raport z błędami

Test zapisuje każdy błąd do pliku. Przykład:

```md
**3. [check 07] kolor na stronie nie pochodzi z projektu**

- Gdzie: linijka pod nazwą w każdej karcie sekcji lineup
- Oczekiwane: kolor projektu "text / secondary"
- Faktyczne: kolor projektu "text / muted", 4.07:1 do tła strony;
             tekst podstawowy wymaga 4.5:1
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
| Zwalnia | Czyta `docs/`: projekt spisany w prompcie 02 |

```text
Zapisz do notes.md, co zostało do zrobienia, w dziesięciu linijkach: co próbowałeś,
co zadziałało, co nie i dlaczego.
```

Potem zacznij nową sesję i każ agentowi przeczytać `docs` i `notes.md`.

---

## Pętle i workflow

::diagram:07-loop-vs-workflow::

- **Pętla:** plan, implementacja i weryfikacja powtarzane, aż warunek będzie spełniony. Ty definiujesz warunek wyjścia. Prompt 05; w Claude Code także `/goal npm run check exits 0`.
- **Workflow:** fazy w ustalonej kolejności, z warunkiem, który musi być spełniony przed następną fazą. Faza może uruchomić kilku agentów jednocześnie. Ty definiujesz fazy. Prompt 08.

Workflow może zawierać pętlę: faza 05 promptu 08 to pętla z promptu 05.

### Wzorce workflow

Sześć sposobów układania kilku agentów w workflow. Prompt 08 używa trzech: rozgałęzienie i scalenie (faza 03), pętla do skutku (faza 05) i adversarial verification (faza 07).

#### 1. Klasyfikuj i działaj

::diagram:08-pattern-1-classify-and-act::

**Jak działa:** jeden agent czyta zadanie i przekazuje je dokładnie jednemu wyspecjalizowanemu agentowi.

**Kiedy użyć:** zadania różnego rodzaju, które wymagają różnych instrukcji. Przykład: zgłoszenia błędów kierowane do agenta od projektu, od tekstów albo od dostępności.

#### 2. Rozgałęzienie i scalenie

::diagram:08-pattern-2-fan-out-and-synthesize::

**Jak działa:** zadanie dzieli się na niezależne części, każdą obsługuje osobny agent równolegle, a ostatni krok scala wyniki.

**Kiedy użyć:** części, które od siebie nie zależą. Przykład: faza 03 promptu 08 buduje każdą sekcję strony osobnym agentem i składa je w kolejności.

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

```bash
npm run build
netlify deploy --prod --dir=dist
```

Po publikacji porównaj serwowaną stronę z plikami w `dist` i uruchom `npm run check -- --url <adres>` na adresie na żywo. Zaliczony test lokalny nie dowodzi, że strona na żywo jest ta sama: stary build, zły folder albo kod dodany przez hosting mogą ją zmienić. Prompt 06 robi oba kroki.

---

## Ograniczenia automatycznych testów

- Automatyczne reguły dostępności obejmują około 30 do 40% WCAG. Zaliczenie oznacza brak znanych błędów, a nie dostępną stronę.
- axe nie ocenia tekstu na zdjęciach ani gradientach. Oznacza takie pary jako *incomplete*, a test z regułą „zero naruszeń” traktuje incomplete jak zaliczenie. Twój checker musi liczyć incomplete jako błąd.
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
