# 06 — Opublikuj

Agent buduje stronę, publikuje ją na Netlify przez Netlify CLI i sprawdza adres na żywo.

---

```text
Wystaw to do internetu.

Zbuduj stronę, a potem opublikuj ją na Netlify przez Netlify w terminalu. Jest zainstalowane
i jestem zalogowany; jeśli powie, że nie jestem, powiedz mi, co zrobić, zamiast robić to po cichu.

Kiedy będzie na żywo, nie mów mi po prostu, że się udało. Sprawdź:

- pobierz publiczny adres i potwierdź, że zwraca 200
- potwierdź, że strona, którą serwuje, jest tą, którą przed chwilą zbudowałeś, a nie
  starszą — porównaj to, co wraca, z tym, co jest w folderze build
- uruchom npm run check -- --url na adresie na żywo i pokaż mi wynik

Potem podaj mi adres w osobnej linijce, żebym mógł go skopiować.
```

---

**Oczekiwany wynik.** Jeśli Netlify CLI zapyta, której strony użyć, wybierz utworzenie nowego
projektu. Wypisze adres w rodzaju `https://cos-tam-123456.netlify.app`. Agent podaje potem
wynik trzech sprawdzeń: adres zwraca 200, serwowana strona zgadza się z `dist`, a
`npm run check -- --url` przechodzi na adresie na żywo. Adres jest na końcu, w osobnej linijce.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| Mówi, że nie jesteś zalogowany | Uruchom `netlify login` w drugim terminalu, jak na stronie Przygotowanie, potem powiedz `Jestem już zalogowany.` |
| Pusta strona pod adresem na żywo | `Strona na żywo jest pusta. Który folder opublikowałeś?` |
| Strona na żywo bez stylów | `Opublikuj folder dist, nie katalog główny projektu.` |
| „Deploy się udał" i żadnego adresu | `Podaj mi publiczny adres w osobnej linijce.` |
| Test na żywo nie przechodzi, a lokalny przechodził | `Pokaż mi dokładnie, które testy różnią się między lokalnym a na żywo, i dlaczego. Nie zmieniaj checkera.` |
| Mówi, że checker nie przyjmuje adresu | `Prompt 04 prosił o --url. Dodaj to, nie zmieniając tego, co rozstrzyga którykolwiek test, i uruchom na adresie na żywo.` |

---

### Dlaczego jest tak napisany

- Udany deploy nic nie mówi o tym, co jest serwowane. Agent porównuje stronę na żywo z `dist`.
- Porównuje treść, nie bajty: Netlify dokłada własne tagi do serwowanego HTML.
- Checker działa na adresie na żywo, nie tylko na lokalnym serwerze.
