# 06 — Spróbuj to zepsuć

Przegląd strony przez agenta, który jej nie budował. Agent szuka problemów, których checker
z promptu 03 nie wyłapie, argumentuje przeciwko każdemu i zgłasza tylko te, które to przetrwają.
Ty wybierasz, które naprawić; agent je naprawia, sprawdza, że `npm run check` nadal przechodzi,
robi commit i push. Przegląd uzupełnia `npm run check`, nie zastępuje go.

## Zanim wkleisz

Wpisz `/clear`, żeby recenzent nie widział budowania strony. Agent, który ocenia własną pracę
w tej samej sesji, pamięta powody każdej decyzji i ich broni; to nie jest przegląd. Strona jest
przeglądana na tym komputerze, pod adresem serwera deweloperskiego: nic nie jest jeszcze
opublikowane.

---

```text
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

Zgłoś tylko te znaleziska, które przeżyją wszystkie trzy. W razie wątpliwości domyślnie
wyrzucaj i powiedz mi, ile wyrzuciłeś. Cztery prawdziwe znaleziska są warte więcej niż
pięć, w których jedno jest zgadywanką. Jeśli nie umiesz wskazać konkretnego elementu, to
nie jest znalezisko.

Nie naprawiaj jeszcze niczego. Najpierw chcę zdecydować, które z nich są prawdziwe.
```

---

**Oczekiwany wynik.** Do pięciu znalezisk, każde z elementem, problemem i powodem, dla którego
checker go nie wyłapał, oraz liczba odrzuconych kandydatów. Zdecyduj, które znaleziska są
prawdziwe, potem wklej, ze swoimi numerami:

```text
Napraw znaleziska 2 i 4. Resztę zostaw. Potem uruchom npm run check jeszcze raz — chcę
wiedzieć, czy naprawa zepsuła coś, co przechodziło. Jeśli nadal kończy się kodem 0, zrób
commit wszystkiego z opisem, które znaleziska naprawiłeś, i zrób push.
```

Agent naprawia wybrane znaleziska, uruchamia test i robi commit i push, kiedy przechodzi.

**Po tym prompcie wpisz `/clear`.**

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Znalezisko bez konkretnego elementu | `Nazwij element tak, jak widzę go na ekranie, albo usuń to znalezisko.` |
| Pięć znalezisk i nic nie odrzucił | `Ilu kandydatów odrzuciłeś i dlaczego?` Jeśli argumentowanie przeciwko znaleziskom niczego nie usunęło, w praktyce się nie odbyło. |
| Zaczyna naprawiać, zanim wybrałeś | `Stop. Jeszcze bez poprawek. Najpierw ja decyduję, które znaleziska są prawdziwe.` |
| Wspomina decyzje z budowania | Sesja nie została wyczyszczona. Wpisz `/clear` i wklej prompt jeszcze raz. |
| Po poprawce `npm run check` nie przechodzi | `Po twojej poprawce test nie przechodzi. Cofnij tę poprawkę, powiedz mi, dlaczego zepsuła test, i nie zmieniaj checkera.` |

---

### Dlaczego jest tak napisany

- Nowa sesja: recenzent, który nie budował strony, nie ma czego bronić.
- Znajdź, potem argumentuj przeciwko każdemu znalezisku z trzech stron (czy to prawda, czy to ma znaczenie, czy to już obsłużone): dostajesz to, co przetrwało, a nie wszystko, co znalazł.
- Szuka tam, gdzie program nie sięga: tekst na zdjęciach, kolejność czytania, alt, który jest i nic nie mówi, szerokości pomiędzy tymi z designu.
