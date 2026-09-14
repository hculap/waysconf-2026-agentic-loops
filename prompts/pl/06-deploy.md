# 06 — Opublikuj

Adres, który możesz komuś wysłać. To jest ten moment, w którym całe popołudnie robi się
prawdziwe.

---

```text
Wystaw to do internetu.

Zbuduj stronę, a potem opublikuj ją na Netlify. Użyj npx, żeby nie było czego instalować;
jeśli nie jestem zalogowany, powiedz mi, w co kliknąć, zamiast robić to po cichu.

Kiedy będzie na żywo, nie mów mi po prostu, że się udało. Sprawdź:

- pobierz publiczny adres i potwierdź, że zwraca 200
- potwierdź, że strona, którą serwuje, jest tą, którą przed chwilą zbudowałeś, a nie
  starszą — porównaj to, co wraca, z tym, co jest w folderze build
- uruchom npm run check -- --url na adresie na żywo i pokaż mi wynik

Potem podaj mi adres w osobnej linijce, żebym mógł go skopiować.
```

---

**Co powinieneś zobaczyć.** Okno przeglądarki z prośbą o autoryzację Netlify — zrób to —
potem pytanie, jaką stronę utworzyć. Następnie linijkę w rodzaju:

```
https://cos-tam-123456.netlify.app
```

Otwórz ją na telefonie. To jest cały sens ćwiczenia: ta rzecz istnieje, w internecie, i
możesz ją komuś podać.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Prosi o zalogowanie i nic się nie otwiera | Wypisał adres. Wklej go do przeglądarki ręcznie. |
| Pusta strona pod adresem na żywo | `Strona na żywo jest pusta. Sprawdź, co opublikowałeś — który folder wysłałeś?` |
| Brak CSS, tekst bez stylów | Zwykle poszedł nie ten folder. `Opublikuj folder build, nie katalog główny projektu.` |
| „Deploy się udał" i żadnego adresu | `Podaj mi publiczny adres w osobnej linijce.` |
| Test na żywo się wywala, a lokalny przechodził | `Pokaż mi dokładnie, które testy różnią się między lokalnym a na żywo, i dlaczego. Nie zmieniaj checkera.` |
| Mówi, że checker nie przyjmuje adresu | `Prompt 04 prosił o --url. Dodaj to, nie zmieniając tego, co rozstrzyga którykolwiek test, i uruchom na adresie na żywo.` |

---

### Ten jeden test i dlaczego to nie jest czepianie się

„Potwierdź, że strona, którą serwuje, jest tą, którą przed chwilą zbudowałeś."

Wszystko do tej pory dowodziło czegoś o pliku na twoim laptopie. Między tym plikiem
a odwiedzającym jest build, upload, CDN i cache — i każde z nich potrafiło już serwować coś
innego, niż wysłałeś. Zielone testy lokalnie nie mówią nic o tym, co jest na żywo.

Kiedy powstawał ten warsztat, ten test wywalił się dwa razy z powodu, którego nikt by nie
zgadł: host po cichu dokłada własne tagi do każdej serwowanej strony, więc bajty nigdy nie
będą identyczne. Uczciwym testem okazało się „body jest identyczne, a wszystko, co włożyłem
do head, nadal tam jest" — co jest innym zdaniem niż to zapisane pierwotnie i jest to zdanie
prawdziwe.

Pytanie „czy to, co opublikowałem, jest tym, co sprawdziłem?" zajmuje dziesięć sekund i jest
ostatnim miejscem, w którym całe popołudnie poprawności może po cichu wyparować.
