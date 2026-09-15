# 08 — Ta sama robota, jako workflow

Prompty 01 do 07 wklejone jako jedna wiadomość. Wiadomość jest podzielona na siedem faz,
ponumerowanych od 01 do 07, a każda faza zawiera tekst promptu o tym samym numerze: faza 03
robi to, co prompt 03. Agent sam przechodzi fazy po kolei i zatrzymuje się dla ciebie tylko po
fazie 02 i tam, gdzie reguła każe zatrzymać się i zapytać.

Wklej go w zwykłym trybie, nie w plan mode, w nowej sesji. Fazy, które proszą o plan, zapisują
go do `notes.md` i jadą dalej.

---

```text
ultracode. Chcę, żebyś wykonał całą robotę w siedmiu fazach. Każda faza to jeden z siedmiu
promptów z warsztatu, w tej samej kolejności, tymi samymi słowami i z tymi samymi regułami.
Przejdź je samodzielnie i nie przeskakuj do przodu.

Użyj dynamicznego workflow: wewnątrz fazy powołuj tyle subagentów, ile wymaga robota, i
uruchamiaj je równolegle, decydując o liczbie na podstawie tego, co zastaniesz, a nie
liczby, którą ci podałem — jeden na sekcję, jeden na soczewkę review, jeden na znalezisko,
czego akurat wymaga faza. Scal ich wyniki, zanim z niej wyjdziesz.

Ponieważ to jeden przebieg zamiast siedmiu wiadomości, zmieniają się te rzeczy:
- Zatrzymujesz się i czekasz na mnie tylko na końcu fazy 02, na moją odpowiedź na punkt 6,
  i tam, gdzie reguła mówi, żeby się zatrzymać i zapytać. Tam, gdzie faza każe pokazać mi
  plan i czekać na zgodę, zapisz plan do notes.md i jedź dalej.
- Tam, gdzie faza mówi, że wyczyszczę sesję, nie zatrzymuj się: zacznij następną fazę od
  ponownego przeczytania notes.md i design/data.
- W fazie 04 budujesz sekcje równolegle, po jednym subagencie na każdą, zamiast jedna po
  drugiej.
- W fazie 06 przegląd robią subagenci, którzy zaczynają ze świeżym kontekstem, a znaleziska,
  które przetrwały, naprawiasz bez czekania, aż wybiorę.

FAZA 01 — START

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

Zanim pójdziesz dalej: serwer deweloperski działa i podałeś mi jego adres.

FAZA 02 — POPATRZ

Najpierw plan. Zbadaj, czego potrzebujesz, potem pokaż mi plan i poczekaj na moją zgodę. Nie
twórz ani nie zmieniaj żadnego pliku, dopóki go nie zatwierdzę.

W tym projekcie jest folder design, a w nim plik .fig. To jest sam plik Figmy, zapisany
przez „Save local copy". To nie jest obrazek: to cały design jako dane — każdy tekst,
kolor, zmienna, komponent i zdjęcie.

Pracuj na tym jednym pliku i na niczym więcej. Nie szukaj na tym komputerze designu,
specyfikacji, obrazków referencyjnych ani niczego innego o tym projekcie: nic więcej nie ma,
a cokolwiek znajdziesz, nie jest designem. Jeśli plik wymienia coś, czego w nim nie ma,
wpisz to w punkt 6, zamiast tego szukać.

Chcę narzędzia, a nie jednorazowego rozkodowania: skryptu w tym projekcie, który czyta plik
.fig z folderu design i zapisuje dane designu, których będą potrzebować strona i checker.
Spraw, żeby uruchamiała go komenda „npm run design". Ponowne uruchomienie na nowym pliku .fig
ma odświeżyć dane, żeby nikt już nie musiał ręcznie rozkodowywać ani eksportować designu.

Nie ma programu, który otwiera plik .fig, więc skrypt rozkodowuje go sam. Co wiadomo
o formacie:

- Plik .fig to zip. Design jest w środku, w canvas.fig. thumbnail.png to tylko mały
  podgląd: nie pracuj na nim.
- canvas.fig zaczyna się od bajtów „fig-kiwi" i numeru wersji, potem są kawałki, każdy
  poprzedzony swoją długością. Pierwszy to schemat w binarnym formacie kiwi
  (github.com/evanw/kiwi); drugi to dokument zakodowany tym schematem. Każdy kawałek jest
  skompresowany, surowym deflate albo zstd.
- Folder images w zipie trzyma zdjęcia, nazwane hashem, którego używają wypełnienia.
- Pomiń wszystko, co ma isSoftDeleted, i wszystko, co należy do czegoś, co to ma.
  Zostało usunięte w Figmie, a wciąż siedzi w pliku. Zmienna w usuniętej kolekcji sama nie
  jest oznaczona — pomiń ją też.
- Tekst w komponencie może pochodzić z właściwości komponentu i z nadpisań. Jeśli każda
  karta tego samego rodzaju pokazuje te same słowa, czytasz komponent zamiast instancji.
  Rozwiąż to, zanim zaufasz jakiemukolwiek tekstowi.

Skrypt może użyć paczki; sieć jest dostępna. Nie pisz żadnego kodu strony.

Skrypt zapisuje pliki JSON do design/data, a zdjęcia do design/images:

- design/data/sections.json: każda sekcja, w kolejności od góry strony, i co jest w każdej
  z nich
- design/data/colours.json: każdy kolor, po nazwie z designu, z dokładną wartością i miejscem
  użycia
- design/data/typography.json: każdy styl tekstu, z fontem, rozmiarem, grubością, interlinią
  i odstępem między literami, i gdzie który jest użyty
- design/data/layout.json: każda szerokość, którą design obejmuje, a przy każdej odstępy,
  rozmiary, zaokrąglenia rogów i kolumny
- design/data/components.json: każdy komponent, z jego wariantami i stanami
- design/data/copy.json: każdy tekst, sekcja po sekcji, słowo w słowo, razem z tekstami
  alternatywnymi i etykietami, których nie pokazuje żadna ramka
- design/data/images.json: każdy obraz, z jego plikiem w design/images, miejscem użycia,
  rozmiarem i tekstem alternatywnym

Każda wartość jest przepisana dokładnie tak, jak jest w pliku: bez zaokrąglania, bez zmiany
nazw. Od teraz design/data jest designem. Każdy kolejny krok czyta je zamiast pliku .fig,
a checker sprawdza stronę względem nich. Jeśli okaże się, że jakiejś wartości brakuje,
poprawka trafia do skryptu, a potem npm run design uruchamia się jeszcze raz.

Twój plan ma powiedzieć, jak skrypt czyta plik, jakiej paczki używa, jeśli jakiejś, i jaki
kształt ma każdy plik JSON.

Kiedy zatwierdzę plan, napisz skrypt, uruchom npm run design, potem pokaż mi listę, a jej
punkt 6 zapisz do notes.md:

1. Każdą sekcję, w kolejności od góry strony.
2. Każdy kolor, po nazwie z designu, z dokładną wartością.
3. Każdy rozmiar tekstu i gdzie który jest użyty.
4. Każdą szerokość, którą design obejmuje.
5. Każdy plik w design/data i co w nim jest, po jednej linijce.
6. Wszystko, co w pliku się nie zgadza albo czego w nim nie ma, a co inaczej musiałbyś
   zgadnąć.

Punkt 6 obchodzi mnie najbardziej. Bądź konkretny i bądź szczery: „w pliku jest stan hover,
do którego nie mam żadnych wartości" jest warte więcej niż pewne siebie zgadnięcie.

Potem zatrzymaj się i poczekaj, aż odpowiem na punkt 6.

Kiedy odpowiem na punkt 6, zapisz moje odpowiedzi do notes.md. Potem zrób commit wszystkiego
z opisem, co zrobił ten krok, i zrób push. Powiedz mi, że krok jest skończony, żebym mógł
wyczyścić sesję.

Zanim pójdziesz dalej: npm run design zapisał design/data, notes.md istnieje, a ja odpowiedziałem na punkt 6.

FAZA 03 — UZBRÓJ

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

Zanim pójdziesz dalej: npm run check uruchamia się i nie przechodzi na projekcie takim, jaki jest.

FAZA 04 — BUDUJ

Najpierw plan. Zbadaj, czego potrzebujesz, potem pokaż mi plan i poczekaj na moją zgodę. Nie
twórz ani nie zmieniaj żadnego pliku, dopóki go nie zatwierdzę.

Zbuduj teraz stronę, na podstawie designu. Czytaj design/data i notes.md; nie rozkodowuj
pliku .fig jeszcze raz.

Twój plan ma wymienić sekcje w kolejności z design/data/sections.json i powiedzieć, jakich
kolorów, stylów tekstu, wartości layoutu, tekstów i obrazów używa każda z nich.

Zbuduj wszystkie sekcje z design/data/sections.json naraz, po jednym subagencie na sekcję,
a potem złóż je w tej kolejności. Nie zatrzymuj się między sekcjami, żeby mnie pytać. Kiedy
skończysz, powiedz mi, które sekcje zbudowałeś, po jednej linijce, i podaj adres do otwarcia.

Reguły, wszystkie nienegocjowalne:

- Każdy kolor i każdy rozmiar pochodzi z design/data. Jeśli wartości, której potrzebujesz,
  tam nie ma, sprawdź, czy nie gubi jej skrypt uruchamiany przez npm run design; jeśli tak,
  popraw skrypt i uruchom go jeszcze raz. Jeśli design jej nie ma, nie wybieraj sam: to
  pytanie do notes.md, niżej.
- Każde słowo pochodzi z design/data/copy.json. Nie pisz tekstów. Nie poprawiaj tekstów.
  Jeśli jakiegoś fragmentu brakuje, zapisz to do notes.md; nie zapychaj dziury.
- Każde zdjęcie pochodzi z designu: użyj obrazów wymienionych w design/data/images.json,
  nigdy zastępczych.
- Do samej strony nie wchodzi nic nowego: żaden framework UI, żadna biblioteka
  komponentów, żaden serwis z fontami ani ikonami. Strona jest z Astro i Tailwinda.
- Strona musi działać z niezaładowanymi obrazkami i z wyłączonym JavaScriptem. Wszystko,
  co sprytne, jest dodatkiem na czymś, co już działa bez tego.

Jeśli design czegoś nie mówi, nie zgaduj. Zapisz pytanie do notes.md, wybierz odczyt, który
uważasz za najbardziej prawdopodobny, powiedz mi jedno i drugie, i jedź dalej. Wolę poprawić
jedno założenie niż odkryć sześć.

Kiedy strona będzie zbudowana, uruchom raz npm run check i pokaż mi, ile testów nie
przechodzi i które. Nie naprawiaj ich jeszcze i nie zmieniaj checkera.

Potem zrób commit wszystkiego z opisem, co zrobił ten krok, i zrób push. Powiedz mi, że krok
jest skończony, żebym mógł wyczyścić sesję.

Zanim pójdziesz dalej: każda sekcja z design/data/sections.json jest zbudowana, a projekt buduje się bez błędów.

FAZA 05 — NAPRAWIAJ

Przeczytaj notes.md. Potem uruchom npm run check.

Jeśli kończy się kodem 0, zrób commit wszystkiego z opisem, że test przechodzi, zrób push
i powiedz mi, że skończyliśmy.

Jeśli nie, przeczytaj raport, który zapisał, i napraw to, co wymienia. Potem uruchom
npm run check jeszcze raz. Powtarzaj, aż skończy się kodem 0.

Każda runda ma trzy kroki. Plan: weź pierwszy błąd z raportu i zapisz do notes.md jedną
linijkę: co nie przechodzi, co według ciebie jest przyczyną i co zmienisz. Implementacja:
wprowadź tę zmianę. Weryfikacja: uruchom npm run check.

Pracuj w kolejności, w jakiej raport wymienia rzeczy. Naprawiaj przyczynę, nie objaw:
jeśli kolor jest zły, użyj tego z designu, nie przesuwaj go, aż liczba drgnie. Rób
najmniejszą zmianę, która usuwa dany błąd, i nie ruszaj niczego, co już przechodziło.

Trzy reguły, a pierwsza znaczy więcej niż dwie pozostałe:

1. NIGDY nie zmieniaj checkera, żeby test przeszedł. Ani progu, ani pominiętej asercji,
   ani wyłączonej reguły. Jeśli naprawdę uważasz, że jakiś test jest zły, ZATRZYMAJ SIĘ,
   powiedz mi który i dlaczego, i nie zmieniaj niczego.
2. Nie dodawaj niczego nowego do strony i nie wymyślaj tekstów.
3. Jeśli ten sam błąd przeżyje trzy próby, zatrzymaj się i powiedz mi, co próbowałeś za
   każdym razem i co się stało. Trzy nieudane naprawy zwykle znaczą, że design prosi
   o dwie rzeczy, które nie mogą być jednocześnie prawdziwe, i czwarta próba tego nie
   rozwiąże.

Zapisuj do notes.md na bieżąco, co próbowałeś i co się stało, żeby nowa sesja mogła to
podjąć. Pracuj dalej sam. Nie proś mnie o potwierdzenie po każdej rundzie.

Zanim pójdziesz dalej: npm run check kończy się kodem 0.

FAZA 06 — ATAKUJ

Testy przechodzą. Teraz udowodnij, że strona i tak jest zła.

Nie budowałeś tej strony. Oceniaj ją wyłącznie po tym, co pokazuje przeglądarka, i po tym,
co jest w tym projekcie, a nie po czymkolwiek, co padło wcześniej w tej rozmowie.

Twoim zadaniem teraz jest atakować, nie bronić i nie naprawiać. Znajdź pięć
rzeczy, które są ze stroną nie tak, a których checker w tym projekcie nie potrafi złapać,
i dla każdej powiedz mi:

- dokładnie który element, opisany tak, jak go widzę na ekranie
- co jest z nim nie tak
- dlaczego checker to przepuścił — jakie pytanie zadaje, że to się prześlizguje?

Szukaj szczególnie tam, gdzie automat nie sięga:

- tekst na zdjęciu albo gradiencie: automatyczny test kontrastu w ogóle nie policzy tej
  pary i zgłosi ją jako niejednoznaczną, a nie jako błąd
- kolejność czytania dla kogoś na klawiaturze albo czytniku ekranu: technicznie poprawna
  i bez sensu to jest stan, który istnieje
- tekst alternatywny, który jest, i jest bezużyteczny
- struktura nagłówków, która wygląda na hierarchię i nią nie jest
- teksty, które przechodzą każdą regułę i nadal nie brzmią jak ta marka
- co się dzieje przy szerokości pomiędzy tymi, które określa design — takiej, której nikt
  nie zrzucił
- cokolwiek, co psuje się dopiero przy drugiej wizycie albo na wolnym łączu

Zanim powiesz mi którąkolwiek z nich, sam argumentuj przeciwko każdej, z trzech stron:

  czy to prawda        - idź i zobacz jeszcze raz, nie ufaj pierwszemu odczytowi
  czy to ma znaczenie  - czy odwiedzający to zauważy, czy tylko checklista?
  czy to obsłużone     - czy już gdzieś jest, tam gdzie nie patrzyłem?

W tej fazie zrób to subagentami, z których każdy zaczyna ze świeżym kontekstem, który nie
widział budowania strony: po jednym na każde miejsce z listy powyżej, szukających równolegle,
a potem, dla każdego kandydata, którego znajdą, osobny subagent, którego jedynym zadaniem
jest argumentować przeciwko niemu z tych trzech stron.

Zgłoś tylko te znaleziska, które przeżyją wszystkie trzy. W razie wątpliwości domyślnie
wyrzucaj i powiedz mi, ile wyrzuciłeś. Cztery prawdziwe znaleziska są warte więcej niż
pięć, w których jedno jest zgadywanką. Jeśli nie umiesz wskazać konkretnego elementu, to
nie jest znalezisko.

Potem napraw znaleziska, które przetrwały, uruchom npm run check jeszcze raz i idź dalej
tylko wtedy, gdy nadal kończy się kodem 0. Zapisz znaleziska i to, co naprawiłeś, do
notes.md, potem zrób commit wszystkiego z opisem, które znaleziska naprawiłeś, i zrób push.

Zanim pójdziesz dalej: znaleziska, które przetrwały, są naprawione, a npm run check nadal kończy się kodem 0.

FAZA 07 — WYSTAW

Wystaw to do internetu.

Zbuduj stronę, a potem opublikuj ją na Netlify przez Netlify w terminalu. Jest zainstalowane
i jestem zalogowany; jeśli powie, że nie jestem, powiedz mi, co zrobić, zamiast robić to po cichu.

Kiedy będzie na żywo, nie mów mi po prostu, że się udało. Sprawdź:

- pobierz publiczny adres i potwierdź, że zwraca 200
- potwierdź, że strona, którą serwuje, jest tą, którą przed chwilą zbudowałeś, a nie
  starszą — porównaj to, co wraca, z tym, co jest w folderze build
- uruchom npm run check -- --url na adresie na żywo i pokaż mi wynik

Potem zrób commit wszystkiego, co się zmieniło, z opisem, co zrobił ten krok, i zrób push.

Potem podaj mi adres w osobnej linijce, żebym mógł go skopiować.

To jest koniec przebiegu: adres na żywo zwraca 200, serwuje stronę, którą zbudowałeś, a npm run check -- --url przechodzi na nim.

Reguły na cały przebieg:
- Ogłaszaj każdą fazę, kiedy w nią wchodzisz, i mów, ilu subagentów używasz i dlaczego.
- Jeśli faza nie może się skończyć, zatrzymaj się na niej i powiedz dlaczego. Nie idź
  dalej z poprzednią zepsutą.
- Utrzymuj notes.md na bieżąco. Jeśli będziemy musieli zacząć nową sesję, notes.md
  i design/data to wszystko, co będzie miała.
```

---

**Oczekiwany wynik.** Agent ogłasza `FAZA 01 — START` i pracuje bez nadzoru. Zatrzymuje się
raz, po fazie 02, na twoją odpowiedź na punkt 6 jego listy. Po drodze: `npm run design`,
`npm run check`, który nie przechodzi na pustym projekcie, strona, pętla aż do zaliczenia
testu, przegląd i poprawki, commit po każdym z tych kroków, a na końcu adres na żywo.

---

## Subagenci

Subagent to osobny agent, którego główny agent uruchamia do jednej części roboty. Zaczyna
z pustym kontekstem: zna tylko zadanie, które dostał, a nie dotychczasową rozmowę. Główny
agent zbiera to, co zwrócą jego subagenci.

## Czym różni się od siedmiu promptów

- Przebieg czeka na ciebie tylko po fazie 02 i tam, gdzie reguła każe zatrzymać się i zapytać.
- Plany nie czekają na zatwierdzenie. W siedmiu promptach przed 02, 03 i 04 włączasz plan mode i zatwierdzasz każdy plan; tutaj każda z tych faz zapisuje plan do `notes.md` i jedzie dalej.
- Między fazami nie ma `/clear`. Każda faza zaczyna od ponownego przeczytania `notes.md` i `design/data`.
- Faza 04 buduje sekcje strony jednocześnie, po jednym subagencie na sekcję, zamiast jedna po drugiej.
- Faza 06 robi przegląd subagentami: po jednym na każde miejsce do sprawdzenia i osobny, który argumentuje przeciwko każdemu znalezisku. Każdy zaczyna z pustym kontekstem, więc żaden nie widział budowania strony. Agent naprawia znaleziska, które przetrwały, bez czekania, aż wybierzesz.

`scripts/build-workflow-prompt.mjs` generuje ten prompt z promptów 01 do 07, a jego `--check`
nie przechodzi, jeśli różnią się w czymkolwiek innym.

## `ultracode`

Pierwsze słowo promptu. Claude Code traktuje je jako sygnał, że zadanie jest duże i może
używać subagentów. Codex nie ma takiego słowa. Zostaw je w obu narzędziach: zdanie po nim,
„powołuj tyle subagentów, ile wymaga robota, i uruchamiaj je równolegle", daje tę samą
instrukcję każdemu z nich.

## Wzorce workflow w tym prompcie

Strona warsztatu opisuje sześć wzorców workflow. Ten prompt używa trzech:

| Faza | Wzorzec | Co się dzieje |
|---|---|---|
| 04 | Rozgałęzienie i scalenie | strona dzielona na sekcje budowane jednocześnie, po jednym subagencie na sekcję, potem scalana w jedną stronę |
| 05 | Pętla do skutku | plan, implementacja, weryfikacja, powtarzane, aż `npm run check` zwróci kod 0 |
| 06 | Adversarial verification | subagenci z pustym kontekstem szukają problemów, osobni subagenci argumentują przeciwko każdemu |

Przegląd w fazie 06 działa obok `npm run check`. Checker rozstrzyga to, co da się zmierzyć;
przegląd szuka tego, czego zmierzyć się nie da.

## Pętla i workflow

| | **Pętla** | **Workflow** |
|---|---|---|
| Kształt | rób to znowu, aż warunek będzie spełniony | wykonaj kroki po kolei, z warunkiem między każdym |
| Ty definiujesz | **warunek wyjścia** | **fazy** |
| Kończy się, gdy | program mówi „tak" | skończy się ostatnia faza |
| W tym zestawie | prompt 05 | ten prompt |

Faza 05 jest pętlą wewnątrz workflow.

## Sparametryzuj to

Zmień listę faz, a zmienisz robotę:

> Faza 04 buduje tylko hero i lineup. Resztę zostaw.

> Między fazą 04 a 05 dodaj fazę: pokaż mi każdą sekcję jako zrzut ekranu przy najwęższej
> szerokości i poczekaj na moją zgodę.

> Pomiń fazę 07. Dziś nie publikuję.

> W fazie 06 patrz tylko na szerokości, których design nie określa.

## Kiedy go użyć

- **Workflow**: znasz etapy i chcesz wyniku bez pilnowania każdego kroku.
- **Siedem promptów**: uczysz się, chcesz zatwierdzać każdy plan albo spodziewasz się zmiany designu w połowie.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Ogłasza fazę 04, zanim istnieje `npm run check` | `Pominąłeś fazę 03. Najpierw test. Wróć i go napisz.` |
| `npm run check` przechodzi w fazie 03 | `Test przeszedł na pustym projekcie. Niczego nie sprawdza. Popraw checker przed fazą 04.` |
| Nie czeka po fazie 02 | `Faza 02 mówiła: poczekaj na moją odpowiedź na punkt 6. Zatrzymaj się i pokaż mi notes.md.` |
| Czeka na zatwierdzenie planu w fazie 03 albo 04 | `Zapisz plan do notes.md i jedź dalej.` |
| Robi się mniej konkretny koło fazy 05 | `Streść stan do notes.md.` Potem wpisz `/clear`, wklej ten prompt jeszcze raz i powiedz `notes.md i design/data mają stan. Kontynuuj od fazy 05.` |
| Ogłasza, że całość skończona | `Uruchom npm run check i wklej pięć ostatnich linijek, bez poprawiania.` |
| Faza się wywala, a on idzie dalej | `Miałeś zatrzymać się na nieudanej fazie. Co się wywaliło i dlaczego kontynuowałeś?` |
| Buduje sekcje jedną po drugiej | `Faza 04 to niezależne sekcje. Zbuduj je równolegle, po jednym subagencie na każdą.` |
| Faza 06 zgłasza znaleziska i żadnego nie odrzuciła | `Ilu kandydatów odrzuciłeś i dlaczego?` |
| Uruchamia dwudziestu subagentów do małej strony | `Używaj tylu, ilu wymaga robota. Podaj mi liczbę i uzasadnienie, zanim zaczniesz.` |
