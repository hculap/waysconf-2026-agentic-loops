# 05 — Pętla

W nowej sesji agent uruchamia checker z promptu 03 (`npm run check`), czyta plik z raportem,
który checker zapisuje, naprawia pierwszy błąd i uruchamia checker ponownie, aż zakończy się
kodem 0. Naprawia też problemy z twojego przeglądu w `notes.md`, które mają pokrycie w danych
designu. Każda runda ma trzy kroki: zaplanuj poprawkę, wprowadź ją, uruchom checker. Kiedy test
przejdzie, agent robi commit i push.

## Zanim wkleisz

Wpisz `/clear`. Żeby agent nie zatrzymywał się przed każdą zmianą pliku: w Claude Code naciskaj
`Shift+Tab`, aż w stopce pojawi się *accept edits on*. Akceptowanie zmian obejmuje tylko pliki:
kiedy agent pierwszy raz uruchamia nowy rodzaj komendy, na przykład `npm run check`,
`git commit` albo `git push`, Claude Code i tak pyta, więc wybierz **Yes, and don't ask again
for … commands**. W Codeksie wpisz `/permissions` i wybierz opcję, która pozwala edytować pliki
i uruchamiać komendy w tym folderze bez pytania; `git push` może i tak zapytać o dostęp do sieci.

---

```text
Przeczytaj notes.md. Potem uruchom npm run check.

Pozycje pod nagłówkiem „Design review" w notes.md to problemy, które znalazłem, oglądając
stronę. Te, które mają pokrycie w design/data, traktuj jak błędy z raportu i też je napraw. Przy
każdej, która nie ma pokrycia w design/data, zapisz do notes.md jedną linijkę, że go nie ma,
i zostaw ją.

Jeśli npm run check kończy się kodem 0 i nie została żadna pozycja z „Design review", która ma
pokrycie w design/data, zrób commit wszystkiego z opisem, że test przechodzi, zrób push
i powiedz mi, że skończyliśmy.

W przeciwnym razie przeczytaj raport, który zapisał test, i napraw to, co wymienia. Potem
uruchom npm run check jeszcze raz. Powtarzaj, aż skończy się kodem 0, a pozycje z „Design
review" będą załatwione.

Każda runda ma trzy kroki. Plan: weź pierwszy błąd z raportu i zapisz do notes.md jedną
linijkę: co nie przechodzi, co według ciebie jest przyczyną i co zmienisz. Implementacja:
wprowadź tę zmianę. Weryfikacja: uruchom npm run check.

Pracuj w kolejności, w jakiej raport wymienia rzeczy. Naprawiaj przyczynę, nie objaw:
jeśli kolor jest zły, użyj tego z designu, nie przesuwaj go, aż liczba drgnie. Rób
najmniejszą zmianę, która usuwa dany błąd, i nie ruszaj niczego, co już przechodziło.

Trzy reguły, a pierwsza znaczy więcej niż dwie pozostałe:

1. NIGDY nie zmieniaj checkera, żeby test przeszedł. Ani progu, ani pominiętej asercji,
   ani wyłączonej reguły. Jeśli naprawdę uważasz, że jakiś test jest zły, ZATRZYMAJ SIĘ,
   powiedz mi który i dlaczego, i nie zmieniaj niczego.
2. Nie dodawaj niczego, czego nie ma w designie, i nie wymyślaj tekstów.
3. Jeśli ten sam błąd przeżyje trzy próby, zatrzymaj się i powiedz mi, co próbowałeś za
   każdym razem i co się stało. Trzy nieudane naprawy zwykle znaczą, że design prosi
   o dwie rzeczy, które nie mogą być jednocześnie prawdziwe, i czwarta próba tego nie
   rozwiąże.

Zapisuj do notes.md na bieżąco, co próbowałeś i co się stało, żeby nowa sesja mogła to
podjąć. Pracuj dalej sam. Nie proś mnie o potwierdzenie po każdej rundzie.
```

---

## `/goal`

Najpierw wklej prompt powyżej, potem tę linijkę:

```text
/goal npm run check exits 0
```

W Claude Code `/goal` ustawia warunek. Po każdej turze osobny model sprawdza, czy warunek jest
spełniony, a Claude pracuje dalej, dopóki nie jest. Agent musi więc uruchomić `npm run check`
i pokazać kod wyjścia w rozmowie. Codex też ma `/goal`: ta sama linijka go ustawia, a
`/goal clear` usuwa. Bez `/goal` pętlę podtrzymuje sam prompt; jeśli agent zatrzyma się za
wcześnie, powiedz `Jedź dalej.`

---

**Oczekiwany wynik.** Kilka rund: zaplanuj, napraw, sprawdź. Liczba błędów spada, może wzrosnąć
o jeden, kiedy naprawa zepsuje coś innego, i znowu spada. W `notes.md` przybywa jedna linijka
na rundę. Kiedy `npm run check` zwróci kod 0, agent robi commit i push.

**Po tym prompcie wpisz `/clear`.**

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| **Zedytował checker** | `Przywróć checker dokładnie tak, jak był, i napraw stronę zamiast niego.` Potem zobacz, co zmienił w checkerze. |
| Chcesz wcześniej zatrzymać `/goal` | Wpisz `/goal clear`. |
| Pyta przed każdą zmianą pliku | Claude Code: `Shift+Tab`, aż w stopce pojawi się *accept edits on*. Codex: `/permissions`. |
| Pyta, zanim uruchomi komendę | Wybierz **Yes, and don't ask again for … commands**. |
| Przestaje po jednej rundzie | `Jedź dalej. Nie zatrzymuj się, dopóki npm run check nie skończy się kodem 0.` Albo użyj `/goal`. |
| Ten sam błąd wraca w kółko | `Próbowałeś tego trzy razy. Stop. Powiedz mi, co próbowałeś i co się stało za każdym razem.` |
| Mówi, że skończone, a test jest czerwony | `Uruchom npm run check i wklej pięć ostatnich linijek, bez poprawiania.` |
| Jest coraz wolniejszy i mniej konkretny | Kontekst jest pełny. Powiedz `Zapisz do notes.md, co zostało, w dziesięciu linijkach`, wpisz `/clear`, potem wklej ten prompt jeszcze raz. |
| Jest 16:16, a test dalej nie przechodzi | Naciśnij Esc (i wpisz `/goal clear`, jeśli użyłeś `/goal`), potem powiedz `Stop. Zapisz do notes.md, gdzie jesteś, zrób commit i push.` Potem `/clear` i prompt 06. |

---

### Dlaczego jest tak napisany

- Agent nigdy nie edytuje checkera. Gdyby mógł, zaliczenie nic by nie znaczyło.
- Jedna linijka na rundę w `notes.md` i raport na dysku: nowa sesja kontynuuje z plików.
- Trzy nieudane próby przy jednym błędzie to sygnał stop: zwykle dwa wymagania, które nie mogą być jednocześnie spełnione.
