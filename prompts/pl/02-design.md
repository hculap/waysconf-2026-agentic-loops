# 02 — Popatrz na design

Agent czyta design i mówi ci, co znalazł. Strony jeszcze nie pisze. To najtańsza poprawka,
jaką dostaniesz tego dnia: błędne założenie kosztuje tu jedno zdanie, a dwadzieścia minut
wygenerowanego kodu — później.

---

## Najpierw włóż plik do projektu

1. Otwórz plik TURBINE i wybierz **Duplicate to your drafts**. Teraz jest twój, możesz w nim grzebać.
2. Menu główne (ikona Figmy w lewym górnym rogu) → **File** → **Save local copy…**
3. Figma zapisze jeden plik z końcówką **`.fig`**. W folderze projektu załóż folder `design`
   i włóż go tam.

Nie masz konta w Figmie? Na stronie warsztatu jest ten sam plik do pobrania. Włóż go w to
samo miejsce.

**W projekcie, nie obok niego.** Agent pracuje wewnątrz folderu projektu. Claude Code pyta,
zanim przeczyta cokolwiek spoza tego folderu, a plik piętro wyżej zamienia się w pytanie
o zgodę, na którym agent musi się zatrzymać.

**Plik, a nie jego zdjęcie.** PNG to zdjęcie designu: agent musi wyprowadzić każdy kolor i
każdy wymiar z pikseli, i będzie *prawie* trafiał — a prawie to dokładnie to, co oblewa test
kontrastu i wygląda subtelnie źle obok oryginału. Plik `.fig` to sam design: tekst jako
tekst, kolory jako wartości, zmienne, komponenty i zdjęcia. Nie ma czego zgadywać.

Twój agent nie ma programu, który otwiera `.fig`, więc rozkoduje plik sam. Zajmie mu to
dziesięć do piętnastu minut i może przy tym zainstalować z internetu małą paczkę. **Na sali
jest sieć, więc mu na to pozwól** — jeśli Codex zapyta o dostęp do sieci, odpowiedz tak.

---

```text
W tym projekcie jest folder design, a w nim plik .fig. To jest sam plik Figmy, zapisany
przez „Save local copy". To nie jest obrazek: to cały design jako dane — każdy tekst,
kolor, zmienna, komponent i zdjęcie.

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

Możesz zainstalować paczkę, żeby to zrobić; sieć jest dostępna. To, co rozkodujesz, trzymaj
w folderze design-data w tym projekcie, żeby każdy kolejny krok czytał to zamiast
rozkodowywać od nowa. Nie pisz jeszcze żadnego kodu strony.

Potem zapisz, co znalazłeś, do notes.md, jako listę, i pokaż mi ją:

1. Każdą sekcję, w kolejności od góry strony.
2. Każdy kolor, po nazwie z designu, z dokładną wartością, i do czego jest używany.
3. Każdy rozmiar tekstu i gdzie który jest użyty.
4. Każdą szerokość, którą design obejmuje.
5. Wszystkie teksty, sekcja po sekcji.
6. Wszystko, co w pliku się nie zgadza albo czego w nim nie ma, a co inaczej musiałbyś
   zgadnąć.

Punkt 6 obchodzi mnie najbardziej. Bądź konkretny i bądź szczery: „w pliku jest stan hover,
do którego nie mam żadnych wartości" jest warte więcej niż pewne siebie zgadnięcie.

Potem zatrzymaj się i poczekaj, aż odpowiem na punkt 6.
```

---

**Co powinieneś zobaczyć.** Dziesięć do piętnastu minut, w których agent rozgryza plik, a
potem długą listę — zapisaną też jako `notes.md`. Przeczytaj ją. Dwie rzeczy są warte
twojej uwagi:

- **Czy to opisuje twój design?** Jeśli mówi „hero, trzy kafle i tabela cennika", a twój
  design ma lineup dwunastu artystów, to patrzy na coś innego albo na nic.
- **Co jest w punkcie 6?** Ta lista to brief, którego zapomniałeś napisać. Odpowiedz na nią
  teraz, własnymi słowami. Jeśli punkt 6 jest pusty, agent zgaduje i nie powiedział ci o
  tym — zapytaj: `co z tego przeczytałeś, a co wywnioskowałeś?`

`notes.md` będzie ważny później. Każdy kolejny prompt go czyta, a jeśli kiedyś będziesz
musiał zacząć nową sesję, to jest wszystko, co nowa sesja wie.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Zaczyna budować | `Stop. Pytałem, co znalazłeś, nie o kod. Cofnij wszystko, co napisałeś.` |
| W menu nie ma „Save local copy" | Jesteś w pliku, który możesz tylko oglądać. Najpierw zduplikuj go do swoich draftów i zapisz ze swojej kopii. |
| Prosi o przeczytanie pliku spoza folderu | Plik `.fig` leży obok projektu, nie w nim. Przenieś go do `design` w projekcie i powiedz `Jest teraz w design.` |
| „Nie mogę otworzyć pliku binarnego" | `To jest zip. Rozpakuj go i rozkoduj canvas.fig tak, jak opisałem w poprzedniej wiadomości.` |
| Opisuje małą, rozmytą stronę | Przeczytał `thumbnail.png`. `To jest podgląd. Pracuj na canvas.fig.` |
| `zstd` nieobsługiwany albo dekompresja się sypie | Twój Node jest starszy niż 22.15. `Zainstaluj paczkę, która czyta zstd, i działaj dalej.` |
| Codex pyta o dostęp do sieci | Odpowiedz tak. Instalacja paczki go wymaga, a sieć na sali jest. |
| Claude Code pyta przed każdą komendą | Rozkodowanie to dziesiątki małych komend. Odpowiedz tak i wybierz opcję, która przestaje pytać o ten rodzaj komend. |
| Każda karta artysty ma to samo imię | `Czytasz komponent, a nie instancje. Rozwiąż właściwości komponentu i nadpisania.` |
| Kolory wracają jako „ciemny szary" | `Podaj dokładne wartości. Jeśli nie potrafisz odczytać dokładnych, powiedz to — nie opisuj ich.` |
| Po dziesięciu minutach dalej nie umie przeczytać pliku | Pobierz gotową paczkę ze strony warsztatu, włóż ją do `design` i powiedz `Użyj paczki z folderu design.` |

---

### Po co ten prompt w ogóle istnieje

Nie produkuje strony. I o to chodzi.

Wszystko, co psuje się później w pętli design→kod, popsuło się właśnie tutaj, niewidocznie:
agent zgadł kolor, założył breakpoint, wymyślił słowo. Zmuszenie go, żeby powiedział, co
zobaczył — *zanim* zdąży ukryć zgadywankę w czterystu linijkach kodu — to najwyższy zwrot
z sekundy w całej sesji.

To jest też pierwsza pętla tego dnia, i nie musiałeś jej ustawiać. Agent nigdy nie otwierał
pliku `.fig`. Dałeś mu pięć faktów o formacie; napisał dekoder, spojrzał, co wyszło, i
próbował dalej, aż imiona na kartach były prawdziwymi imionami. Tak wygląda wszystko po
prompcie 04.

W Claude Code ten sam pomysł jest wbudowany jako **plan mode** (`Shift+Tab`, aż stopka powie
*plan mode on*): najpierw popatrz, powiedz, co znalazłeś, niczego nie zmieniaj. Ten prompt to
ten pomysł wypisany ręcznie, żeby działał w dowolnym agencie.
