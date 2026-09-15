# 02 — Popatrz na design

Agent planuje i buduje dekoder pliku Figmy: skrypt w projekcie, uruchamiany przez
`npm run design`, który zapisuje design jako JSON w `design/data`. Każdy kolejny krok i checker
czytają te dane. Jeszcze bez kodu strony.

## Zanim wkleisz

1. Na stronie warsztatu kliknij **Pobierz turbine.fig**.
2. Włóż plik do folderu `design` w projekcie. Najprościej: powiedz agentowi `Przenieś turbine.fig z mojego folderu Pobrane do nowego folderu design w tym projekcie.` Musi leżeć w projekcie: Claude Code pyta o zgodę, zanim przeczyta plik spoza folderu projektu.
3. Przełącz agenta w plan mode. W plan mode agent robi rozpoznanie i pokazuje plan, a nie zmienia żadnego pliku, dopóki go nie zatwierdzisz. Claude Code: naciskaj `Shift+Tab`, aż w stopce pojawi się *plan mode on*. Codex: wpisz `/plan` i naciśnij Enter.

Nie musisz rozumieć całego planu. Sprawdź trzy rzeczy: to skrypt, który uruchamia `npm run design`, zapisuje pliki JSON do `design/data` i nie pisze kodu strony. Potem zatwierdź. W Claude Code wybierz **Yes, auto-accept edits**, żeby agent nie pytał przed każdą zmianą pliku.

---

```text
Najpierw plan. Zbadaj, czego potrzebujesz, potem pokaż mi plan i poczekaj na moją zgodę. Nie
twórz ani nie zmieniaj żadnego pliku, dopóki go nie zatwierdzę.

W tym projekcie jest folder design, a w nim plik .fig. To jest sam plik Figmy, tak jak
zapisuje go Figma. To nie jest obrazek: to cały design jako dane — każdy tekst,
kolor, zmienna, komponent i zdjęcie.

Pracuj na tym jednym pliku i na niczym więcej. Nie szukaj na tym komputerze designu,
specyfikacji, obrazków referencyjnych ani niczego innego o tym projekcie: nic więcej nie ma,
a cokolwiek znajdziesz, nie jest designem. Jeśli plik wymienia coś, czego w nim nie ma,
wpisz to w punkt 6, zamiast tego szukać.

Chcę narzędzia, a nie jednorazowego rozkodowania: skryptu w tym projekcie, który czyta plik
.fig z folderu design i zapisuje dane designu, których będą potrzebować strona i checker.
Spraw, żeby uruchamiała go komenda „npm run design". Ponowne uruchomienie na nowym pliku .fig
ma odświeżyć dane, żeby nikt już nie musiał ręcznie rozkodowywać ani eksportować designu.

Dekoder ma być mały: jeden skrypt, bez zestawu testów dla dekodera, bez dodatkowych narzędzi.
Przestań nad nim pracować, gdy tylko siedem plików JSON i zdjęcia są zapisane.

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

1. Każdą sekcję, w kolejności od góry strony, i imię na każdej karcie artysty.
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
```

---

**Oczekiwany wynik.** Najpierw plan: jak skrypt czyta plik, jakiej paczki używa i jaki kształt
ma każdy plik JSON. Przeczytaj go, popraw zwykłymi słowami albo zatwierdź. Potem agent pisze
i uruchamia dekoder. Może to potrwać dłużej, niż pozwala warsztat: o RESCUE_TIME_1 każdy,
kto nie ma jeszcze `design/data`, bierze paczkę awaryjną (ostatni wiersz tabeli niżej). Na końcu
jest `npm run design`, w `design/data` siedem plików JSON, w `design/images` zdjęcia, a w czacie
lista z sześcioma punktami.

Sprawdź w liście dwie rzeczy:

- Punkt 1 zgadza się z designem: dwanaście kart artystów z dwunastoma różnymi imionami, a nie ogólny landing page.
- Punkt 6 nie jest pusty. Odpowiadaj nazwami z designu, na przykład nazwą koloru albo stylu tekstu z punktu 2, a nie nowymi wartościami. Jeśli punkt 6 jest pusty, zapytaj `co z tego przeczytałeś, a co wywnioskowałeś?`

Na to, na co nie umiesz tak odpowiedzieć, wklej:

```text
Tam, gdzie nie odpowiedziałem: wybierz najbardziej prawdopodobny odczyt, zapisz go do
notes.md jako założenie i jedź dalej.
```

Po twoich odpowiedziach agent robi commit i push.

**Po tym prompcie wpisz `/clear`.**

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Pisze kod, zanim pokaże plan | Naciśnij Esc, potem powiedz `Stop. Najpierw pokaż mi plan i poczekaj na moją zgodę.` |
| Rozkodowuje plik raz i nie pisze skryptu | `Prosiłem o narzędzie. Przenieś rozkodowanie do skryptu, niech uruchamia go npm run design, i uruchom go.` |
| Pisze testy albo dodatkowe narzędzia dla dekodera | `Dekoder ma być jednym skryptem. Bez testów dla niego. Zapisz siedem plików JSON i zdjęcia, potem przestań.` |
| W pliku JSON brakuje wartości | `W design/data/typography.json nie ma interlinii. Popraw skrypt, żeby je czytał, i uruchom npm run design jeszcze raz.` |
| Zaczyna budować stronę | Naciśnij Esc, potem powiedz `Stop. W tym kroku bez kodu strony. Cofnij wszystko, co napisałeś dla strony.` |
| Prosi o przeczytanie pliku spoza folderu | Plik `.fig` leży obok projektu, nie w nim. Przenieś go do `design` w projekcie i powiedz `Jest teraz w design.` |
| Przeszukuje dysk albo czyta inny projekt | Naciśnij Esc, potem powiedz `Stop. Design to plik .fig w design i nic więcej. Nie używaj niczego, co znalazłeś poza tym projektem.` |
| „Nie mogę otworzyć pliku binarnego" | `To jest zip. Skrypt ma go rozpakować i rozkodować canvas.fig tak, jak opisałem w poprzedniej wiadomości.` |
| Opisuje małą, rozmytą stronę | Przeczytał `thumbnail.png`. `To jest podgląd. Pracuj na canvas.fig.` |
| `zstd` nieobsługiwany albo dekompresja się sypie | Node jest starszy niż 22.15. `Użyj paczki, która czyta zstd, i działaj dalej.` |
| Codex pyta o dostęp do sieci | Odpowiedz tak. Instalacja paczki go wymaga. |
| Claude Code pyta przed każdą komendą | Odpowiedz tak i wybierz opcję, która przestaje pytać o ten rodzaj komend. |
| Każda karta artysty ma to samo imię | `Czytasz komponent, a nie instancje. Rozwiąż w skrypcie właściwości komponentu i nadpisania.` |
| Kolory wracają jako „ciemny szary" | `Podaj dokładne wartości. Jeśli skrypt nie potrafi ich odczytać, powiedz to.` |
| `git push` nie działa | Uruchom `gh auth status` w nowym oknie terminala (w dowolnym folderze). Jeśli nie jesteś zalogowany, powtórz krok Zaloguj się ze strony Przygotowanie, potem powiedz `Zrób push jeszcze raz.` |
| Jest RESCUE_TIME_1, a nie masz `design/data` | Naciśnij Esc. Jeśli stopka pokazuje plan mode, naciskaj Shift+Tab, aż zniknie (Codex: wyjdź z /plan, wpisując /plan jeszcze raz albo Esc). Pobierz **design-data.zip** ze strony warsztatu i powiedz agentowi: `Rozpakuj design-data.zip z mojego folderu Pobrane do tego projektu, zrób to, co mówi RESCUE.md w środku, i zrób commit.` Potem `/clear` i prompt 03. W Codespace przeciągnij zip ze swojego komputera na listę plików po lewej, potem powiedz `Rozpakuj design-data.zip w tym projekcie, zrób to, co mówi RESCUE.md w środku, i zrób commit.` |

---

### Dlaczego jest tak napisany

- Najpierw plan: złe podejście do pliku poprawiasz jednym zdaniem, zanim skrypt powstanie.
- Skrypt, a nie jednorazowe rozkodowanie: nowa wersja pliku `.fig` to jedno `npm run design`, a strona i checker czytają ten sam JSON.
- Punkt 6: lista rzeczy, których plik nie określa, to ta część briefu, której nikt nie napisał.
