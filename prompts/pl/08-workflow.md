# 08 — Ta sama robota, jako workflow

Przeszedłeś właśnie siedem promptów ręcznie. To ty byłeś tym, co między nimi: czytałeś
output, decydowałeś, że jest wystarczająco dobrze, wklejałeś następny.

Tę rolę da się opisać. **Fazy, co się dzieje w każdej i co musi być prawdą, zanim zacznie
się następna** — zapisz to, a agent przejdzie sekwencję sam.

Żadnego skryptu. Żadnego narzędzia. To jest wiadomość.

---

```text
ultracode. Chcę, żebyś wykonał całą robotę, w fazach, które definiuję. Przejdź je po
kolei, samodzielnie, i nie przeskakuj do przodu.

Użyj dynamicznego workflow: wewnątrz fazy powołuj tyle subagentów, ile wymaga robota, i
uruchamiaj je równolegle, decydując o liczbie na podstawie tego, co zastaniesz, a nie
liczby, którą ci podałem. Jeden na sekcję, jeden na soczewkę review, jeden na znalezisko —
czego akurat wymaga faza. Scal ich wyniki, zanim z niej wyjdziesz.

FAZA 1 — POPATRZ
Przeczytaj design. Zapisz, co znalazłeś, do notes.md: każdą sekcję w kolejności, każdy
kolor po nazwie, każdy rozmiar tekstu i listę wszystkiego, czego design nie mówi.
Nie pisz w tej fazie żadnego kodu.
Zanim pójdziesz dalej: pokaż mi notes.md i poczekaj, aż powiem „jedziemy".

FAZA 2 — BUDUJ
Zbuduj stronę sekcja po sekcji, w kolejności z notes.md. Jeden subagent na sekcję,
równolegle. Kolory, rozmiary i słowa wyłącznie z designu — nie wymyślaj niczego.
Zanim pójdziesz dalej: projekt buduje się bez błędów.

FAZA 3 — UZBRÓJ
Napisz program, który otwiera prawdziwą stronę w prawdziwej przeglądarce i kończy się
kodem 0 albo różnym od zera, sprawdzając wszystko, co definiuje design: sekcje i ich
kolejność, dostępność przy każdej szerokości, którą design określa, to, że każdy
namalowany kolor jest kolorem z designu, że każdy fragment tekstu jest obecny i że nic nie
wystaje w bok przy najwęższej szerokości. Podepnij to pod „npm run check". Zainstaluj, co
potrzebne, żeby sterować przeglądarką.
Test, który nie może się wykonać, jest porażką, nigdy pominięciem.
Zanim pójdziesz dalej: npm run check uruchamia się i coś raportuje. Będzie czerwono. Dobrze.

FAZA 4 — NAPRAWIAJ
Pętla: uruchom npm run check, przeczytaj raport, napraw to, co wymienia, uruchom jeszcze
raz. Powtarzaj, aż skończy się kodem 0.
NIGDY nie edytuj checkera, żeby test przeszedł. Jeśli uważasz, że jakiś test jest zły,
zatrzymaj się i powiedz mi który i dlaczego.
Zanim pójdziesz dalej: npm run check kończy się kodem 0.

FAZA 5 — WYSTAW
Zbuduj i opublikuj. Potem pobierz adres na żywo i udowodnij, że strona, którą serwuje,
jest tą, która przeszła fazę 4.
Zanim pójdziesz dalej: adres na żywo zwraca 200 i serwuje to, co zbudowałeś.

FAZA 6 — ATAKUJ
Powołaj kilku subagentów z różnymi soczewkami — design, dostępność, teksty i cokolwiek
jeszcze uznasz za warte przejścia — i każ każdemu szukać tego, czego checker strukturalnie
nie widzi. Potem wyślij każde kandydujące znalezisko do osobnego subagenta, którego
jedynym zadaniem jest argumentować, że jest błędne. Zgłoś tylko te, które przeżyją ten
spór, i powiedz mi, ile odrzuciłeś.
Nie naprawiaj niczego. Daj mi listę.

Reguły na cały przebieg:
- Ogłaszaj każdą fazę, kiedy w nią wchodzisz, i mów, ilu subagentów używasz i dlaczego.
- Jeśli faza nie może się skończyć, zatrzymaj się na niej i powiedz dlaczego. Nie idź
  dalej z poprzednią zepsutą.
- Utrzymuj notes.md na bieżąco. Jeśli skończy ci się miejsce i będziemy musieli zacząć od
  nowa, notes.md jest wszystkim, co będzie miała następna sesja.
```

---

**Co powinieneś zobaczyć.** `FAZA 1 — POPATRZ`, a potem pracę, bez nadzoru, przez długi
czas. Zatrzyma się w dwóch miejscach, w których mu kazałeś, i nigdzie indziej.

---

## Dwa słowa z góry

**`ultracode`** to słowo kluczowe, które rozpoznaje Claude Code: sygnalizuje, że zlecenie
jest duże i strukturalne, i to ono odblokowuje orkiestrację wieloagentową na czas przebiegu.
**Codex nie ma odpowiednika** — żadnego słowa, żadnej flagi. Zostaw je mimo to. W Codeksie
jest to jeden nieszkodliwy token na początku długiej instrukcji, a prawdziwą robotę na obu
narzędziach robi zdanie po nim:

> powołuj tyle subagentów, ile wymaga robota, i uruchamiaj je równolegle, decydując
> o liczbie na podstawie tego, co zastaniesz

To jest instrukcja. Słowo kluczowe to skrót w jednym narzędziu, nie mechanizm.

**Po co w ogóle się rozgałęziać.** Sześć sekcji budowanych jedna po drugiej to sześć razy
tyle czasu, co sześć budowanych naraz — a sekcje nie zależą od siebie. To samo dotyczy
soczewek review: przebieg szukający problemów z dostępnością i przebieg szukający dryfu
w tekstach nie mają ze sobą nic wspólnego, a puszczenie ich w jednym kontekście sprawia, że
każdy niesie szum drugiego.

**Gdzie to naprawdę zarabia, to faza 6.** Pojedynczy agent zapytany „czy ta strona jest
dobra?" powie, że tak. Kilku agentów z różnymi soczewkami produkuje kandydatów, a osobny
agent, którego jedyną robotą jest *obalić* każdego kandydata, usuwa tych, którzy tego nie
przeżyją. Znajdź, potem zaatakuj, potem zatrzymaj resztę. To inny kształt niż zapytanie raz
i uwierzenie w odpowiedź, i jest to jedyne miejsce w tym zestawie, gdzie model sprawdza
model.

**Jest to też najmniej niezawodna część przebiegu.** Więcej agentów to pewniejszy output,
nie poprawniejszy. Decyduje deterministyczny checker z fazy 3; faza 6 otwiera pozycje do
oceny przez człowieka.

---

## Pętla i workflow to różne rzeczy

Ludzie używają tych słów zamiennie. To nie jest ten sam kształt, a wiedza, którego
potrzebujesz, to większość umiejętności.

| Aspekt | **Pętla** | **Workflow** |
|---|---|---|
| Kształt | Rób to znowu, aż warunek będzie spełniony | Zrób te rzeczy, w tej kolejności, z poprzeczką między każdą |
| Ty definiujesz | **warunek wyjścia** | **fazy** |
| Kończy się, gdy | program mówi „tak" | ostatnia faza się skończy |
| Dobre do | zbiegania do poprawności | pracy z etapami, które od siebie zależą |
| W tym zestawie | prompt 05 | ten prompt |

Faza 4 powyżej jest pętlą mieszkającą w workflow. To zwykły układ: workflow doprowadza cię
od zera do prawie-dobrze, a pętla w jednej fazie domyka resztę.

---

## Sparametryzuj to

Lista faz jest programem. Zmień ją i zmieniłeś robotę, nie pisząc ani linijki:

> Faza 2 buduje tylko hero i lineup. Resztę zostaw.

> Między fazą 2 a 3 dodaj fazę: pokaż mi każdą sekcję jako zrzut ekranu przy najwęższej
> szerokości i poczekaj na moją zgodę.

> Pomiń fazę 5. Dziś nie publikuję.

> W fazie 6 użyj sześciu soczewek zamiast trzech i patrz tylko na szerokości, których
> design nie określa.

To właśnie znaczy w praktyce „nie trzeba skryptu". Skrypt trzeba by zedytować, przetestować
i puścić ponownie. To edytuje się w zdaniu, które i tak zamierzałeś powiedzieć.

---

## Kiedy po to sięgać, a kiedy nie

**Sięgnij po workflow**, kiedy znasz kształt roboty i chcesz odejść od komputera: jest
długa, etapy są prawdziwe, a wolisz wrócić do wyniku niż go niańczyć.

**Sięgnij po siedem promptów**, kiedy się uczysz, kiedy chcesz sterować albo kiedy design
jest niejasny i spodziewasz się, że w połowie zmienisz zdanie. Każde zatrzymanie to szansa,
żeby się nie zgodzić, a niezgadzanie się wcześnie jest tańsze niż wszystko inne w tej sesji.

Pierwszy raz rób robotę ręcznie. Za drugim razem już wiesz, jakie są fazy.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Ogłasza fazę 3 bez zrobienia fazy 2 | `Pominąłeś fazę 2. Wróć i skończ ją przed fazą 3.` |
| Przelatuje przez „poczekaj na mnie" | `Faza 1 mówiła: czekaj. Zatrzymaj się i pokaż mi notes.md.` |
| Robi się mętny koło fazy 4 | `Streść stan do notes.md.` Potem zacznij nową sesję, wklej notes.md i powiedz `Kontynuuj od fazy 4.` |
| Ogłasza, że całość skończona | `Uruchom npm run check i wklej pięć ostatnich linijek, bez poprawiania.` |
| Faza się wywala, a on idzie dalej | `Miałeś zatrzymać się na nieudanej fazie. Co się wywaliło i dlaczego kontynuowałeś?` |
| Robi wszystko po kolei, jedno po drugim | `Faza 2 to sześć niezależnych sekcji. Puść je równolegle, po jednym subagencie na każdą.` |
| Faza 6 zgłasza pięć znalezisk i wszystkie pięć jest prawdziwych | Dobrze, i podejrzanie. `Ilu kandydatów odrzuciłeś i dlaczego?` Runda obalania, która nie obaliła niczego, się nie odbyła. |
| Powołuje dwudziestu subagentów do małej strony | `Używaj tylu, ilu wymaga robota. Podaj mi liczbę i uzasadnienie, zanim zaczniesz.` |
