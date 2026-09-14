# 07 — Spróbuj to zepsuć

Twój checker jest zielony. To znaczy *brak znanego defektu* — nigdy nie znaczyło
skończone.

Ten prompt idzie szukać tego, czego checker strukturalnie nie widzi. To model sprawdzający
model, czyli najmniej niezawodna rzecz, jaką dziś zrobisz — i nadal warto ją zrobić, bo
alternatywą jest nie patrzeć.

---

```text
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

Zgłoś tylko te znaleziska, które przeżyją wszystkie trzy. W razie wątpliwości domyślnie
wyrzucaj i powiedz mi, ile wyrzuciłeś. Cztery prawdziwe znaleziska są warte więcej niż
pięć, w których jedno jest zgadywanką. Jeśli nie umiesz wskazać konkretnego elementu, to
nie jest znalezisko.

Nie naprawiaj jeszcze niczego. Najpierw chcę zdecydować, które z nich są prawdziwe.
```

---

**Co powinieneś zobaczyć.** Krótką listę, z której kilka pozycji naprawdę warto naprawić —
i przynajmniej jedną, która jest błędna albo z którą się nie zgadzasz. Oba wyniki są lekcją.

Wybierz dwa, w które wierzysz, i powiedz:

```text
Napraw znaleziska 2 i 4. Resztę zostaw. Potem uruchom npm run check jeszcze raz — chcę
wiedzieć, czy naprawa zepsuła coś, co przechodziło.
```

---

### Dlaczego każesz mu kłócić się ze sobą

Recenzent poproszony o „znalezienie problemów" znajduje problemy — wyprodukuje pięć, bo
poprosiłeś o pięć. Recenzent poproszony o *zniszczenie konkretnej tezy* albo ją niszczy,
albo mu się nie udaje, a nieudanie się jest informacją.

Te trzy strony robią robotę, którą zrobiłaby druga osoba. Są słabsze niż druga osoba i dużo
lepsze niż nic, a kosztują jeden akapit.

### Gdzie samoocena wystarcza, a gdzie nie

| Wystarcza | Nie wystarcza |
|---|---|
| Czy to zdanie jest dobre | Czy to jest poprawne |
| Które z tych pięciu znalezisk jest najważniejsze | Czy to jest dostępne |
| Czy to brzmi jak ta sama marka | Czy to zgadza się z designem |
| Czy hierarchia jest czytelna | Czy to jest skończone |

Lewa kolumna nie ma zewnętrznej prawdy do sprawdzenia, więc przemyślana opinia jest
najlepszym dostępnym narzędziem. Prawa kolumna ją ma — więc jej użyj i nie przyjmuj opinii
w zamian.

Ten prompt mieszka w całości w lewej kolumnie. Dlatego produkuje listę do twojej oceny, a
nigdy werdykt.

---

### Jeden prawdziwy przykład

Kiedy powstawał ten warsztat, test dostępności był zielony. Zero naruszeń, trzy szerokości,
dwa razy pod rząd, perfekcyjny wynik Lighthouse.

Pięć z dziewięciu fragmentów tekstu w hero było poniżej legalnego minimum kontrastu
względem zdjęcia za nimi. Największy, pierwszy, najczęściej czytany tekst na stronie.

Checker nie był zepsuty i nie kłamał. axe nie ocenia tekstu na tle obrazu — zgłasza parę
jako *incomplete*, a w bramce, której regułą jest „zero naruszeń", incomplete jest nie do
odróżnienia od poprawnego.

Kod źródłowy też by ci tego nie powiedział. Tłem było tam zdjęcie, dwie półprzezroczyste
nakładki i gradient złożone razem, a żadna linijka CSS nigdzie nie mówi, jaki kolor z tego
wychodzi. Trzeba było człowieka, który postanowił popatrzeć.

**Zielony znaczy: brak znanego defektu. Wiedzieć, gdzie kończą się twoje testy — to jest
robota.**
