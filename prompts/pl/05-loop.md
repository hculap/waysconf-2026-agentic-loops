# 05 — Pętla

Masz stronę i masz coś, co potrafi jej powiedzieć „nie". To jest zdanie, które ustawia je
w kółko.

Nie ma tu skryptu i nie ma czego instalować. Pętla to akapit.

---

```text
Uruchom npm run check.

Jeśli kończy się kodem 0, zatrzymaj się i powiedz mi — skończyliśmy.

Jeśli nie, przeczytaj raport, który zapisał, i napraw to, co wymienia. Potem uruchom
npm run check jeszcze raz. Powtarzaj, aż skończy się kodem 0.

Pracuj w kolejności, w jakiej raport wymienia rzeczy. Naprawiaj przyczynę, nie objaw:
jeśli kolor jest zły, użyj tego z designu, nie przesuwaj go, aż liczba drgnie. Rób
najmniejszą zmianę, która usuwa dany błąd, i nie ruszaj niczego, co już przechodziło.

Trzy reguły, a pierwsza znaczy więcej niż dwie pozostałe:

1. NIGDY nie zmieniaj checkera, żeby test przeszedł. Ani progu, ani pominiętej asercji,
   ani wyłączonej reguły. Jeśli naprawdę uważasz, że jakiś test jest zły, ZATRZYMAJ SIĘ,
   powiedz mi który i dlaczego, i nie zmieniaj niczego.
2. Nie dodawaj paczek i nie wymyślaj tekstów.
3. Jeśli ten sam błąd przeżyje trzy próby, zatrzymaj się i powiedz mi, co próbowałeś za
   każdym razem i co się stało. Trzy nieudane naprawy zwykle znaczą, że design prosi
   o dwie rzeczy, które nie mogą być jednocześnie prawdziwe, i czwarta próba tego nie
   rozwiąże.

Pracuj dalej sam. Nie proś mnie o potwierdzenie po każdej rundzie.
```

---

## Claude Code: zrób z tego strukturę

Claude Code ma to wbudowane. Zamiast ufać, że agent nie przestanie, możesz sprawić, żeby
strukturalnie nie mógł:

```text
/goal npm run check exits 0
```

Sesja się nie skończy, dopóki to nie będzie prawdą. Nie „dopóki agent nie uwierzy, że jest
prawdą" — komenda faktycznie się uruchamia, a decyduje jej kod wyjścia. Wklej najpierw
prompt powyżej, potem linijkę z `/goal`.

**Codex tego nie ma.** Tam mechanizmem jest akapit: działa, tylko opiera się na tym, że
agent robi, co mu powiedziano, a nie na tym, że wymusza to narzędzie. Patrz na output i
powiedz `jedź dalej`, jeśli zatrzyma się za wcześnie.

---

**Co powinieneś zobaczyć.** Kilka minut: sprawdź → napraw → sprawdź. Liczba błędów spada.
Gdzieś w środku prawdopodobnie *wzrośnie* o jeden — naprawa, która zepsuła coś innego — i
znowu zacznie spadać.

Potem:

```
✓ all checks passed
```

Nikt tego nie zdecydował. Program zakończył się kodem 0.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| **Zedytował checkera** | `Przywróć checkera dokładnie tak, jak był, i napraw stronę zamiast niego.` Potem zobacz, co zmienił — to najbardziej pouczająca rzecz, jaka spotka cię tego dnia. |
| Przestaje po jednej rundzie | `Jedź dalej. Nie zatrzymuj się, dopóki npm run check nie skończy się kodem 0.` Albo użyj `/goal`. |
| Ten sam błąd wraca w kółko | `Próbowałeś tego trzy razy. Stop. Powiedz mi, co próbowałeś i co się stało za każdym razem.` |
| Mówi, że skończone, a test jest czerwony | `Uruchom npm run check i wklej pięć ostatnich linijek, bez poprawiania.` |
| Robi się wolniejszy i mętniejszy | Kontekst się zapełnia. `Zapisz do notes.md, co zostało, w dziesięciu linijkach`, zacznij nową sesję, wklej notatki, jedź dalej. |

---

### Dwie rzeczy do zabrania

**Świeże bije długie.** Jeśli musisz zrestartować sesję, nie tracisz nic, dopóki stan jest
w plikach — raport i twoje notatki. Agent z krótką pamięcią i dobrymi notatkami wygrywa
z agentem z długą rozmową i bez notatek. Dlatego checker zapisuje raport na dysk, a nie
tylko wypisuje go na ekran.

**Ta reguła to architektura.** „Nigdy nie zmieniaj checkera" brzmi jak dyscyplina. Jest
architekturą. W momencie, w którym sądzony może edytować sędziego, każdy kolejny zielony
wynik nic nie znaczy — i nadal będzie wyglądał dokładnie tak samo uspokajająco.
