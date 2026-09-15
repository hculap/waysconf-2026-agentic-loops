# 02 — Popatrz na design

Agent dekoduje plik Figmy, spisuje design jako dokumenty w `docs` i wypisuje, co znalazł. Nie
pisze kodu strony.

## Zanim wkleisz

1. Na stronie warsztatu kliknij **Pobierz turbine.fig**.
2. W folderze projektu załóż folder `design` i włóż do niego plik.

Plik musi leżeć w folderze projektu: Claude Code pyta o zgodę, zanim przeczyta plik spoza
niego.

---

```text
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
```

---

**Oczekiwany wynik.** Od 10 do 16 minut dekodowania. W `docs` pojawia się siedem dokumentów
(sekcje, kolory, typografia, layout, komponenty, teksty, obrazy), a w `design-data`
rozkodowane dane i zdjęcia. Na końcu w czacie jest lista z sześcioma punktami.

Sprawdź w liście dwie rzeczy:

- Sekcje zgadzają się z designem: dwanaście kart artystów z dwunastoma różnymi nazwami, a nie ogólny landing page.
- Punkt 6 nie jest pusty. Odpowiedz na każdą pozycję własnymi słowami. Jeśli jest pusty, zapytaj `co z tego przeczytałeś, a co wywnioskowałeś?`

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Zaczyna budować | `Stop. Pytałem, co znalazłeś, nie o kod. Cofnij wszystko, co napisałeś.` |
| Zostawia dokumenty na koniec | `Zapisz teraz docs/colours.md z tego, co już przeczytałeś, i jedź dalej.` |
| W dokumencie brakuje wartości | `W docs/typography.md nie ma interlinii. Odczytaj je z pliku i dopisz.` |
| Prosi o przeczytanie pliku spoza folderu | Plik `.fig` leży obok projektu, nie w nim. Przenieś go do `design` w projekcie i powiedz `Jest teraz w design.` |
| Przeszukuje dysk albo czyta inny projekt | `Stop. Design to plik .fig w design i nic więcej. Nie używaj niczego, co znalazłeś poza tym projektem.` |
| „Nie mogę otworzyć pliku binarnego" | `To jest zip. Rozpakuj go i rozkoduj canvas.fig tak, jak opisałem w poprzedniej wiadomości.` |
| Opisuje małą, rozmytą stronę | Przeczytał `thumbnail.png`. `To jest podgląd. Pracuj na canvas.fig.` |
| `zstd` nieobsługiwany albo dekompresja się sypie | Node jest starszy niż 22.15. `Zainstaluj paczkę, która czyta zstd, i działaj dalej.` |
| Codex pyta o dostęp do sieci | Odpowiedz tak. Instalacja paczki go wymaga. |
| Claude Code pyta przed każdą komendą | Odpowiedz tak i wybierz opcję, która przestaje pytać o ten rodzaj komend. |
| Każda karta artysty ma to samo imię | `Czytasz komponent, a nie instancje. Rozwiąż właściwości komponentu i nadpisania.` |
| Kolory wracają jako „ciemny szary" | `Podaj dokładne wartości. Jeśli nie potrafisz ich odczytać, powiedz to.` |

---

### Dlaczego jest tak napisany

- Bez kodu strony: błędne założenie poprawiasz tu jednym zdaniem, zanim rozejdzie się po całej stronie.
- Dokumenty w `docs`: każdy kolejny prompt czyta je zamiast dekodować plik od nowa, a ty możesz je otworzyć.
- Punkt 6: lista rzeczy, których plik nie określa, to ta część briefu, której nikt nie napisał.
