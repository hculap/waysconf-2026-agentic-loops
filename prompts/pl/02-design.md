# 02 — Popatrz na design

Agent czyta design i mówi ci, co znalazł. Nie pisze nic. To najtańsza poprawka, jaką
dostaniesz tego dnia: błędne założenie kosztuje tu jedno zdanie, a dwadzieścia minut
wygenerowanego kodu — później.

**Najpierw wyciągnij design z Figmy i połóż obok projektu.** Trzy kliknięcia, a pakowanie
Figma robi za ciebie.

---

## Figma → zip → agent

1. Otwórz plik i wybierz **Duplicate to your drafts**. Teraz jest twój, możesz w nim grzebać.
2. Zaznacz ramki na kanwie.
3. Prawy panel → **Export** → wybierz **SVG** → **Export**.
4. Figma daje ci **zipa**. Rozpakuj go obok projektu, do folderu `design`.

**Eksportuj SVG, nie PNG.** PNG to zdjęcie designu: agent musi wyprowadzić każdy kolor i
każdy wymiar z pikseli, i będzie *prawie* trafiał — a prawie to dokładnie to, co oblewa test
kontrastu i wygląda subtelnie źle obok oryginału. SVG trzyma tekst jako tekst, a kolory jako
wartości, więc nie ma czego zgadywać.

PNG-i weź też, jeśli chcesz. Nic nie kosztują i dobrze się na nie patrzy.

---

## Droga A — masz Figmę podpiętą do agenta

Użyj tej, jeśli `figma` pojawia się po wpisaniu `/mcp` w Claude Code albo `codex mcp list`
w Codeksie. Agent czyta żywy plik i eksport możesz pominąć.

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

## Droga B — wyeksportowałeś sam

Zwyczajna droga i ta, którą zakłada reszta tego zestawu.

```text
Obok tego projektu jest folder design. To jest to, co wyeksportowałem z Figmy.

Przeczytaj wszystko. Pliki SVG niosą prawdziwy tekst i prawdziwe wartości kolorów —
czytaj je, zamiast zgadywać z obrazków. Nie pisz jeszcze żadnego kodu. Powiedz mi, co
znalazłeś, jako listę:

1. Każdą sekcję, w kolejności od góry strony.
2. Każdy kolor, po nazwie z designu, i do czego jest używany.
3. Każdy rozmiar tekstu i gdzie który jest użyty.
4. Każdą szerokość, którą design obejmuje.
5. Wszystkie teksty, sekcja po sekcji.
6. Wszystko, co w plikach się nie zgadza albo czego nie ma, a co inaczej musiałbyś zgadnąć.

Punkt 6 obchodzi mnie najbardziej. Bądź konkretny i bądź szczery: „w eksporcie jest stan
hover, do którego nie mam żadnych wartości" jest warte więcej niż pewne siebie zgadnięcie.
```

---

**Co powinieneś zobaczyć.** Listę. Przeczytaj ją. Dwie rzeczy są warte twojej uwagi:

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
| Figma zwraca błąd albo 401 | Twoje konto nie obejmuje Dev Mode. Wyeksportuj sam — droga B, dalej nic się nie zmienia. |
| Czytał tylko obrazki | `Skąd masz te wartości kolorów? Jeśli spróbkowałeś je z obrazka, powiedz to.` Spróbkowane wartości oblewają test tokenów: „blisko pomarańczowego z marki" to nie jest pomarańczowy z marki. Wyeksportuj też SVG. |
| Eksport to jeden ogromny plik | Zaznaczyłeś stronę zamiast ramek. Zaznacz same ramki i wyeksportuj jeszcze raz. |
| Kolory wracają jako „ciemny szary" | `Podaj dokładne wartości. Jeśli nie potrafisz odczytać dokładnych, powiedz to — nie opisuj ich.` |

---

### Po co ten prompt w ogóle istnieje

Nic nie produkuje. I o to chodzi.

Wszystko, co psuje się później w pętli design→kod, popsuło się właśnie tutaj, niewidocznie:
agent zgadł kolor, założył breakpoint, wymyślił słowo. Zmuszenie go, żeby powiedział, co
zobaczył — *zanim* zdąży ukryć zgadywankę w czterystu linijkach kodu — to najwyższy zwrot
z sekundy w całej sesji.

W Claude Code robi to za ciebie **plan mode** (`Shift+Tab`, aż stopka powie *plan mode on*).
Ten prompt to plan mode wypisany ręcznie, żeby działał w dowolnym agencie.
