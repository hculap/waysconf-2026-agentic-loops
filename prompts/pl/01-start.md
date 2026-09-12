# 01 — Zacznij od pustego folderu

Nie masz nic i tak ma być. Za chwilę agent zbuduje sobie projekt sam.

Otwórz terminal, zrób folder i uruchom w nim swojego agenta:

```text
mkdir turbine && cd turbine
claude
```

albo, jeśli masz ChatGPT Plus:

```text
mkdir turbine && cd turbine
codex
```

---

```text
Jestem projektantem, nie programistą. Tłumacz mi każdą komendę, którą uruchamiasz,
jednym zdaniem, zanim ją uruchomisz.

Ten folder jest pusty. Załóż w nim projekt statycznej strony: Astro z Tailwindem,
TypeScript, bez frameworka do UI. Zainstaluj zależności i uruchom serwer deweloperski.

Kiedy skończysz, powiedz mi dokładnie dwie rzeczy:
1. pod jakim adresem mam otworzyć stronę w przeglądarce
2. które pliki mam otwierać, a których nie ruszać

Nie buduj jeszcze żadnej strony. Chcę zobaczyć, że coś działa.
```

---

**Co powinieneś zobaczyć.** Kilka minut instalowania, potem adres w rodzaju
`http://localhost:4321`. Otwórz go. Zobaczysz pustą stronę startową Astro i to jest
poprawny wynik.

---

### Jeśli coś pójdzie nie tak

| Co widzisz | Powiedz to |
|---|---|
| `Not inside a trusted directory` | To Codex pyta o zgodę. Odpowiedz „tak", albo wcześniej uruchom w folderze `git init`. |
| Wisi kilka minut na „installing" | Nie wisi. `npm install` ściąga kilkaset plików i przy słabym wifi potrafi to trwać. Prompt wróci. |
| `command not found: claude` | Agent nie jest zainstalowany. Wróć na zakładkę **Przed** i przejdź self-test. |
| Nie ma adresu | `Nie widzę adresu. Uruchom serwer deweloperski i podaj mi URL.` |
| Zbudował od razu całą stronę | `Miałem tylko pusty projekt. Cofnij wszystko, co dodałeś poza szkieletem.` |

---

### Dlaczego zaczynamy od pustego folderu

Bo tak wygląda poniedziałek. Nikt nie da ci przygotowanego repozytorium z działającymi
bramkami — dostaniesz folder i problem.

Wszystko, co powstanie w ciągu najbliższej godziny, zbuduje agent: projekt, stronę i
program, który tę stronę ocenia. Nie ma tu niczego, co ktoś przygotował wcześniej, żeby
demo wyszło ładnie.
