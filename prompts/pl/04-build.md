# 04 — Zbuduj to

Agent planuje stronę, buduje ją całą z `design/data` w jednym przebiegu, potem raz uruchamia
checker z promptu 03 i pokazuje, co jeszcze nie przechodzi. Potem ty przeglądasz stronę, a agent
zapisuje twój przegląd do `notes.md`, zanim zrobi commit.

## Zanim wkleisz

Przełącz agenta w plan mode, tak jak przed promptami 02 i 03. Claude Code: `Shift+Tab`, aż
w stopce pojawi się *plan mode on*. Codex: `/plan`.

Żeby agent nie pytał przed każdą zmianą pliku: w Claude Code przy zatwierdzaniu planu wybierz
**Yes, auto-accept edits**; stopka pokaże wtedy *accept edits on*. Akceptowanie zmian obejmuje
tylko pliki. Kiedy agent pierwszy raz uruchamia nowy rodzaj komendy, na przykład
`npm run check`, `git commit` albo `git push`, Claude Code i tak pyta: wybierz **Yes, and don't
ask again for … commands**. W Codeksie wpisz `/permissions` i wybierz opcję, która pozwala
edytować pliki i uruchamiać komendy w tym folderze bez pytania; `git push` może i tak zapytać
o dostęp do sieci.

---

```text
Najpierw plan. Zbadaj, czego potrzebujesz, potem pokaż mi plan i poczekaj na moją zgodę. Nie
twórz ani nie zmieniaj żadnego pliku, dopóki go nie zatwierdzę.

Zbuduj teraz stronę, na podstawie designu. Czytaj design/data i notes.md; nie rozkodowuj
pliku .fig jeszcze raz.

Twój plan ma wymienić sekcje w kolejności z design/data/sections.json i powiedzieć, jakich
kolorów, stylów tekstu, wartości layoutu, tekstów i obrazów używa każda z nich.

Zbuduj całą stronę za jednym razem: każdą sekcję z design/data/sections.json, w tej
kolejności. Nie zatrzymuj się między sekcjami, żeby mnie pytać. Kiedy skończysz, powiedz mi,
które sekcje zbudowałeś, po jednej linijce, i podaj adres do otwarcia.

Jeśli musisz zobaczyć stronę w przeglądarce, a serwer deweloperski nie działa, uruchom go sam
i podaj mi adres.

Reguły, wszystkie nienegocjowalne:

- Każdy kolor i każdy rozmiar pochodzi z design/data. Jeśli wartości, której potrzebujesz,
  tam nie ma, sprawdź, czy nie gubi jej skrypt uruchamiany przez npm run design; jeśli tak,
  popraw skrypt i uruchom go jeszcze raz. Jeśli design jej nie ma, nie wybieraj sam: to
  pytanie do notes.md, niżej.
- Każde słowo pochodzi z design/data/copy.json. Nie pisz tekstów. Nie poprawiaj tekstów.
  Jeśli jakiegoś fragmentu brakuje, zapisz to do notes.md; nie zapychaj dziury.
- Każde zdjęcie pochodzi z designu: użyj obrazów wymienionych w design/data/images.json,
  nigdy zastępczych.
- Do samej strony nie wchodzi nic nowego: żaden framework UI, żadna biblioteka
  komponentów, żaden serwis z fontami ani ikonami. Strona jest z Astro i Tailwinda.
- Strona musi działać z niezaładowanymi obrazkami i z wyłączonym JavaScriptem. Wszystko,
  co sprytne, jest dodatkiem na czymś, co już działa bez tego.

Jeśli design czegoś nie mówi, nie zgaduj. Zapisz pytanie do notes.md, wybierz odczyt, który
uważasz za najbardziej prawdopodobny, powiedz mi jedno i drugie, i jedź dalej. Wolę poprawić
jedno założenie niż odkryć sześć.

Kiedy strona będzie zbudowana, uruchom raz npm run check i pokaż mi, ile testów nie
przechodzi i które. Nie naprawiaj ich jeszcze i nie zmieniaj checkera.

Potem poczekaj, aż przejrzę stronę. Kiedy podam ci mój przegląd, zapisz go do notes.md pod
nagłówkiem „Design review" i jeszcze niczego nie naprawiaj. Potem zrób commit wszystkiego
z opisem, co zrobił ten krok, i zrób push. Powiedz mi, że krok jest skończony, żebym mógł
wyczyścić sesję.
```

---

**Oczekiwany wynik.** Najpierw plan: sekcje w kolejności i to, czego każda używa z
`design/data`. Zatwierdź go albo popraw. Potem kilka minut pracy, lista zbudowanych sekcji
i adres. Potem jedno uruchomienie `npm run check`: mniej błędów niż po prompcie 03, zwykle nie
zero. Potem agent czeka na twój przegląd.

Otwórz stronę obok designu w Figmie i przeglądaj ją sekcja po sekcji. Nie masz konta w Figmie
albo Figma prosi o zalogowanie? Porównaj z gotową stroną, do której link jest na stronie
głównej. Wpisz każdy problem zwykłymi słowami, na przykład `Odstęp pod nagłówkiem jest za
ciasny, a pomarańczowy to nie ten pomarańczowy.`, a po nich wklej tę linijkę:

```text
Zapisz te problemy do notes.md pod nagłówkiem „Design review". Jeszcze ich nie naprawiaj.
```

Agent zapisuje twój przegląd do `notes.md`, robi commit i push. Prompt 05 naprawia to, co mają
dane designu.

**Po tym prompcie wpisz `/clear`.**

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Pisze kod, zanim pokaże plan | Naciśnij Esc, potem powiedz `Stop. Najpierw pokaż mi plan i poczekaj na moją zgodę.` |
| Zatrzymuje się po jednej sekcji i pyta | `Nie czekaj na mnie. Zbuduj całą stronę, potem mi pokaż.` |
| Zaczyna naprawiać błędy | Naciśnij Esc, potem powiedz `Stop. Uruchom test raz i pokaż wynik. Naprawianie to następny krok.` |
| Zaczyna naprawiać twój przegląd | Naciśnij Esc, potem powiedz `Stop. Tylko zapisz mój przegląd do notes.md. Naprawianie to następny krok.` |
| Zmienia checker | `Przywróć checker dokładnie tak, jak był. Zmienia się strona, nie checker.` |
| Pyta, zanim uruchomi komendę | Wybierz **Yes, and don't ask again for … commands**. |
| Tekst, którego nigdy nie widziałeś | `Skąd wzięło się to zdanie? Zastąp je tekstem z design/data/copy.json.` |
| Szare pudełko tam, gdzie powinno być zdjęcie | `Użyj tu obrazu, który wymienia design/data/images.json.` |
| Kolor, który jest prawie dobry | `To nie jest wartość z design/data/colours.json. Użyj dokładnej i powiedz mi, jak się nazywa.` |
| Znowu zaczyna rozkodowywać .fig | Naciśnij Esc, potem powiedz `Stop. Wszystko, czego potrzebujesz, jest w design/data i notes.md.` |
| Mówi, że skończył, a wyraźnie nie | `Które sekcje zbudowałeś, a których jeszcze nie ma? Wypisz jedne i drugie.` |
| Jest coraz wolniejszy i mniej konkretny | Kontekst jest pełny. Powiedz `Zaktualizuj notes.md tym, gdzie jesteśmy`, wpisz `/clear`, potem powiedz `Przeczytaj design/data i notes.md i buduj dalej`. |
| Jest BUILD_END, a strona nie jest skończona | Naciśnij Esc, potem powiedz `Stop. Zrób commit tego, co masz, i push.` Potem `/clear` i prompt 05. |

---

### Dlaczego jest tak napisany

- Każda wartość pochodzi z `design/data`: wartość, którą agent wybierze sam, checker zgłosi jako błąd.
- Test uruchamia się raz i nic nie jest naprawiane: naprawianie to prompt 05, w nowej sesji, w pętli.
- Twój przegląd trafia do `notes.md` przed commitem: `/clear` czyści rozmowę, a prompt 05 czyta przegląd z pliku.
