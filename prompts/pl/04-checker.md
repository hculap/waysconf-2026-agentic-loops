# 04 — Napisz checker

Agent pisze `npm run check`: program, który testuje stronę w prawdziwej przeglądarce względem
dokumentów w `docs` i zapisuje raport do pliku. Prompt nie podaje żadnego koloru, szerokości
ani sekcji; agent bierze je z designu.

---

```text
Napisz teraz program, który sprawdza twoją własną pracę względem designu.

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

Co sprawdzać, wyprowadź z dokumentów w docs, nie ode mnie. Minimum, i to względem strony tak, jak
renderuje ją przeglądarka, a nie względem kodu źródłowego:

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

Zapisz raport do pliku, nie tylko wypisz go na ekran, bo w następnym kroku podam ci ten
plik z powrotem. Powiedz mi, jak go nazwałeś.

Dwie reguły dotyczące samego checkera:

- Jeśli test nie może się wykonać — przeglądarka nie wstaje, strona się nie wczytuje,
  brakuje dokumentu w docs — to jest PORAŻKA, nigdy zaliczenie i nigdy ciche pominięcie.
  Test, który się nie odbył, nie może wyglądać jak test, który przeszedł.
- Nie rozluźniaj testów, żeby przechodziły. Spodziewam się, że to się wywali. Jeśli
  przejdzie za pierwszym razem, uznam, że nic nie sprawdza.

Kiedy będzie gotowe, uruchom to i pokaż mi wynik.
```

---

**Oczekiwany wynik.** Checker się uruchamia i nie przechodzi, z listą błędów. Każdy błąd
podaje element, wartość oczekiwaną, wartość zmierzoną i próg. Checker, który przechodzi przy
pierwszym uruchomieniu, niczego nie sprawdza.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Przechodzi przy pierwszym uruchomieniu | `Przeszło za pierwszym razem. Pokaż mi, które testy się wykonały i co każdy zmierzył.` |
| Test jest pominięty albo oznaczony jako incomplete | `Test, który nie może się wykonać, to porażka. Niech nie przechodzi i niech powie, dlaczego się nie wykonał.` |
| Raport mówi „problem z kontrastem" bez szczegółów | `Każdy błąd musi podać element, wartość oczekiwaną, wartość zmierzoną i próg.` |
| Pyta, jakiej biblioteki testowej użyć | `Twój wybór. Weź taką, która steruje prawdziwą przeglądarką i testuje dostępność.` |
| `npm run check -- --url https://example.com` niczego nie zmienia | `Checker musi przyjmować --url i uruchamiać te same testy na tym adresie.` |

---

### Dlaczego jest tak napisany

- Program, nie opinia: kod wyjścia 0 albo nie, ta sama odpowiedź przy każdym uruchomieniu, bez modelu językowego.
- Test, który nie może się wykonać, to porażka: narzędzia do dostępności zgłaszają tekst na zdjęciu jako „incomplete", a reguła „zero naruszeń" liczyłaby to jako zaliczenie.
- Przyjmuje `--url`: prompt 06 uruchamia te same testy na stronie na żywo.
