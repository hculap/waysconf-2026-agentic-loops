# 05 — Pętla

Agent uruchamia checker napisany w prompcie 04 (`npm run check`), czyta plik z raportem, który
checker zapisuje, naprawia pierwszy błąd i uruchamia checker ponownie, aż zakończy się kodem 0.
Każda runda ma trzy kroki: zaplanuj poprawkę, wprowadź ją, uruchom checker.

---

```text
Uruchom npm run check.

Jeśli kończy się kodem 0, zatrzymaj się i powiedz mi — skończyliśmy.

Jeśli nie, przeczytaj raport, który zapisał, i napraw to, co wymienia. Potem uruchom
npm run check jeszcze raz. Powtarzaj, aż skończy się kodem 0.

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
2. Nie dodawaj niczego nowego do strony i nie wymyślaj tekstów.
3. Jeśli ten sam błąd przeżyje trzy próby, zatrzymaj się i powiedz mi, co próbowałeś za
   każdym razem i co się stało. Trzy nieudane naprawy zwykle znaczą, że design prosi
   o dwie rzeczy, które nie mogą być jednocześnie prawdziwe, i czwarta próba tego nie
   rozwiąże.

Zapisuj do notes.md na bieżąco, co próbowałeś i co się stało, żeby nowa sesja mogła to
podjąć. Pracuj dalej sam. Nie proś mnie o potwierdzenie po każdej rundzie.
```

---

## Claude Code: `/goal`

Najpierw wklej prompt powyżej, potem tę linijkę:

```text
/goal npm run check exits 0
```

Sesja nie skończy się, dopóki komenda nie zakończy się kodem 0: komenda się uruchamia,
a decyduje jej kod wyjścia. **Codex nie ma `/goal`.** Tam mechanizmem jest sam prompt; jeśli
agent zatrzyma się za wcześnie, powiedz `jedź dalej`.

---

**Oczekiwany wynik.** Kilka rund: sprawdź, napraw, sprawdź. Liczba błędów spada, może wzrosnąć
o jeden, kiedy naprawa zepsuje coś innego, i znowu spada. W `notes.md` przybywa jedna linijka
na rundę. Przebieg kończy się, gdy `npm run check` zwróci kod 0.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| **Zedytował checker** | `Przywróć checker dokładnie tak, jak był, i napraw stronę zamiast niego.` Potem zobacz, co zmienił w checkerze. |
| Przestaje po jednej rundzie | `Jedź dalej. Nie zatrzymuj się, dopóki npm run check nie skończy się kodem 0.` Albo użyj `/goal`. |
| Ten sam błąd wraca w kółko | `Próbowałeś tego trzy razy. Stop. Powiedz mi, co próbowałeś i co się stało za każdym razem.` |
| Mówi, że skończone, a test jest czerwony | `Uruchom npm run check i wklej pięć ostatnich linijek, bez poprawiania.` |
| Jest coraz wolniejszy i mniej konkretny | Kontekst jest pełny. `Zapisz do notes.md, co zostało, w dziesięciu linijkach`, zacznij nową sesję, wklej notatki, jedź dalej. |

---

### Dlaczego jest tak napisany

- Agent nigdy nie edytuje checkera. Gdyby mógł, zaliczenie nic by nie znaczyło.
- Jedna linijka na rundę w `notes.md` i raport na dysku: nowa sesja kontynuuje z plików.
- Trzy nieudane próby przy jednym błędzie to sygnał stop: zwykle dwa wymagania, które nie mogą być jednocześnie spełnione.
