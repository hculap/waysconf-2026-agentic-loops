# 03 — Zbuduj to

Agent buduje całą stronę z dokumentów w `docs`, w jednym przebiegu, i podaje lokalny adres.

---

```text
Zbuduj teraz stronę, na podstawie designu. Czytaj docs i notes.md; nie rozkodowuj pliku .fig
jeszcze raz.

Zbuduj całą stronę za jednym razem: każdą sekcję z docs/sections.md, w tej kolejności. Nie
zatrzymuj się między sekcjami, żeby mnie pytać. Kiedy skończysz, powiedz mi, które sekcje
zbudowałeś, po jednej linijce, i podaj adres do otwarcia.

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
```

---

**Oczekiwany wynik.** Kilka minut pracy, potem lista zbudowanych sekcji i adres. Otwórz
stronę obok designu w Figmie i przeglądaj ją sekcja po sekcji. Każdy problem zgłoś zwykłymi
słowami, na przykład:

> Odstęp pod nagłówkiem jest za ciasny, a pomarańczowy to nie ten pomarańczowy.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Zatrzymuje się po jednej sekcji i pyta | `Nie czekaj na mnie. Zbuduj całą stronę, potem mi pokaż.` |
| Tekst, którego nigdy nie widziałeś | `Skąd wzięło się to zdanie? Zastąp je tekstem z docs/copy.md.` |
| Szare pudełko tam, gdzie powinno być zdjęcie | `Użyj tu obrazu, który wymienia docs/images.md.` |
| Kolor, który jest prawie dobry | `To nie jest wartość z docs/colours.md. Użyj dokładnej i powiedz mi, jak się nazywa.` |
| Znowu zaczyna rozkodowywać .fig | `Stop. Wszystko, czego potrzebujesz, jest w docs i notes.md.` |
| Potrzebuje wartości, której dokumenty nie mają | `Znajdź ją w design-data, dopisz do właściwego dokumentu w docs, potem jej użyj.` |
| Mówi, że skończył, a wyraźnie nie | `Które sekcje zbudowałeś, a których jeszcze nie ma? Wypisz jedne i drugie.` |
| Jest coraz wolniejszy i mniej konkretny | Kontekst jest pełny. Powiedz `Zaktualizuj notes.md tym, gdzie jesteśmy`, zacznij nową sesję, powiedz `Przeczytaj docs i notes.md i buduj dalej`. |

---

### Dlaczego jest tak napisany

- Każda wartość pochodzi z `docs`: wartość, którą agent wybierze sam, checker z promptu 04 zgłosi jako błąd.
- Pytania trafiają do `notes.md`: agent buduje dalej, a ty poprawiasz jego założenia potem.
- Nic nie jest jeszcze sprawdzone. Jedyny przegląd to twój.
