# 03 — Najpierw checker

Agent pisze `npm run check`: program, który testuje stronę w prawdziwej przeglądarce względem
`design/data` i zapisuje raport do pliku. Pisze go, zanim strona powstanie.

Pisanie testu przed kodem nazywa się test-driven development. Test powstaje pierwszy i nie
przechodzi, bo nie ma jeszcze czego sprawdzać. Prompt 04 buduje potem stronę, a prompt 05
poprawia ją, aż test przejdzie.

## Zanim wkleisz

Przełącz agenta w plan mode, tak jak przed promptem 02. Claude Code: `Shift+Tab`, aż w stopce
pojawi się *plan mode on*. Codex: `/plan`.

---

```text
Najpierw plan. Zbadaj, czego potrzebujesz, potem pokaż mi plan i poczekaj na moją zgodę. Nie
twórz ani nie zmieniaj żadnego pliku, dopóki go nie zatwierdzę.

Napisz teraz program, który sprawdza stronę względem designu, zanim strona powstanie.

To musi być program, nie opinia. Uruchamia się, patrzy na prawdziwą stronę w prawdziwej
przeglądarce i kończy kodem 0, jeśli wszystko jest w porządku, a kodem różnym od zera,
jeśli cokolwiek jest nie tak. Nigdy nie pyta modelu językowego, nigdy nie pyta mnie i
dwa razy na tej samej stronie daje tę samą odpowiedź.

Spraw, żeby uruchamiała go komenda „npm run check". Zainstaluj, co potrzebne, żeby
sterować prawdziwą przeglądarką i testować dostępność. To są narzędzia do sprawdzania;
żadne z nich nie wchodzi do strony.

Domyślnie sprawdza stronę uruchomioną na tym komputerze. Musi też przyjmować adres —
npm run check -- --url https://… — i uruchamiać te same testy na tamtej stronie, żeby
później mógł ocenić też stronę na żywo.

Co sprawdzać, wyprowadź z design/data, nie ode mnie. Nie ma jeszcze strony, na którą można
patrzeć: każdy test wynika z designu. Minimum, i to względem strony tak, jak renderuje ją
przeglądarka, a nie względem kodu źródłowego:

1. że projekt się buduje, bez błędów
2. że wczytanie strony nie produkuje błędów w konsoli przeglądarki
3. że każda sekcja, którą definiuje design, jest obecna i w kolejności z designu
4. że jest dostępna, przy każdej szerokości, którą design określa
5. że każdy kolor, który strona maluje, jest kolorem z designu — cokolwiek innego to błąd
6. że każdy fragment tekstu z designu jest na stronie
7. że nic nie wystaje w bok przy najwęższej szerokości, którą design określa
8. że każdy obrazek ma tekst alternatywny i że nie jest nim nazwa pliku

Kiedy coś nie przechodzi, raport musi powiedzieć cztery rzeczy: co nie przeszło, gdzie na
stronie, co według designu powinno tam być i co faktycznie tam było. „Problem
z kontrastem na stronie" jest bezużyteczne. Nazwanie elementu, wartości oczekiwanej,
wartości zmierzonej i progu — to jest cała robota.

Zapisz raport do pliku, nie tylko wypisz go na ekran, bo później podam ci ten plik
z powrotem. Powiedz mi, jak go nazwałeś.

Dwie reguły dotyczące samego checkera:

- Jeśli test nie może się wykonać — przeglądarka nie wstaje, strona się nie wczytuje,
  brakuje design/data — to jest PORAŻKA, nigdy zaliczenie i nigdy ciche pominięcie.
  Test, który się nie odbył, nie może wyglądać jak test, który przeszedł.
- Nie rozluźniaj testów, żeby przechodziły.

Twój plan ma wymienić każdy test, co czyta z design/data i jak mierzy.

Strony jeszcze nie ma. Kiedy checker będzie napisany, uruchom go od razu na projekcie takim,
jaki jest: ma nie przejść, a raport ma powiedzieć dlaczego. Test, który przechodzi na pustej
stronie, niczego nie sprawdza.

Potem zrób commit wszystkiego z opisem, co zrobił ten krok, i zrób push. Powiedz mi, że krok
jest skończony, żebym mógł wyczyścić sesję.
```

---

**Oczekiwany wynik.** Najpierw plan: testy, co każdy czyta z `design/data`, jak mierzy, jakie
narzędzia instaluje i jak nazywa się plik z raportem. Zatwierdź go albo popraw. Potem checker
powstaje i uruchamia się na pustym projekcie. Nie przechodzi, a raport mówi dlaczego przy
każdym teście: brakuje sekcji, brakuje tekstów i tak dalej. Potem commit i push.

**Po tym prompcie wpisz `/clear`.**

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Pisze kod, zanim pokaże plan | `Stop. Najpierw pokaż mi plan i poczekaj na moją zgodę.` |
| Przechodzi na pustym projekcie | `Przeszło bez strony. Pokaż mi, które testy się wykonały i co każdy zmierzył.` |
| Chce najpierw zbudować stronę, żeby test miał co sprawdzać | `W tym kroku bez strony. Test ma nie przejść na projekcie takim, jaki jest.` |
| Test jest pominięty albo oznaczony jako incomplete | `Test, który nie może się wykonać, to porażka. Niech nie przechodzi i niech powie, dlaczego się nie wykonał.` |
| Raport mówi „problem z kontrastem" bez szczegółów | `Każdy błąd musi podać element, wartość oczekiwaną, wartość zmierzoną i próg.` |
| Bierze wartości z własnego wyobrażenia o designie | `Każdy test czyta wartości z design/data. Pokaż mi, skąd pochodzi każda z nich.` |
| Pyta, jakiej biblioteki testowej użyć | `Twój wybór. Weź taką, która steruje prawdziwą przeglądarką i testuje dostępność.` |
| `npm run check -- --url https://example.com` niczego nie zmienia | `Checker musi przyjmować --url i uruchamiać te same testy na tym adresie.` |

---

### Dlaczego jest tak napisany

- Najpierw testy: test powstaje z designu, zanim jest jakakolwiek strona, więc nie da się go dopasować do tego, co zbudowano.
- Program, nie opinia: kod wyjścia 0 albo nie, ta sama odpowiedź przy każdym uruchomieniu, bez modelu językowego.
- Test, który nie może się wykonać, to porażka: narzędzia do dostępności zgłaszają tekst na zdjęciu jako „incomplete", a reguła „zero naruszeń" liczyłaby to jako zaliczenie.
