# 08 — Ta sama robota, jako workflow

Przeszedłeś właśnie siedem promptów ręcznie. To ty byłeś tym, co między nimi: czytałeś
output, decydowałeś, że jest wystarczająco dobrze, wklejałeś następny.

**Faza 01 to prompt 01, faza 07 to prompt 07, i słowa są te same.** Wszystko, czego
nauczyłeś się z promptu, jest prawdą o jego fazie. Dwie rzeczy się zmieniają, bo to jeden
przebieg zamiast siedmiu wiadomości, i prompt mówi obie na głos.

Tę rolę da się opisać. **Fazy, co się dzieje w każdej i co musi być prawdą, zanim zacznie
się następna** — zapisz to, a agent przejdzie sekwencję sam.

Żadnego skryptu. Żadnego narzędzia. To jest wiadomość.

---

```text
ultracode. Chcę, żebyś wykonał całą robotę w siedmiu fazach. Każda faza to jeden z siedmiu
promptów z warsztatu, w tej samej kolejności, tymi samymi słowami i z tymi samymi regułami.
Przejdź je samodzielnie i nie przeskakuj do przodu.

Użyj dynamicznego workflow: wewnątrz fazy powołuj tyle subagentów, ile wymaga robota, i
uruchamiaj je równolegle, decydując o liczbie na podstawie tego, co zastaniesz, a nie
liczby, którą ci podałem — jeden na sekcję, jeden na soczewkę review, jeden na znalezisko,
czego akurat wymaga faza. Scal ich wyniki, zanim z niej wyjdziesz.

Ponieważ to jeden przebieg zamiast siedmiu wiadomości, zmieniają się dokładnie dwie rzeczy:
- W fazie 03 budujesz sekcje równolegle, po jednym subagencie na każdą, zamiast jedna po
  drugiej.
- Zatrzymujesz się i czekasz na mnie tylko tam, gdzie faza ci to każe: na końcu fazy 02 i
  zawsze, gdy reguła mówi, żeby się zatrzymać i zapytać. Wszędzie indziej jedziesz dalej.

FAZA 01 — START

Załóż w tym folderze nowy projekt strony internetowej.

Użyj Astro z Tailwind CSS. Statyczny output — bez Reacta, Vue ani Svelte, bez serwera, bez
bazy danych. Node jest już zainstalowany.

Potem uruchom serwer deweloperski i podaj mi adres, który mam otworzyć w przeglądarce.

Nie buduj jeszcze żadnych stron. Nie wymyślaj żadnej treści. Design przyjdzie w następnym
kroku i chcę, żeby strona była wtedy nadal pusta.

W trakcie pracy mów mi jedną linijką, co robi każda komenda. Nigdy wcześniej nie używałem
terminala i chcę nadążać.

Zanim pójdziesz dalej: serwer deweloperski działa i podałeś mi jego adres.

FAZA 02 — POPATRZ

W tym projekcie jest folder design, a w nim plik .fig. To jest sam plik Figmy, zapisany
przez „Save local copy". To nie jest obrazek: to cały design jako dane — każdy tekst,
kolor, zmienna, komponent i zdjęcie.

Pracuj na tym jednym pliku i na niczym więcej. Nie szukaj na tym komputerze designu,
specyfikacji, obrazków referencyjnych ani niczego innego o tym projekcie: nic więcej nie ma,
a cokolwiek znajdziesz, nie jest designem. Jeśli plik wymienia coś, czego w nim nie ma,
wpisz to w punkt 6, zamiast tego szukać.

Nie ma narzędzia, które go otwiera, więc go rozkoduj. Co wiadomo o formacie:

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

Możesz zainstalować paczkę, żeby to zrobić; sieć jest dostępna. Rozkodowane dane i zdjęcia
trzymaj w folderze design-data w tym projekcie. Nie pisz jeszcze żadnego kodu strony.

Potem spisz design jako dokumentację, w folderze docs, żeby nikt — ani ja, ani ty, ani nowa
sesja — nie musiał już otwierać pliku .fig. Każdy dokument zapisuj od razu, gdy przeczytasz
tę część pliku, a nie wszystkie na końcu:

- docs/sections.md: każda sekcja, w kolejności od góry strony, i co jest w każdej z nich
- docs/colours.md: każdy kolor, po nazwie z designu, z dokładną wartością i do czego jest
  używany
- docs/typography.md: każdy font i styl tekstu, z rozmiarem, grubością, interlinią
  i odstępem między literami, i gdzie który jest użyty
- docs/layout.md: każda szerokość, którą design obejmuje, a przy każdej odstępy, rozmiary,
  zaokrojenia rogów i kolumny
- docs/components.md: każdy komponent, z jego wariantami i stanami
- docs/copy.md: każdy tekst, sekcja po sekcji, słowo w słowo, razem z tekstami
  alternatywnymi i etykietami, których nie pokazuje żadna ramka
- docs/images.md: każdy obraz, z jego plikiem w design-data, miejscem użycia, rozmiarem
  i tekstem alternatywnym

Przepisuj każdą wartość dokładnie tak, jak jest w pliku: bez zaokrąglania, bez zmiany nazw.
Od teraz te dokumenty są designem i każdy kolejny krok czyta je zamiast pliku .fig. Kiedy
okaże się, że jakiejś wartości brakuje, poprawka polega na tym, żeby najpierw dopisać ją do
właściwego dokumentu.

Potem pokaż mi listę, a jej punkt 6 zapisz do notes.md:

1. Każdą sekcję, w kolejności od góry strony.
2. Każdy kolor, po nazwie z designu, z dokładną wartością.
3. Każdy rozmiar tekstu i gdzie który jest użyty.
4. Każdą szerokość, którą design obejmuje.
5. Każdy dokument, który zapisałeś w docs, i co w nim jest, po jednej linijce.
6. Wszystko, co w pliku się nie zgadza albo czego w nim nie ma, a co inaczej musiałbyś
   zgadnąć.

Punkt 6 obchodzi mnie najbardziej. Bądź konkretny i bądź szczery: „w pliku jest stan hover,
do którego nie mam żadnych wartości" jest warte więcej niż pewne siebie zgadnięcie.

Potem zatrzymaj się i poczekaj, aż odpowiem na punkt 6.

Zanim pójdziesz dalej: każdy dokument w docs jest zapisany, notes.md istnieje, a ja odpowiedziałem na punkt 6.

FAZA 03 — BUDUJ

Zbuduj teraz stronę, na podstawie designu. Czytaj docs i notes.md; nie rozkodowuj pliku .fig
jeszcze raz.

Zbuduj wszystkie sekcje z docs/sections.md naraz, po jednym subagencie na sekcję, a potem
złóż je w tej kolejności. Nie zatrzymuj się między sekcjami, żeby mnie pytać. Kiedy
skończysz, powiedz mi, które sekcje zbudowałeś, po jednej linijce, i podaj adres do otwarcia.

Reguły, wszystkie nienegocjowalne:

- Każdy kolor i każdy rozmiar pochodzi z docs. Jeśli wartości, której potrzebujesz, tam nie
  ma, poszukaj jej w design-data; jeśli tam jest, najpierw dopisz ją do właściwego
  dokumentu, a potem użyj. Jeśli nie ma jej nigdzie, nie wybieraj sam: to pytanie do
  notes.md, niżej.
- Każde słowo pochodzi z docs/copy.md. Nie pisz tekstów. Nie poprawiaj tekstów. Jeśli
  jakiegoś fragmentu brakuje, zapisz to do notes.md — nie zapychaj dziury.
- Każde zdjęcie pochodzi z designu: użyj obrazów wymienionych w docs/images.md, nigdy
  zastępczych.
- Do samej strony nie wchodzi nic nowego: żaden framework UI, żadna biblioteka
  komponentów, żaden serwis z fontami ani ikonami. Strona jest z Astro i Tailwinda.
- Strona musi działać z niezaładowanymi obrazkami i z wyłączonym JavaScriptem. Wszystko,
  co sprytne, jest dodatkiem na czymś, co już działa bez tego.

Jeśli design czegoś nie mówi, nie zgaduj. Zapisz pytanie do notes.md, wybierz odczyt, który
uważasz za najbardziej prawdopodobny, powiedz mi jedno i drugie, i jedź dalej. Wolę poprawić
jedno założenie niż odkryć sześć.

Zanim pójdziesz dalej: każda sekcja z docs/sections.md jest zbudowana, a projekt buduje się bez błędów.

FAZA 04 — UZBRÓJ

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

Zanim pójdziesz dalej: npm run check uruchamia się i coś raportuje. Będzie czerwono. Dobrze.

FAZA 05 — NAPRAWIAJ

Uruchom npm run check.

Jeśli kończy się kodem 0, zatrzymaj się i powiedz mi — skończyliśmy.

Jeśli nie, przeczytaj raport, który zapisał, i napraw to, co wymienia. Potem uruchom
npm run check jeszcze raz. Powtarzaj, aż skończy się kodem 0.

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

FAZA 06 — WYSTAW

Wystaw to do internetu.

Zbuduj stronę, a potem opublikuj ją na Netlify przez Netlify w terminalu. Jest zainstalowane
i jestem zalogowany; jeśli powie, że nie jestem, powiedz mi, co zrobić, zamiast robić to po cichu.

Kiedy będzie na żywo, nie mów mi po prostu, że się udało. Sprawdź:

- pobierz publiczny adres i potwierdź, że zwraca 200
- potwierdź, że strona, którą serwuje, jest tą, którą przed chwilą zbudowałeś, a nie
  starszą — porównaj to, co wraca, z tym, co jest w folderze build
- uruchom npm run check -- --url na adresie na żywo i pokaż mi wynik

Potem podaj mi adres w osobnej linijce, żebym mógł go skopiować.

Zanim pójdziesz dalej: adres na żywo zwraca 200, serwuje stronę, którą zbudowałeś, a npm run check -- --url przechodzi na nim.

FAZA 07 — ATAKUJ

Testy przechodzą. Teraz udowodnij, że strona i tak jest zła.

Twoim zadaniem teraz jest atakować, nie bronić i nie naprawiać. Znajdź pięć
rzeczy, które są ze stroną nie tak, a których twój checker nie potrafi złapać, i dla
każdej powiedz mi:

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

W tej fazie zrób to subagentami: po jednym na każde miejsce z listy powyżej, szukających
równolegle, a potem, dla każdego kandydata, którego znajdą, osobny subagent, którego
jedynym zadaniem jest argumentować przeciwko niemu z tych trzech stron.

Zgłoś tylko te znaleziska, które przeżyją wszystkie trzy. W razie wątpliwości domyślnie
wyrzucaj i powiedz mi, ile wyrzuciłeś. Cztery prawdziwe znaleziska są warte więcej niż
pięć, w których jedno jest zgadywanką. Jeśli nie umiesz wskazać konkretnego elementu, to
nie jest znalezisko.

Nie naprawiaj jeszcze niczego. Najpierw chcę zdecydować, które z nich są prawdziwe.

To jest koniec przebiegu.

Reguły na cały przebieg:
- Ogłaszaj każdą fazę, kiedy w nią wchodzisz, i mów, ilu subagentów używasz i dlaczego.
- Jeśli faza nie może się skończyć, zatrzymaj się na niej i powiedz dlaczego. Nie idź
  dalej z poprzednią zepsutą.
- Utrzymuj docs i notes.md na bieżąco. Jeśli będziemy musieli zacząć nową sesję, to będzie
  wszystko, co będzie miała.
```

---

**Co powinieneś zobaczyć.** `FAZA 01 — START`, a potem pracę, bez nadzoru, przez długi
czas. Zatrzyma się dla ciebie raz, po fazie 02, żeby usłyszeć odpowiedź na punkt 6 — a poza
tym tylko wtedy, gdy reguła każe mu się zatrzymać i zapytać.

---

## Dwa słowa z góry

**`ultracode`** to słowo kluczowe, które rozpoznaje Claude Code: sygnalizuje, że zlecenie
jest duże i strukturalne, i to ono odblokowuje orkiestrację wieloagentową na czas przebiegu.
**Codex nie ma odpowiednika** — żadnego słowa, żadnej flagi. Zostaw je mimo to. W Codeksie
jest to jeden nieszkodliwy token na początku długiej instrukcji, a prawdziwą robotę na obu
narzędziach robi zdanie po nim:

> powołuj tyle subagentów, ile wymaga robota, i uruchamiaj je równolegle, decydując
> o liczbie na podstawie tego, co zastaniesz

To jest instrukcja. Słowo kluczowe to skrót w jednym narzędziu, nie mechanizm.

**Po co w ogóle się rozgałęziać.** Sześć sekcji budowanych jedna po drugiej to sześć razy
tyle czasu, co sześć budowanych naraz — a sekcje nie zależą od siebie. To samo dotyczy
soczewek review: przebieg szukający problemów z dostępnością i przebieg szukający dryfu
w tekstach nie mają ze sobą nic wspólnego, a puszczenie ich w jednym kontekście sprawia, że
każdy niesie szum drugiego.

**Gdzie to naprawdę zarabia, to faza 07.** Pojedynczy agent zapytany „czy ta strona jest
dobra?" powie, że tak. Kilku agentów z różnymi soczewkami produkuje kandydatów, a osobny
agent, którego jedyną robotą jest *obalić* każdego kandydata, usuwa tych, którzy tego nie
przeżyją. Znajdź, potem zaatakuj, potem zatrzymaj resztę. To inny kształt niż zapytanie raz
i uwierzenie w odpowiedź, i jest to jedyne miejsce w tym zestawie, gdzie model sprawdza
model.

**Jest to też najmniej niezawodna część przebiegu.** Więcej agentów to pewniejszy output,
nie poprawniejszy. Decyduje deterministyczny checker z fazy 04; faza 07 otwiera pozycje do
oceny przez człowieka.

---

## Pętla i workflow to różne rzeczy

Ludzie używają tych słów zamiennie. To nie jest ten sam kształt, a wiedza, którego
potrzebujesz, to większość umiejętności.

| Aspekt | **Pętla** | **Workflow** |
|---|---|---|
| Kształt | Rób to znowu, aż warunek będzie spełniony | Zrób te rzeczy, w tej kolejności, z poprzeczką między każdą |
| Ty definiujesz | **warunek wyjścia** | **fazy** |
| Kończy się, gdy | program mówi „tak" | ostatnia faza się skończy |
| Dobre do | zbiegania do poprawności | pracy z etapami, które od siebie zależą |
| W tym zestawie | prompt 05 | ten prompt |

Faza 05 powyżej jest pętlą mieszkającą w workflow. To zwykły układ: workflow doprowadza cię
od zera do prawie-dobrze, a pętla w jednej fazie domyka resztę.

---

## Sparametryzuj to

Lista faz jest programem. Zmień ją i zmieniłeś robotę, nie pisząc ani linijki:

> Faza 03 buduje tylko hero i lineup. Resztę zostaw.

> Między fazą 03 a 04 dodaj fazę: pokaż mi każdą sekcję jako zrzut ekranu przy najwęższej
> szerokości i poczekaj na moją zgodę.

> Pomiń fazę 06. Dziś nie publikuję.

> W fazie 07 użyj sześciu soczewek zamiast trzech i patrz tylko na szerokości, których
> design nie określa.

To właśnie znaczy w praktyce „nie trzeba skryptu". Skrypt trzeba by zedytować, przetestować
i puścić ponownie. To edytuje się w zdaniu, które i tak zamierzałeś powiedzieć.

---

## Kiedy po to sięgać, a kiedy nie

**Sięgnij po workflow**, kiedy znasz kształt roboty i chcesz odejść od komputera: jest
długa, etapy są prawdziwe, a wolisz wrócić do wyniku niż go niańczyć.

**Sięgnij po siedem promptów**, kiedy się uczysz, kiedy chcesz sterować albo kiedy design
jest niejasny i spodziewasz się, że w połowie zmienisz zdanie. Każde zatrzymanie to szansa,
żeby się nie zgodzić, a niezgadzanie się wcześnie jest tańsze niż wszystko inne w tej sesji.

Pierwszy raz rób robotę ręcznie. Za drugim razem już wiesz, jakie są fazy.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Ogłasza fazę 04, zanim faza 03 jest zbudowana | `Pominąłeś część fazy 03. Wróć i skończ ją przed fazą 04.` |
| Przelatuje przez „poczekaj na mnie" | `Faza 02 mówiła: poczekaj na moją odpowiedź na punkt 6. Zatrzymaj się i pokaż mi notes.md.` |
| Robi się mętny koło fazy 05 | `Streść stan do notes.md.` Potem zacznij nową sesję, wklej ten prompt jeszcze raz i powiedz `docs i notes.md mają stan. Kontynuuj od fazy 05.` |
| Ogłasza, że całość skończona | `Uruchom npm run check i wklej pięć ostatnich linijek, bez poprawiania.` |
| Faza się wywala, a on idzie dalej | `Miałeś zatrzymać się na nieudanej fazie. Co się wywaliło i dlaczego kontynuowałeś?` |
| Buduje sekcje jedną po drugiej | `Faza 03 to niezależne sekcje. Zbuduj je równolegle, po jednym subagencie na każdą.` |
| Faza 07 zgłasza pięć znalezisk i wszystkie pięć jest prawdziwych | Dobrze, i podejrzanie. `Ilu kandydatów odrzuciłeś i dlaczego?` Runda obalania, która nie obaliła niczego, się nie odbyła. |
| Powołuje dwudziestu subagentów do małej strony | `Używaj tylu, ilu wymaga robota. Podaj mi liczbę i uzasadnienie, zanim zaczniesz.` |
