# 03 — Zbuduj to

Teraz pisze stronę: całą, za jednym razem. Potem ty ją przeglądasz, sekcja po sekcji, we
własnym tempie. Budowanie cię nie potrzebuje; przeglądanie tak.

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

**Co powinieneś zobaczyć.** Kilka minut pracy, potem listę sekcji i adres. Otwórz go. Postaw
obok designu w Figmie i idź w dół strony, sekcja po sekcji. Każdą rzecz, która jest nie tak,
nazwij — po ludzku, tak jak powiedziałbyś juniorowi:

> Odstęp pod nagłówkiem jest za ciasny, a pomarańczowy to nie ten pomarańczowy.

To jest całkowicie dobre zgłoszenie błędu. Nie potrzebujesz słownictwa. Możesz wysyłać uwagi
po jednej albo kilka w jednej wiadomości; jedno i drugie działa.

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
| Z każdą chwilą jest wolniejszy i mętniejszy | Kończy mu się kontekst. Powiedz `Zaktualizuj notes.md tym, gdzie jesteśmy`, zacznij nową sesję, powiedz `Przeczytaj docs i notes.md i buduj dalej` i jedź dalej. |

---

### Dwie rzeczy warte zauważenia, kiedy pracuje

**Jest szybszy od ciebie, a to nie to samo co lepszy.** Cała strona pojawi się w czasie,
w którym porządnie obejrzysz jedną sekcję. Nie pozwól, żeby tempo budowania narzuciło tempo
oglądania: bierz sekcje po jednej i mów, co jest nie tak, zanim przejdziesz do następnej.

**Nic tutaj jeszcze niczego nie sprawdziło.** Na koniec tego promptu strona może wyglądać na
skończoną. Do tej pory oceniła ją dokładnie jedna rzecz: twoje oczy, na twoim ekranie, przy
twojej szerokości okna. Prompt 04 jest tym, co to zmienia.
