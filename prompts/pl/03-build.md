# 03 — Zbuduj to

Teraz pisze stronę. Sekcja po sekcji, z zatrzymaniem po każdej, żebyś oglądał przegląd
designu, a nie ścianę outputu.

---

```text
Zbuduj teraz stronę, na podstawie designu. Czytaj design-data i notes.md; nie rozkodowuj
pliku .fig jeszcze raz.

Jedna sekcja naraz, w kolejności z notes.md. Po każdej sekcji powiedz mi jednym zdaniem,
co zbudowałeś, a potem ZATRZYMAJ SIĘ i czekaj, aż powiem „dalej". Nie buduj dwóch sekcji
za jednym razem, choćby wyglądały na drobne.

Reguły, wszystkie nienegocjowalne:

- Każdy kolor i każdy rozmiar pochodzi z designu. Jeśli łapiesz się na wybieraniu
  wartości, zatrzymaj się i zapytaj mnie.
- Każde słowo pochodzi z designu. Nie pisz tekstów. Nie poprawiaj tekstów. Jeśli jakiegoś
  fragmentu brakuje, zapytaj — nie zapychaj dziury.
- Każde zdjęcie pochodzi z designu: użyj obrazów, które rozkodowałeś, nigdy zastępczych.
- Do samej strony nie wchodzi nic nowego: żaden framework UI, żadna biblioteka
  komponentów, żaden serwis z fontami ani ikonami. Strona jest z Astro i Tailwinda.
- Strona musi działać z niezaładowanymi obrazkami i z wyłączonym JavaScriptem. Wszystko,
  co sprytne, jest dodatkiem na czymś, co już działa bez tego.

Jeśli design czegoś nie mówi, nie zgaduj. Zapisz pytanie do notes.md, wybierz odczyt, który
uważasz za najbardziej prawdopodobny, powiedz mi jedno i drugie, i jedź dalej. Wolę poprawić
jedno założenie niż odkryć sześć.
```

---

**Co powinieneś zobaczyć.** Jedną sekcję. Potem ciszę i pytanie. Przeładuj stronę
w przeglądarce. Porównaj z designem w Figmie. Potem powiedz `dalej` albo powiedz, co jest
nie tak — po ludzku, tak jak powiedziałbyś juniorowi:

> Odstęp pod nagłówkiem jest za ciasny, a pomarańczowy to nie ten pomarańczowy.

To jest całkowicie dobre zgłoszenie błędu. Nie potrzebujesz słownictwa.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Buduje całą stronę jednym ciągiem | `Stop. Zostaw to, co masz. Od teraz: jedna sekcja i czekasz na mnie.` |
| Tekst, którego nigdy nie widziałeś | `Skąd wzięło się to zdanie? Zastąp je tekstem z designu.` |
| Szare pudełko tam, gdzie powinno być zdjęcie | `Użyj tu obrazu z designu. Jest w design-data.` |
| Kolor, który jest prawie dobry | `To nie jest wartość z designu. Użyj dokładnej i powiedz mi, która to zmienna.` |
| Znowu zaczyna rozkodowywać .fig | `Stop. Wszystko, czego potrzebujesz, jest już w design-data i notes.md.` |
| Mówi, że skończył, a wyraźnie nie | `Które sekcje zbudowałeś, a których jeszcze nie ma? Wypisz jedne i drugie.` |
| Z każdą chwilą jest wolniejszy i mętniejszy | Kończy mu się kontekst. Powiedz `Zaktualizuj notes.md tym, gdzie jesteśmy`, zacznij nową sesję, powiedz `Przeczytaj notes.md i buduj dalej` i jedź dalej. |

---

### Dwie rzeczy warte zauważenia, kiedy pracuje

**Jest szybszy od ciebie, a to nie to samo co lepszy.** Sześć sekcji pojawi się w czasie,
w którym porządnie obejrzysz jedną. Pauza po każdej sekcji istnieje po to, żeby przeglądanie
nadążało za budowaniem. Korzystaj z niej.

**Nic tutaj jeszcze niczego nie sprawdziło.** Na koniec tego promptu strona może wyglądać na
skończoną. Do tej pory oceniła ją dokładnie jedna rzecz: twoje oczy, na twoim ekranie, przy
twojej szerokości okna. Prompt 04 jest tym, co to zmienia.
