# 04 — Napisz checker

**To jest ten warsztat.** Wszystko wcześniej było doprowadzaniem strony na ekran. Wszystko
później zależy od tego, co stanie się tutaj.

Za chwilę poprosisz agenta, żeby zbudował rzecz, która będzie oceniać jego własną pracę —
a w następnym prompcie zabronisz mu jej kiedykolwiek dotykać.

Zauważ, czego ten prompt *nie* mówi. Nie podaje koloru, szerokości, rozmiaru czcionki ani
sekcji. To wszystko jest w designie, a design agent przeczytał w prompcie 02. Prompt, który
powtarza design, ma dwie kopie prawdy — a dzień, w którym się rozjadą, jest dniem, w którym
checker zaczyna kłamać.

---

```text
Napisz teraz program, który sprawdza twoją własną pracę względem designu.

To musi być program, nie opinia. Uruchamia się, patrzy na prawdziwą stronę w prawdziwej
przeglądarce i kończy kodem 0, jeśli wszystko jest w porządku, a kodem różnym od zera,
jeśli cokolwiek jest nie tak. Nigdy nie pyta modelu językowego, nigdy nie pyta mnie i
dwa razy na tej samej stronie daje tę samą odpowiedź.

Spraw, żeby uruchamiała go komenda „npm run check". Zainstaluj, co potrzebne, żeby
sterować prawdziwą przeglądarką i testować dostępność — to jedyny wyjątek od zakazu
nowych paczek.

Co sprawdzać, wyprowadź z designu, nie ode mnie. Minimum, i to względem strony tak, jak
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
  brakuje pliku designu — to jest PORAŻKA, nigdy zaliczenie i nigdy ciche pominięcie.
  Test, który się nie odbył, nie może wyglądać jak test, który przeszedł.
- Nie rozluźniaj testów, żeby przechodziły. Spodziewam się, że to się wywali. Jeśli
  przejdzie za pierwszym razem, uznam, że nic nie sprawdza.

Kiedy będzie gotowe, uruchom to i pokaż mi wynik.
```

---

**Co powinieneś zobaczyć.** Czerwień. Sporo czerwieni.

To jest poprawny wynik i warto z nim posiedzieć chwilę. Strona, z której dwie minuty temu
byłeś w miarę zadowolony, właśnie usłyszała od programu dokładnie, co jest z nią nie tak —
z nazwami elementów i zmierzonymi liczbami.

Nie podałeś mu tych liczb. Poszedł po nie do designu.

---

### Dlaczego ten prompt nie nazywa niczego konkretnego

Każdy punkt z tej listy jest *pytaniem*, a odpowiedź leży w pliku designu. Poproś
o „zero naruszeń dostępności przy każdej szerokości, którą design określa", a agent musi
pójść i sprawdzić, jakie to szerokości. Poproś o nie po numerach, a właśnie po cichu
przeniosłeś design do promptu, gdzie nikt nie pamięta, żeby go aktualizować.

Z tego samego powodu prompt nie nazywa biblioteki testowej ani pliku. To są decyzje agenta,
a agent radzi sobie z nimi lepiej niż wiadomość napisana z wyprzedzeniem dla maszyny, która
może być jednym z dwóch różnych narzędzi.

To, co prompt *ustala*, to część, której żadne narzędzie nie wybierze za ciebie:

- musi to być program, a jego odpowiedź nie może pochodzić od modelu
- raport jest dla czytelnika, którego przy tym nie było — element, oczekiwane, faktyczne, próg
- test, który nie może się wykonać, jest porażką
- rozluźnione testy są gorsze niż żadne

### Zdanie, które robi najwięcej roboty

> Test, który nie może się wykonać, jest PORAŻKĄ, nigdy zaliczeniem i nigdy cichym pominięciem.

W próbnym przebiegu tych promptów agent, który dostał tę jedną linijkę, sam postanowił
traktować *niejednoznaczne* wyniki swojego narzędzia do dostępności jako błędy, a nie
zaliczenia. Ta decyzja łapie całą klasę defektów, których bramka „zero naruszeń" nie widzi,
i nikt o nią nie prosił. Wypadła z jednego zdania o tym, co znaczy brak wyniku.
