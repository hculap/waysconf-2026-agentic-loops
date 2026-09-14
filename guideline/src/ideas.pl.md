# Idee

Wszystko ze slajdów, na jednej stronie, żebyś mógł to przeczytać później, zamiast
fotografować ekran. Obrazki są te same, co na ścianie, i możesz ich używać u siebie.

---

## Dziewięćdziesiąt minut

::diagram:06-ninety-minutes::

Trzy odcinki pracy własnej, a ten środkowy chodzi na twoim komputerze, kiedy ja mówię.
Nic tutaj nie wymaga, żeby poprzednia rzecz się udała — **każdy prompt stoi sam**, a
zostanie w tyle nie kosztuje cię nic poza tym, co pominąłeś.

**Z czym wychodzisz:** adres działający w internecie, folder ze stroną i programem, który
ją sprawdza, oraz osiem promptów, które w poniedziałek zadziałają na czymś, co nie jest
stroną festiwalu.

---

## Większość dem AI kończy się na *wow*

Wchodzi prompt. Wychodzi coś efektownego. Wszyscy biją brawo. A potem ktoś zadaje pytanie,
na które demo nie było przygotowane:

*Czy to zgadza się z designem? Czy kontrast jest legalny? Czy działa na telefonie? Czy to
są prawdziwe teksty, czy wymyślone?*

Brak odpowiedzi. Nie zła odpowiedź — **brak mechanizmu, który mógłby jakąkolwiek
wyprodukować.**

> Pętla ma sens tylko wtedy, gdy coś w niej potrafi powiedzieć **nie**, nie pytając o zgodę
> modelu językowego.

---

## Pętla

::diagram:01-the-loop::

Ciekawa nie jest strzałka, która generuje kod. Ciekawe jest pudełko, które odmawia.

Strzałkę powrotną napędza **plik** — raport napisany przez program — a nie wrażenie agenta
na temat własnej pracy. Na tym polega cała różnica.

---

## Prawdziwa pętla i udawana

::diagram:02-fake-loop-vs-real-loop::

Udawana pętla sprawia wrażenie produktywnej. Produkuje zdania w rodzaju *„przejrzałem swoją
pracę i ją poprawiłem"*, nie do odróżnienia od prawdziwej aż do momentu, w którym coś
zewnętrznego się nie zgodzi.

Na obu diagramach ten sam model pisze tę samą stronę. Zmienia się **to, kto ma prawo
powiedzieć nie.**

---

## Gdzie samoocena wystarcza, a gdzie nie

| Wystarcza | Nie wystarcza |
|---|---|
| Czy to zdanie jest dobre | Czy to jest poprawne |
| Które z tych pięciu znalezisk jest najważniejsze | Czy to jest dostępne |
| Czy to brzmi jak ta sama marka | Czy to zgadza się z designem |
| Czy hierarchia jest czytelna | Czy to jest skończone |

Lewa kolumna nie ma zewnętrznej prawdy do sprawdzenia, więc przemyślana opinia jest
najlepszym dostępnym narzędziem. Prawa kolumna ją ma — więc jej użyj i nie przyjmuj opinii
w zamian.

---

## Dwa kształty

::diagram:07-loop-vs-workflow::

**Pętla** to *rób to znowu, aż warunek będzie spełniony*. Ty definiujesz warunek wyjścia.
→ prompt 05 i `/goal` w Claude Code.

**Workflow** to *zrób te rzeczy, w tej kolejności, z poprzeczką między każdą*. Ty definiujesz
fazy i to, co musi być prawdą, zanim zacznie się następna. → prompt 08.

Żadne z tego nie jest skryptem. Oba są rzeczami, które **mówisz** — i dlatego zmiana
któregokolwiek to jedno zdanie, a nie edycja, test i ponowny deploy.

Zagnieżdżają się. Workflow doprowadza cię od zera do prawie-dobrze; pętla w jednej z jego
faz domyka resztę.

---

## Najpierw plan, potem budowanie

Najtańsza poprawka w całej pętli to ta zrobiona, zanim powstanie jakikolwiek kod.

W **Claude Code** naciskaj `Shift+Tab`, aż stopka powie *plan mode on*. Agent nie może wtedy
niczego edytować, dopóki nie zaakceptujesz. W **Codeksie** poproś o plan i nie przyjmuj
kodu, dopóki go nie przeczytasz:

```text
Nie pisz jeszcze żadnego kodu. Powiedz mi, co znalazłeś i co zamierzasz zbudować,
sekcja po sekcji, i poczekaj.
```

Tym właśnie jest prompt 02. Nie pisze zupełnie nic — patrzy na design i zdaje relację.
Projektant, który przeczyta trzy akapity i powie *„nie, lineup jest przed biletami"*, właśnie
oszczędził dwadzieścia minut pewnego siebie budowania nie tego, co trzeba.

> Najlepszy moment na wyłapanie nieporozumienia jest wtedy, kiedy jest ono jeszcze zdaniem.

---

## Trzy poziomy sprawdzania

::diagram:03-verification-tiers::

Dolny poziom jest tani, pewny i wąski. Górny łapie to, czego pozostałe nie potrafią, i jest
najmniej niezawodną rzeczą w całym stosie. Żaden nie zastępuje drugiego, a system złożony
z samego górnego poziomu to system, który zgadza się sam ze sobą.

---

## Raport błędów jest interfejsem

To jest część, którą ludzie pomijają, i to ona sprawia, że pętla działa. Z checkera wraca
**plik**, napisany jednocześnie dla dwóch czytelników: człowieka o drugiej w nocy i agenta,
który nie pamięta poprzedniej iteracji.

```md
**3. [check 07] kolor na stronie nie występuje w designie**

- Gdzie: linia opisowa w każdej karcie w sekcji lineup
- Oczekiwano: „text / secondary" z designu
- Jest: „text / muted" z designu — zmierzone 4,07:1 względem tła strony,
        a tekst ciągły potrzebuje 4,5:1
- Wskazówka: muted jest zdefiniowany wyłącznie dla stopki i tekstów prawnych
```

Tego nie napisał żaden model. Zmierzył to i wypisał program. Każda linijka jest czymś, na
czym agent może działać bez zgadywania: które kryterium, który element, czego oczekiwano,
co faktycznie było.

Porównaj to z tym, co model mówi o własnej pracy — *„poprawiłem kontrast w sekcji lineup"* —
i masz różnicę między raportem a zapewnieniem.

**Reguła, która trzyma to wszystko:** agent nigdy nie może edytować checkera. Powiedz to
wprost w prompcie i tak to traktuj. W momencie, w którym sądzony może edytować sędziego,
każdy kolejny zielony wynik nic nie znaczy.

---

## Dlaczego świeży kontekst bije długi

Okno kontekstu to bufor, nie pamięć. Po czterdziestu minutach trzyma trzy porzucone
podejścia, oryginalny brief sprzed sześćdziesięciu tysięcy tokenów i każdy zły zakręt, który
pętla już zrobiła — a model wciąż waży własne wcześniejsze rozumowanie.

| Długa rozmowa | Świeże przejście |
|---|---|
| Pamięta wszystko, źle | Czyta raport — aktualne błędy |
| Waży własne stare rozumowanie | Czyta `notes.md` — co już próbowano i ile to kosztowało |
| Robi się mętna i wolna | Czyta notatki z designu |

Więc kiedy zaczyna dryfować:

```text
Zapisz do notes.md, co zostało do zrobienia, w dziesięciu linijkach. Co próbowałeś,
co zadziałało, co nie i dlaczego.
```

Potem zacznij nową sesję, wklej `notes.md` i jedź dalej. **Notatki na dysku biją pamięć
w kontekście.** To dzięki nim iteracja 7 wie, że iteracja 3 próbowała już oczywistej rzeczy.

---

## Dać agentowi design, a nie jego zdjęcie

::diagram:04-mcp-topology::

Agent, który dostaje zrzut ekranu, wyprowadza każdy kolor i każdy wymiar z pikseli. Będzie
*prawie* trafiał — jakiś pomarańczowy, jakieś odstępy — a prawie to dokładnie to, co oblewa
test kontrastu i wygląda subtelnie źle obok prawdziwego designu.

Kiedy dostaje plik z wartościami, nie wyprowadza niczego. `#FF6A1A` jest w pliku.

To jest cały argument za podłączeniem agenta do Figmy albo za daniem mu samego pliku
`.fig`. **MCP** to po prostu standardowy sposób robienia takiego połączenia: agent wołający
narzędzia, których nie ma w sobie — plik designu, przeglądarkę, miejsce publikacji.

---

## Kiedy jeden agent to za mało

::diagram:05-dynamic-workflow::

Górny poziom tej piramidy to model sprawdzający model, a model zapytany *„czy to jest
dobre?"* powie, że tak. Lekarstwo jest strukturalne: **kilka przebiegów o różnych zadaniach
i runda, której jedynym celem jest obalanie znalezisk.**

Jeden przebieg szuka problemów z designem, jeden z dostępnością, jeden z tekstami. Każdy
kandydat musi wskazać konkretny element — twierdzenie, które nie umie na nic wskazać, ląduje
w koszu bez czytania. Potem każde znalezisko idzie z powrotem, żeby zostać *obalone*, i
raportowane jest tylko to, co przeżyje.

Prompt 07 to jednoagentowa wersja dokładnie tego, zwinięta do jednej wiadomości: popatrz
przez kilka soczewek, a potem argumentuj przeciwko każdemu znalezisku z trzech stron — **czy
to prawda, czy to ma znaczenie, czy to już jest obsłużone** — zanim powiesz je na głos.
Słabsze niż trzy niezależne agenty i nie wymaga niczego instalować.

Nadal jest to najmniej niezawodna rzecz, jaką zrobisz tego dnia. Warto ją robić, bo
alternatywą jest nie patrzeć.

---

## Publikacja: strona, która poszła, musi być tą, która przeszła

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

Poprosi o zalogowanie, potem o wybór albo utworzenie strony, a na końcu wypisze adres. Ten
adres jest sensem całych dziewięćdziesięciu minut.

Jeszcze jeden krok, i tego akurat nikt nie robi:

```text
Pobierz adres, który przed chwilą opublikowałeś, i porównaj to, co zwrócił serwer,
ze stroną w dist/. Jeśli się różnią, powiedz mi dokładnie czym.
```

Wszystko wcześniej dowodzi, że *jakaś* strona przeszła. Dopiero to dowodzi, że strona, która
przeszła, jest stroną, która poszła. Rozjeżdżają się częściej, niż by się wydawało — stary
build, nie ten folder, host dokładający własny kod.

---

## To, co przydarzy się tobie

Test dostępności na stronie referencyjnej tego warsztatu był zielony. Zero naruszeń, trzy
szerokości, dwa razy pod rząd. Perfekcyjny wynik Lighthouse.

Pięć z dziewięciu fragmentów tekstu w hero było **poniżej legalnego minimum kontrastu**
względem zdjęcia za nimi. Największy, pierwszy, najczęściej czytany tekst na stronie.

Powód: axe nie ocenia tekstu na tle obrazu. Nie oblewa go — oznacza parę jako *incomplete*,
a w teście, którego reguła brzmi „zero naruszeń", incomplete jest nie do odróżnienia od
poprawnego.

Czytanie CSS też by tego nie znalazło. Tłem było tam zdjęcie, dwie półprzezroczyste
nakładki i gradient złożone razem, a żadna linijka CSS nigdzie nie mówi, jaki kolor z tego
wychodzi.

**Zielony znaczy: brak znanego defektu. Wiedzieć, gdzie kończą się twoje testy — to jest
robota.**

---

## Gdzie pętle naprawdę zawodzą

| Wygląda jak | Jest | Co zrobić |
|---|---|---|
| Test robi się zielony, a nic nie zostało naprawione | Agent zedytował test | Powiedz to wprost, przywróć plik i przeczytaj diff — to najbardziej pouczająca rzecz, jaką zobaczysz tego dnia |
| Dwa złe stany, na przemian | Dwa wymagania, które nie mogą być jednocześnie spełnione | Zatrzymaj to. Sprzeczność jest w briefie, nie w kodzie |
| Nie przestaje, choć jest gotowe | Nic nie uruchamia testu *najpierw* | Sprawdzaj przed naprawianiem, w każdej rundzie |
| Robi się mętne i wolne | Kontekst się zapełnił | Zapisz stan do pliku, zacznij od nowa, wklej plik |
| „Teraz działa", a nie działa | Raportuje, zamiast mierzyć | Wierz wyłącznie kodowi wyjścia |
| Nic, przez dłuższą chwilę | Czeka na coś, co nie ma terminu | Każdy krok potrzebuje limitu czasu. Ten projekt stracił na tym godzinę trzy razy |

---

## Co się stało, kiedy uruchomiłem te prompty

Nie wyreżyserowane demo. Pusty folder poza jakimkolwiek repozytorium, Codex, prompty
wklejone po kolei, nic więcej w zasięgu.

| Prompt | Czas | Co z tego wyszło |
|---|---|---|
| 01 — start | 107 s | projekt Astro + Tailwind, działający dev server |
| 03 — buduj | 41 s | hero, z wartości, które dostał |
| 04 — **napisz checker** | 495 s | `check.mjs`, 264 linijki — plus testy do checkera i dokument opisujący go, o które nikt nie prosił |
| 05 — pętla | 46 s | ruszyła i zatrzymała się z właściwego powodu |

Jedenaście minut, bez nadzoru, od zera. Decyzja warta uwagi to ta, o którą nikt nie prosił:
agent sam postanowił traktować wyniki *incomplete* z axe jako błędy. Wzięło się to z jednego
zdania w prompcie 04 — **„test, który nie może się wykonać, jest porażką, nigdy pominięciem"**
— i jest to dokładnie ta ślepa plamka opisana wyżej, którą człowiekowi zajęło popołudnie.

---

## I co poszło nie tak przy budowaniu tego

Trzynaście incydentów. Dziewięć było awariami *weryfikatora* albo oprzyrządowania, nie strony.

| Co się stało | Dlaczego warto o tym wiedzieć |
|---|---|
| Dziewięć bramek przez cały przebieg mierzyło **cudzą stronę** — 427 pewnych siebie, poprawnie sformatowanych błędów | Weryfikator, który jest pewny i nie ma racji, jest gorszy niż żaden |
| **axe przepuścił pustą stronę.** Zero naruszeń, trzy szerokości, zielono | Pomiar niczego wygląda dokładnie jak pomiar doskonałości |
| Pętla wisiała godzinę na wejściu, którego nikt nie zamknął | Każdy krok potrzebuje terminu. Trzeci raz w jednym projekcie |
| Oprzyrządowanie dowodowe **wymyśliło cztery czyste iteracje** z przebiegu, który został zabity | Brak wyniku odczytany jako sukces — i jedyny przypadek, który wyprodukował tabelkę |
| Bramka była zielona, a hero nieczytelne | Narzędzie działało dokładnie zgodnie z dokumentacją, a dokumentacja leżała tam, gdzie nikt nie zagląda |

Wzór pod tym wszystkim to jedno zdanie: **brak wyniku nie jest wynikiem pozytywnym.**
Wpisz to do swojego checkera, zanim napiszesz cokolwiek innego.

---

## Weź to do pracy w poniedziałek

Nie zaczynaj od całej strony. Zacznij od **jednej bramki**.

1. Wybierz test, który twój zespół i tak robi ręcznie i którego nie znosi.
2. Zrób z niego program, który kończy się kodem 0 albo 1.
3. Wystaw jego wynik tam, gdzie agent może go przeczytać — plik, nie terminal, który musi
   zapamiętać.
4. *Dopiero wtedy* postaw przed nim agenta.

> Pętla jest łatwa. Robotą jest wyrocznia.

---

## Część uczciwa

- Automatyczne narzędzia do dostępności sięgają jakichś **30–40%** tego, czego naprawdę
  wymaga WCAG. Zielony znaczy *brak znanego defektu*, nigdy *dostępne*.
- Porównanie pikseli wykrywa, że coś się zmieniło. Nie ma pojęcia, czy zmiana była poprawą.
- Nic z tego wszystkiego nie ma zdania na temat tego, czy design jest dobry.
- Prompt 07 używa modelu do sprawdzania modelu. Łapie to, czego programy nie potrafią, i jest
  najmniej niezawodną częścią całości. Druga opinia, nie wyrocznia.
