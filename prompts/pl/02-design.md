# 02 — Popatrz na design

Agent czyta design i mówi ci, co znalazł. Strony jeszcze nie pisze. To najtańsza poprawka,
jaką dostaniesz tego dnia: błędne założenie kosztuje tu jedno zdanie, a dwadzieścia minut
wygenerowanego kodu — później.

**Najpierw połóż design obok projektu.** Jeden plik: sam plik Figmy.

---

## Figma → .fig → agent

1. Otwórz plik TURBINE i wybierz **Duplicate to your drafts**. Teraz jest twój, możesz w nim grzebać.
2. Menu główne (ikona Figmy w lewym górnym rogu) → **File** → **Save local copy…**
3. Figma zapisze plik z końcówką **`.fig`**. Obok projektu załóż folder `design` i włóż go tam.

Nie masz konta w Figmie? Na stronie warsztatu jest ten sam plik do pobrania. Połóż go w tym
samym miejscu.

**Plik, a nie jego zdjęcie.** PNG to zdjęcie designu: agent musi wyprowadzić każdy kolor i
każdy wymiar z pikseli, i będzie *prawie* trafiał — a prawie to dokładnie to, co oblewa test
kontrastu i wygląda subtelnie źle obok oryginału. Plik `.fig` to sam design: tekst jako
tekst, kolory jako wartości, zmienne, komponenty i zdjęcia. Nie ma czego zgadywać.

Twój agent nie ma programu, który otwiera `.fig`, więc rozkoduje plik sam. Zajmie mu to
dziesięć do piętnastu minut i może przy tym zainstalować z internetu małą paczkę. **Na sali jest sieć, więc mu na
to pozwól** — jeśli Codex zapyta o dostęp do sieci, odpowiedz tak.

---

## Droga A — masz Figmę podpiętą do agenta

Użyj tej, jeśli `figma` pojawia się po wpisaniu `/mcp` w Claude Code albo `codex mcp list`
w Codeksie. Agent czyta żywy plik i `.fig` możesz pominąć. Potrzebne jest płatne miejsce w
Figmie z Dev Mode; na darmowym koncie idź drogą B.

```text
Przeczytaj plik designu przez serwer MCP Figmy:
<wklej tutaj link do Figmy>

Nie pisz jeszcze żadnego kodu. Powiedz mi, co znalazłeś, jako listę:

1. Każdą sekcję, w kolejności od góry strony, z nazwą.
2. Każdy kolor, jako dokładną wartość, i do czego jest używany.
3. Każdy rozmiar tekstu i gdzie który jest użyty.
4. Każdą szerokość, którą design obejmuje.
5. Odstępy, które widzisz — przerwy między elementami.
6. Wszystko, czego design ci nie mówi, a co inaczej musiałbyś zgadnąć.

Punkt 6 obchodzi mnie najbardziej. Bądź konkretny i bądź szczery: „nie wiem, co dzieje się
z siatką lineupu poniżej 500 px" jest dla mnie warte więcej niż pewne siebie zgadnięcie.
```

---

## Droga B — plik .fig

Zwyczajna droga i ta, którą zakłada reszta tego zestawu.

```text
Obok tego projektu jest folder design, a w nim plik .fig. To jest sam plik Figmy, zapisany
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
  Zostało usunięte w Figmie, a wciąż siedzi w pliku.
- Tekst w komponencie może pochodzić z właściwości komponentu i z nadpisań. Jeśli każda
  karta tego samego rodzaju pokazuje te same słowa, czytasz komponent zamiast instancji.
  Rozwiąż to, zanim zaufasz jakiemukolwiek tekstowi.

Możesz zainstalować paczkę, żeby to zrobić; sieć jest dostępna. To, co rozkodujesz, trzymaj
w folderze design-data w tym projekcie, żeby kolejne kroki czytały to zamiast rozkodowywać
od nowa. Nie pisz jeszcze żadnego kodu strony.

Potem powiedz mi, co znalazłeś, jako listę:

1. Każdą sekcję, w kolejności od góry strony.
2. Każdy kolor, po nazwie z designu, z dokładną wartością, i do czego jest używany.
3. Każdy rozmiar tekstu i gdzie który jest użyty.
4. Każdą szerokość, którą design obejmuje.
5. Wszystkie teksty, sekcja po sekcji.
6. Wszystko, co w pliku się nie zgadza albo czego w nim nie ma, a co inaczej musiałbyś
   zgadnąć.

Punkt 6 obchodzi mnie najbardziej. Bądź konkretny i bądź szczery: „w pliku jest stan hover,
do którego nie mam żadnych wartości" jest warte więcej niż pewne siebie zgadnięcie.
```

---

**Co powinieneś zobaczyć.** Dziesięć do piętnastu minut, w których agent rozgryza plik, a
potem długą listę. Przeczytaj ją. Dwie rzeczy są warte twojej uwagi:

- **Czy to opisuje twój design?** Jeśli mówi „hero, trzy kafle i tabela cennika", a twój
  design ma lineup dwunastu artystów, to patrzy na coś innego albo na nic.
- **Co jest w punkcie 6?** Ta lista to brief, którego zapomniałeś napisać. Odpowiedz na nią
  teraz, własnymi słowami, zanim pójdziesz dalej. Jeśli punkt 6 jest pusty, agent zgaduje i
  nie powiedział ci o tym — zapytaj: `co z tego przeczytałeś, a co wywnioskowałeś?`

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Zaczyna budować | `Stop. Pytałem, co znalazłeś, nie o kod. Cofnij wszystko, co napisałeś.` |
| W menu nie ma „Save local copy" | Jesteś w pliku, który możesz tylko oglądać. Najpierw zduplikuj go do swoich draftów i zapisz ze swojej kopii. |
| „Nie mogę otworzyć pliku binarnego" | `To jest zip. Rozpakuj go i rozkoduj canvas.fig tak, jak opisałem w poprzedniej wiadomości.` |
| Opisuje małą, rozmytą stronę | Przeczytał `thumbnail.png`. `To jest podgląd. Pracuj na canvas.fig.` |
| `zstd` nieobsługiwany albo dekompresja się sypie | Twój Node jest starszy niż 22.15. `Zainstaluj paczkę, która czyta zstd, i działaj dalej.` |
| Codex pyta o dostęp do sieci | Odpowiedz tak. Instalacja paczki go wymaga, a sieć na sali jest. |
| Claude Code pyta przed każdą komendą | Rozkodowanie to dziesiątki małych komend. Odpowiedz tak i wybierz opcję, która przestaje pytać o ten rodzaj komend. |
| Każda karta artysty ma to samo imię | `Czytasz komponent, a nie instancje. Rozwiąż właściwości komponentu i nadpisania.` |
| Kolory wracają jako „ciemny szary" | `Podaj dokładne wartości. Jeśli nie potrafisz odczytać dokładnych, powiedz to — nie opisuj ich.` |
| Figma zwraca błąd albo 401 | Twoje konto nie obejmuje Dev Mode. Użyj pliku `.fig` — droga B, dalej nic się nie zmienia. |
| Po dziesięciu minutach dalej nie umie przeczytać pliku | Pobierz gotową paczkę ze strony warsztatu, włóż ją do `design` i powiedz `Użyj paczki z folderu design.` |
| Opisuje stronę, której nie znasz | Nie czyta twojego pliku. Sprawdź link albo przejdź na drogę B. |

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
