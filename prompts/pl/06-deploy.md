# 06 — Opublikuj

W nowej sesji agent buduje stronę, zakłada stronę na Netlify i publikuje ją bez pytań
w terminalu, sprawdza adres na żywo tym samym checkerem, a potem robi commit i push
wszystkiego, co się zmieniło.

## Zanim wkleisz

Wpisz `/clear`, jeśli jeszcze tego nie zrobiłeś.

---

```text
Wystaw to do internetu.

Zbuduj stronę, a potem opublikuj ją na Netlify przez Netlify CLI. Netlify CLI jest
zainstalowane i jestem zalogowany; jeśli powie, że nie jestem, powiedz mi, co zrobić, zamiast
robić to po cichu.

Ten projekt nie ma jeszcze strony na Netlify. Załóż ją i opublikuj jedną komendą, bez pytań
w terminalu: netlify deploy --prod --dir=dist --site-name turbine-<moja nazwa na GitHubie>.
Moją nazwę sprawdzisz przez gh api user --jq .login. Jeśli ta nazwa jest zajęta, dodaj krótki
dopisek i uruchom jeszcze raz.

Kiedy będzie na żywo, nie mów mi po prostu, że się udało. Sprawdź:

- pobierz publiczny adres i potwierdź, że zwraca 200
- potwierdź, że strona, którą serwuje, jest tą, którą przed chwilą zbudowałeś, a nie
  starszą — porównaj to, co wraca, z tym, co jest w folderze dist
- uruchom npm run check -- --url na adresie na żywo i pokaż mi wynik

Zapisz nazwę strony na Netlify i adres na żywo do notes.md. Potem zrób commit wszystkiego, co
się zmieniło, z opisem, co zrobił ten krok, i zrób push.

Potem podaj mi adres w osobnej linijce, żebym mógł go skopiować.
```

---

**Oczekiwany wynik.** Netlify CLI o nic nie pyta: `--site-name` zakłada stronę i od razu na nią
publikuje. Adres wygląda jak `https://turbine-twojanazwa.netlify.app`. Agent podaje potem wynik
trzech sprawdzeń: adres zwraca 200, serwowana strona zgadza się z `dist`, a
`npm run check -- --url` przechodzi na adresie na żywo. Zapisuje nazwę strony do `notes.md`,
robi commit i push wszystkiego, co się zmieniło, na przykład ustawień Netlify, które utworzył.
Adres jest na końcu, w osobnej linijce.

**Po tym prompcie wpisz `/clear`.**

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Mówi, że nie jesteś zalogowany | Uruchom `netlify login` w nowym oknie terminala (w dowolnym folderze), jak na stronie Przygotowanie, potem powiedz `Jestem już zalogowany.` |
| Codex pyta o dostęp do sieci | Odpowiedz tak. Publikacja i pobranie adresu na żywo go wymagają. |
| Netlify CLI zadaje pytanie i czeka | Naciśnij Esc, potem powiedz `Stop, przerwij tę komendę. Opublikuj z --site-name, żeby o nic nie pytała.` |
| Nazwa strony jest zajęta | `Dodaj krótki dopisek do nazwy strony i opublikuj jeszcze raz.` |
| CLI ciągle zawodzi | Powiedz `Otwórz mi folder tego projektu.` Przeciągnij folder `dist` na https://app.netlify.com/drop i przejmij stronę, kiedy Netlify to zaproponuje. Potem powiedz `Połącz ten folder z moją stroną na Netlify <nazwa> przez netlify link --name <nazwa>, zapisz nazwę strony do notes.md i uruchom npm run check -- --url na jej adresie.` |
| Pusta strona pod adresem na żywo | `Strona na żywo jest pusta. Który folder opublikowałeś?` |
| Strona na żywo bez stylów | `Opublikuj folder dist, nie katalog główny projektu.` |
| „Deploy się udał" i żadnego adresu | `Podaj mi publiczny adres w osobnej linijce.` |
| Test na żywo nie przechodzi, a lokalny przechodził | `Pokaż mi dokładnie, które testy różnią się między lokalnym a na żywo, i dlaczego. Nie zmieniaj checkera.` |
| Mówi, że checker nie przyjmuje adresu | `Prompt 03 prosił o --url. Dodaj to, nie zmieniając tego, co rozstrzyga którykolwiek test, i uruchom na adresie na żywo.` |

---

### Dlaczego jest tak napisany

- `--site-name` zakłada stronę w tej samej komendzie: agent nie odpowie na pytanie zadane w terminalu, a komenda, która czeka, czeka bez końca.
- Udany deploy nic nie mówi o tym, co jest serwowane. Agent porównuje stronę na żywo z `dist`, treść, a nie bajty, bo Netlify dokłada własne tagi do serwowanego HTML.
- Nazwa strony trafia do `notes.md`: prompt 07 publikuje jeszcze raz na tę samą stronę po `/clear`.
