/**
 * Polska wersja wszystkich napisów interfejsu. Struktura jest identyczna z `ui.en.mjs` —
 * `scripts/build-guideline.mjs` buduje całą stronę raz na każdy język, a
 * `checks/guideline-i18n.mjs` sprawdza, czy oba pliki mają ten sam kształt.
 *
 * Tłumaczenie, nie kalka. Angielski oryginał jest napisany prostym, bezpośrednim językiem
 * i polska wersja też ma taka być — bez „prosimy o zapoznanie się", bez rzeczowników
 * odczasownikowych tam, gdzie wystarczy czasownik.
 *
 * Terminy techniczne zostają po angielsku, bo dokładnie w takiej formie uczestnik zobaczy
 * je na ekranie: terminal, prompt, commit, deploy, agent. Tłumaczenie ich na siłę
 * („zachęta", „wdrożenie") pomogłoby wyłącznie tłumaczowi.
 */

export default {
  lang: 'pl',
  base: 'pl',
  name: 'PL',
  other: { lang: 'en', name: 'EN', base: '' },
  switcherLabel: 'Język',

  meta: {
    hubTitle: 'Build an AI that checks and fixes its own work · WaysConf 2026',
    hubDesc:
      'Masterclass na WaysConf 2026: agent buduje stronę z pliku Figmy, pisze program, który ją sprawdza, i poprawia to, co ten program znajdzie.',
    beforeTitle: 'Zanim przyjdziesz · masterclass WaysConf 2026',
    beforeDesc:
      'Około trzydziestu minut w domu: cztery konta, narzędzia, logowanie, własne repozytorium i agent, który na końcu wszystko sprawdza.',
    duringTitle: 'Warsztat · masterclass WaysConf 2026',
    duringDesc:
      'Idee, diagramy i osiem promptów, które prowadzą od pustego folderu do zweryfikowanej strony w internecie.',
  },

  chrome: {
    skip: 'Przejdź do treści',
    home: 'WaysConf 2026 — wszystkie części warsztatu',
    tocTitle: 'Na tej stronie',
    footerSession:
      '<strong>Build an AI that checks and fixes its own work</strong> · WaysConf 2026 · 16 września, 14:55, ROOM-PM · Szymon Paluch',
    footerRepo: 'Wszystko zostaje online po konferencji. Repozytorium, jeśli chcesz:',
    footerFiction:
      'TURBINE to zmyślony festiwal stworzony jako materiał dydaktyczny. Nazwy artystów, zdjęcia i teksty są wymyślone. Podobieństwo do prawdziwego wydarzenia lub wykonawcy jest przypadkowe.',
  },

  copy: { button: 'Kopiuj', aria: 'Skopiuj komendę: ', done: 'Skopiowane' },

  hub: {
    kicker: 'WaysConf 2026 · masterclass',
    h1: 'Build an AI that checks and fixes its own work',
    lede: 'Dziewięćdziesiąt minut. Agent buduje stronę z pliku Figmy, pisze program, który ją sprawdza, i poprawia to, co ten program znajdzie — aż program powie „tak".',
    when: '16 września 2026 · 14:55 · ROOM-PM · Kraków',
    partsHeading: 'Warsztat w czterech częściach',
    partsIntro: 'Pierwsza część jest na teraz, do zrobienia w domu. Pozostałe trzy otworzą się w dniu warsztatu.',
    open: 'Otwórz',
    locked: 'Otwiera się 16 września',
    parts: [
      {
        key: 'before',
        n: '01',
        title: 'Przed warsztatem',
        body: 'Konta, narzędzia, logowanie i własne repozytorium — około trzydziestu minut. Na końcu agent sprawdza całość i mówi, czego jeszcze brakuje.',
      },
      {
        key: 'workshop',
        n: '02',
        title: 'Warsztat',
        body: 'Plik Figmy, idee, diagramy i osiem promptów, które wklejasz w trakcie sesji.',
      },
      {
        key: 'deck',
        n: '03',
        title: 'Prezentacja',
        body: 'Slajdy z sesji, żeby można było do nich wrócić.',
      },
      {
        key: 'site',
        n: '04',
        title: 'Co zbudujesz',
        body: 'Gotowa strona festiwalu — to, do czego zmierza twój agent.',
      },
    ],
  },

  accounts: [
    {
      n: '01',
      title: 'GitHub',
      body: 'Za darmo. Tam mieszka repozytorium twojego projektu, przez GitHuba logujesz się do Netlify jednym kliknięciem i to na nim działa wersja w przeglądarce, jeśli nic nie możesz zainstalować.',
      buttons: [{ href: 'https://github.com/signup', label: 'Załóż konto' }],
      meta: '2 min · potwierdź maila',
    },
    {
      n: '02',
      title: 'Jeden agent do kodu',
      pay: true,
      body: '<strong>Claude Pro</strong> albo <strong>ChatGPT Plus</strong> — jeden, nie oba. Są tu równorzędne: każdy prompt z tego warsztatu był pisany i uruchamiany na obu.',
      buttons: [
        { href: 'https://claude.ai/', label: 'Claude' },
        { href: 'https://chatgpt.com/', label: 'ChatGPT', ghost: true },
      ],
      meta: 'jedyna rzecz na tej stronie, która kosztuje · około 20 €',
    },
    {
      n: '03',
      title: 'Netlify',
      body: 'Za darmo, i to tutaj wyląduje twoja strona. Wybierz <strong>Sign up with GitHub</strong> i nie ma nic więcej do wypełnienia.',
      buttons: [{ href: 'https://app.netlify.com/signup', label: 'Załóż konto' }],
      meta: '2 min · bez karty',
    },
    {
      n: '04',
      title: 'Figma',
      body: 'Darmowa wystarczy. Design zapisujesz z Figmy jako jeden plik i ten plik dajesz agentowi. Nic w warsztacie nie wymaga płatnego miejsca.',
      buttons: [{ href: 'https://www.figma.com/signup', label: 'Załóż konto' }],
      meta: 'darmowy plan w zupełności wystarczy',
    },
  ],

  osPicker: {
    legend: 'Na jakim komputerze pracujesz?',
    mac: 'macOS',
    windows: 'Windows',
    linux: 'Linux',
    hintNeutral: 'Wszystko poniżej dopasuje się do wyboru.',
    hintGuessed: (os) =>
      `Zgadliśmy ${os} na podstawie przeglądarki. Nie ten? Wybierz inny — wszystko poniżej się dopasuje.`,
    hintSet: (os) => `Wszystko poniżej jest dla systemu ${os}.`,
  },

  terminal: {
    mac: {
      heading: 'Jak otworzyć terminal na macOS',
      steps: [
        'Naciśnij <kbd>Cmd</kbd> + <kbd>Spacja</kbd>.',
        'Wpisz <code>Terminal</code>.',
        'Naciśnij <kbd>Enter</kbd>.',
      ],
      note: 'Otworzy się okno z linijką tekstu i migającym kursorem. To wszystko. Wklejasz do niego przez <kbd>Cmd</kbd> + <kbd>V</kbd>.',
    },
    windows: {
      heading: 'Jak otworzyć terminal na Windows',
      steps: [
        'Naciśnij klawisz <kbd>Windows</kbd>.',
        'Wpisz <code>PowerShell</code>.',
        'Kliknij <strong>Windows PowerShell</strong> — <em>nie</em> „Wiersz polecenia", który wygląda podobnie i zachowuje się inaczej.',
      ],
      note: 'Otworzy się niebieskie okno z linijką tekstu i migającym kursorem. To wszystko. Wklejasz przez <kbd>Ctrl</kbd> + <kbd>V</kbd> albo prawym przyciskiem myszy.',
    },
    linux: {
      heading: 'Jak otworzyć terminal na Linuksie',
      steps: [
        'Naciśnij <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>.',
        'Jeśli nic się nie stanie, otwórz menu aplikacji i poszukaj <code>Terminal</code>.',
      ],
      note: 'Wklejasz przez <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> — samo <kbd>Ctrl</kbd> + <kbd>V</kbd> znaczy w terminalu coś innego.',
    },
  },

  terminalRules: [
    '<b>Linijka z kursorem to prompt.</b> Kończy się na <code>$</code>, <code>%</code> albo <code>&gt;</code> i oznacza, że terminal czeka na ciebie.',
    '<b>Wklej, potem naciśnij <kbd>Enter</kbd>.</b> Nic się nie uruchomi, dopóki tego nie zrobisz.',
    '<b>Cisza jest normalna.</b> Komenda potrafi stać przez minutę i nic nie wypisywać. Nie zawiesiła się — pracuje. Nauczysz się czekać.',
    '<b>Skończyła się, kiedy wraca prompt.</b> To jedyny sygnał, jaki dostajesz.',
    '<b>To, co przewinęło się do góry, jest zapisem.</b> Nie da się kliknąć w starą linijkę i jej poprawić. Żyje tylko ta, którą właśnie piszesz.',
    '<b>Niczym z tej strony nie zepsujesz komputera.</b> Każda komenda tutaj coś instaluje, loguje cię albo wypisuje, co znalazła.',
  ],

  install: {
    mac: {
      heading: 'Node, Git i GitHub w terminalu, na macOS',
      cmds: ['brew install node gh'],
      note: 'To wymaga Homebrew. Nie masz? Najpierw wklej jedną komendę ze strony <a href="https://brew.sh">brew.sh</a> — zapyta o hasło do Maca, a przy wpisywaniu nic się nie pokazuje i tak ma być. Git przychodzi razem z nim. Kiedy wszystko się skończy, zamknij terminal i otwórz nowy.',
    },
    windows: {
      heading: 'Node, Git i GitHub w terminalu, na Windows',
      cmds: [
        'winget install --id OpenJS.NodeJS.LTS',
        'winget install --id Git.Git',
        'winget install --id GitHub.cli',
        'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned',
      ],
      note: 'Po jednej. Ostatnia pozwala PowerShellowi uruchamiać narzędzia, które instalujesz dalej — bez niej <code>npm</code> i agent zatrzymają się na <em>running scripts is disabled on this system</em>. Jeśli zapyta, wpisz <code>Y</code> i naciśnij Enter. Potem zamknij PowerShell i otwórz nowy: nowe programy zauważa tylko przy starcie.',
    },
    linux: {
      heading: 'Node, Git i GitHub w terminalu, na Linuksie',
      cmds: [
        'sudo apt install -y curl git gh',
        'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash',
        'nvm install --lts',
      ],
      note: 'Przed trzecią komendą zamknij terminal i otwórz nowy. Pierwsza zapyta o hasło; przy wpisywaniu nic się nie pokazuje i tak ma być. Node idzie przez nvm, bo większość dystrybucji ma starszy, niż potrzeba, i dlatego, że instalacje poniżej nie wymagają wtedy <code>sudo</code>. Nie Ubuntu ani Debian? Zainstaluj <code>curl</code>, <code>git</code> i <code>gh</code> swoim menedżerem paczek — <a href="https://github.com/cli/cli#installation">instrukcja dla gh</a>.',
    },
    agentHeading: 'Jeden agent — ten, za którego już płacisz',
    agentBody:
      'Potrzebujesz <strong>jednego</strong> z tych dwóch, nie obu. Masz subskrypcję Claude — bierz pierwszy. Masz ChatGPT Plus — drugi.',
    claude: 'Claude Pro albo Max',
    chatgpt: 'ChatGPT Plus',
    netlifyHeading: 'Netlify w terminalu',
    netlifyBody: 'To tym narzędziem twoja strona trafi na koniec warsztatu do internetu.',
    after:
      'Jeśli komenda zaraz po instalacji mówi <code>command not found</code>, zamknij terminal i otwórz nowy. Prawie zawsze to wystarcza.',
  },

  signin: {
    intro:
      'Każde narzędzie musi wiedzieć, kim jesteś, i każde robi to tak samo: komenda otwiera przeglądarkę, klikasz zgodę i wracasz do terminala. Potem jedna komenda pokazuje, że się udało.',
    check: 'Sprawdź:',
    github: {
      heading: 'GitHub',
      cmd: 'gh auth login',
      body: 'Zada kilka pytań; poruszasz się strzałkami, zatwierdzasz Enterem. Wybierz <strong>GitHub.com</strong>, potem <strong>HTTPS</strong>, potem <strong>Yes</strong> przy logowaniu Gita, potem <strong>Login with a web browser</strong>. Pokaże jednorazowy kod: naciśnij Enter, wklej kod w przeglądarce i kliknij <strong>Authorize</strong>.',
      checkCmd: 'gh auth status',
      expect: 'mówi Logged in to github.com',
    },
    agent: {
      heading: 'Twój agent',
      claude: {
        cmd: 'claude auth login',
        body: 'Przeglądarka otworzy claude.ai. Zaloguj się i kliknij <strong>Authorize</strong>. Jeśli terminal zamiast tego poprosi o kod, skopiuj go z przeglądarki i wklej z powrotem.',
        checkCmd: 'claude auth status',
        expect: 'pokazuje "loggedIn": true',
      },
      codex: {
        cmd: 'codex login',
        body: 'Przeglądarka otworzy ChatGPT. Zaloguj się i zezwól. Terminal powie, kiedy skończy.',
        checkCmd: 'codex login status',
        expect: 'mówi Logged in using ChatGPT',
      },
    },
    netlify: {
      heading: 'Netlify',
      cmd: 'netlify login',
      body: 'Przeglądarka otworzy stronę Netlify. Kliknij <strong>Authorize</strong> i wróć do terminala.',
      checkCmd: 'netlify status',
      expect: 'pokazuje twój adres e-mail',
    },
  },

  repo: {
    intro:
      'Twój projekt potrzebuje domu na GitHubie. Jedna komenda zakłada repozytorium — prywatne, więc widzisz je tylko ty — i kładzie jego pustą kopię na twoim komputerze, w folderze <code>turbine</code>.',
    cmds: ['gh repo create turbine --private --clone', 'cd turbine'],
    after:
      'W tym folderze zaczyna się warsztat. W dniu warsztatu otwierasz terminal, wchodzisz do niego przez <code>cd turbine</code> i tam uruchamiasz agenta. Do tego czasu zostaw go pustym.',
    checkCmd: 'git remote -v',
    expect: 'pokazuje github.com/twoja-nazwa/turbine',
    taken:
      'Masz już repozytorium o nazwie turbine? Wybierz inną nazwę i używaj jej wszędzie, gdzie ta strona mówi turbine.',
  },

  ready: {
    intro:
      'Ostatni krok i nie musisz niczego sprawdzać sam. Agent przegląda wszystko powyżej i mówi ci po ludzku, czego jeszcze brakuje.',
    steps: [
      'W terminalu wejdź do folderu projektu:',
      'Uruchom agenta — <code>claude</code> albo <code>codex</code>. Jeśli zapyta, czy ufasz temu folderowi, odpowiedz tak.',
      'Skopiuj prompt poniżej, wklej go i naciśnij Enter.',
    ],
    promptLabel: 'Wklej to agentowi',
    prompt: `Przygotowuję się do warsztatu i mało pracowałem w terminalu. Sprawdź, czy ten komputer
jest do niego gotowy. Niczego sam nie instaluj, nie loguj się i niczego nie zmieniaj: tylko
patrz, i uruchamiaj takie komendy, jakich do tego potrzebujesz.

Sprawdź każdą z tych rzeczy i pokaż mi wynik jako tabelę — co sprawdziłeś, co znalazłeś,
i OK albo NIE OK:

1. Node jest zainstalowany, w wersji 20.11 albo nowszej, i npm działa.
2. Git jest zainstalowany i zna imię oraz adres e-mail, które wpisuje do commitów.
3. GitHub w terminalu (gh) jest zainstalowany i zalogowany.
4. Netlify w terminalu jest zainstalowany i zalogowany.
5. Ty, agent, z którym rozmawiam, jesteś zainstalowany i zalogowany. Powiedz, którym agentem
   jesteś.
6. Ten folder jest repozytorium git połączonym z repozytorium na GitHubie, to repozytorium
   istnieje i należy do konta, na które zalogowany jest gh.
7. Ten folder jest pusty, poza plikami samego gita. Warsztat zaczyna się od zera.

Przy każdym NIE OK napisz w jednym, dwóch zdaniach, po ludzku, co mam zrobić — z dokładną
komendą do wpisania, jeśli taka jest. Na końcu, w osobnej linijce: GOTOWE albo NIEGOTOWE
i ile rzeczy zostało.`,
    after:
      'Przed każdą komendą zapyta o zgodę. Zgadzaj się — tylko patrzy. Popraw to, co oznaczy jako NIE OK, i wklej ten sam prompt jeszcze raz, aż powie <strong>GOTOWE</strong>. Jeśli agent w ogóle się nie uruchamia, wróć do sekcji <a href="#zaloguj-sie">Zaloguj się</a>.',
  },

  codespaces: {
    intro:
      'Część służbowych laptopów nie pozwoli zainstalować niczego. Cały warsztat możesz wtedy zrobić w przeglądarce, w <strong>GitHub Codespace</strong>: komputerze w chmurze, który ma już Node, Gita i GitHuba w terminalu, i jest już zalogowany do GitHuba.',
    steps: [
      {
        text: 'Na github.com kliknij <strong>+</strong> → <strong>New repository</strong>. Nazwij je <code>turbine</code>, wybierz <strong>Private</strong>, zaznacz <strong>Add a README file</strong> — codespace nie otworzy się na pustym repozytorium — i kliknij <strong>Create repository</strong>.',
      },
      {
        text: 'Na stronie repozytorium: <strong>Code</strong> → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. Trwa to minutę, dwie. Panel na dole to terminal, już w folderze repozytorium.',
      },
      {
        text: 'Usuń README, żeby folder zaczynał pusty:',
        cmds: ['rm README.md'],
      },
      {
        text: 'Zainstaluj agenta i Netlify — komendy z sekcji <a href="#zainstaluj-narzedzia">Zainstaluj narzędzia</a>, od agenta w dół. Node, Git i GitHub już tam są.',
      },
      {
        text: 'Zaloguj się do agenta i do Netlify jak w sekcji <a href="#zaloguj-sie">Zaloguj się</a>. Terminal zamiast otwierać przeglądarkę wypisze link: przytrzymaj <kbd>Ctrl</kbd> albo <kbd>Cmd</kbd> i kliknij go. Codex potrzebuje logowania, które działa z innego urządzenia:',
        cmds: ['codex login --device-auth'],
        note: 'Jeśli Codex powie, że logowanie kodem urządzenia nie jest włączone, włącz je w ChatGPT → Settings → Security i uruchom komendę jeszcze raz.',
      },
      {
        text: 'Zrób krok <a href="#niech-agent-sprawdzi-wszystko">Niech agent sprawdzi wszystko</a> w terminalu codespace’a. Jesteś już w folderze projektu, więc pomiń <code>cd turbine</code>.',
      },
    ],
    after:
      'Darmowy plan GitHuba obejmuje 120 rdzeniogodzin Codespaces miesięcznie. Warsztat zużywa około trzech. W dniu warsztatu otwórz ten sam codespace z <a href="https://github.com/codespaces">github.com/codespaces</a>.',
  },

  faq: [
    [
      'Nigdy nie używałem terminala.',
      'Dobrze — jedna trzecia sali też nie. Jest o tym osobna sekcja wyżej, każda komenda ma przycisk do kopiowania, a pierwsze, o co na warsztacie poprosisz agenta, to żeby tłumaczył każdą komendę na bieżąco.',
    ],
    [
      'Czy muszę umieć programować?',
      'Nie. Będziesz oglądać to, co zrobił agent, i mówić po ludzku, co jest nie tak. Dokładnie o tej robocie jest ta sesja.',
    ],
    [
      'Nie chcę płacić za subskrypcję AI.',
      'Darmowe plany obu produktów nie obejmują narzędzia w terminalu, więc na darmowym koncie pętla nie ruszy. Najtańszy plan któregokolwiek wystarczy, a potem można zrezygnować.',
    ],
    [
      'Po co mi repozytorium na GitHubie?',
      'To dom twojego projektu. Agent może zapisywać tam pracę na bieżąco, więc nic nie przepadnie, jeśli laptop odmówi posłuszeństwa, a z warsztatu wychodzisz z kodem, nie tylko z adresem.',
    ],
    [
      'Mam darmową Figmę.',
      'To wszystko, czego potrzebujesz. Zapisujesz plik z Figmy — dwa kliknięcia — i dajesz go agentowi. Nic w warsztacie nie wymaga płatnego miejsca.',
    ],
    [
      'Sprawdzenie mówi NIE OK i nie rozumiem dlaczego.',
      'Zapytaj agenta. Napisz „wytłumacz punkt 3, jakbym robił to pierwszy raz" — on wie, co znalazł. Jeśli dalej stoi, przyjdź na salę piętnaście minut wcześniej.',
    ],
    [
      'Czy na warsztacie będę potrzebować internetu?',
      'Tak, i na sali on jest. Agent instaluje paczki, rozkodowuje plik Figmy i publikuje twoją stronę — wszystko to idzie przez sieć. Jeśli Codex zapyta o dostęp do sieci, odpowiedz tak.',
    ],
    [
      'Służbowy laptop nie pozwala mi nic instalować.',
      'Użyj Codespace, jak opisano wyżej. Na samym laptopie nie instalujesz niczego.',
    ],
    [
      'Czy to zadziała na Windows?',
      'Tak. Używaj PowerShella, nie starego Wiersza polecenia. Reszta sesji jest identyczna.',
    ],
    [
      'Co zabieram do domu?',
      'Działający adres w internecie, repozytorium z kodem i osiem promptów, które zadziałają w poniedziałek.',
    ],
  ],

  exportSteps: {
    steps: [
      '<b>Zduplikuj.</b> Otwórz plik i wybierz <strong>Duplicate to your drafts</strong>. W pliku, który możesz tylko oglądać, zapisu lokalnej kopii może nie być.',
      '<b>Zapisz lokalną kopię.</b> Otwórz menu główne (ikona Figmy w lewym górnym rogu), potem <strong>File</strong> → <strong>Save local copy…</strong>',
      '<b>Dostajesz jeden plik <code>.fig</code>.</b> W folderze projektu załóż folder <code>design</code> i włóż do niego plik — po tym, jak prompt 01 utworzy projekt.',
    ],
    rules: [
      '<b>Plik, a nie jego zdjęcie.</b> <code>.fig</code> to sam design — tekst jako tekst, kolory jako wartości, zmienne, komponenty i zdjęcia — więc agent czyta design, zamiast zgadywać ze zdjęcia.',
      '<b>Agent sam go rozkoduje i może do tego potrzebować internetu.</b> Poza Figmą nic nie otwiera plików <code>.fig</code>, więc agent rozgryza format sam, czasem z małą paczką, którą instaluje. Na sali jest sieć. Jeśli Codex zapyta o dostęp do sieci, odpowiedz tak.',
      '<b>W projekcie, nie obok niego.</b> Agent pracuje wewnątrz folderu projektu, a Claude Code pyta, zanim przeczyta cokolwiek spoza niego — plik piętro wyżej zamienia się w pytanie, na którym agent musi się zatrzymać.',
    ],
  },

  during: {
    promptsHeading: 'Osiem promptów',
    figmaTitle: 'Design, w Figmie',
    figmaReady:
      'Otwórz i wybierz <strong>Duplicate to your drafts</strong>. Jest twój — grzeb w nim, psuj, nic się nie stanie.',
    figmaReadyCta: 'Otwórz w Figmie',
    figmaPending:
      'Link pojawi się tutaj w dniu warsztatu. Zduplikujesz plik do siebie i zapiszesz lokalną kopię ze swojej wersji.',
    figmaPendingCta: 'Link w dniu warsztatu',
    exportTitle: 'Potem zapisz kopię',
    exportBody:
      'File → Save local copy — Figma daje ci jeden plik <code>.fig</code>. Ten plik czyta twój agent.',
    exportCta: 'Dwa kliknięcia · niżej',
    packAlt: (href, figHref) =>
      `Nie masz konta w Figmie albo coś nie idzie? <a href="${figHref}" download>Pobierz turbine.fig</a> (5&nbsp;MB) — ten sam plik, już zapisany. <a href="${href}" download>Gotowa paczka</a> (7&nbsp;MB) to ten sam design jako obrazy, tokeny i teksty — <em>opcjonalna</em>, na wypadek gdyby agent nie dał rady z plikiem.`,
    exportHeading: 'Jak wyciągnąć design z Figmy',
    exportIntro:
      'Twój agent nie widzi twojego ekranu. Potrzebuje designu jako pliku, a Figma zapisze cały design w jednym.',
  },

  pages: {
    beforeH1: 'Zanim przyjdziesz',
    beforeLede: [
      'Dziewięćdziesiąt minut, trzydzieści osób, jedna pętla. Agent dostaje design, pisze stronę, a potem program — nie on sam — mówi mu wszystko, co jest z nią nie tak. Agent to poprawia i słyszy to jeszcze raz.',
      'Ta strona to przygotowanie. Zajmuje około trzydziestu minut, idzie dużo lepiej w domu niż na konferencyjnym wifi i kończy się tym, że agent mówi ci, czy jesteś gotowy.',
    ],
    duringH1: 'W trakcie warsztatu',
    duringLede:
      'Potrzebujesz designu i tej strony. Nie ma czego klonować ani czytać — całą resztę agent robi sobie sam.',
    pasteNote:
      'Wklejaj każdy prompt w całości. Reguły w środku znaczą tyle samo co samo polecenie, a skrócenie promptu do pierwszego zdania to najczęstszy sposób na rozczarowującą odpowiedź.',
    promptsIntro:
      'Po kolei. Każdy stoi sam, więc jeśli któryś idzie źle, możesz powiedzieć <em>&bdquo;przestań, idziemy dalej&rdquo;</em> i wkleić następny.',
    promptLabel: (n) => `Prompt ${n}`,
  },

  diagrams: {
    '01-the-loop': 'Pętla: generuj, sprawdź, napraw, z wyjściem przez publikację',
    '02-fake-loop-vs-real-loop': 'Model oceniający własną pracę obok modelu ocenianego przez osobny program',
    '03-verification-tiers': 'Trzy poziomy sprawdzania: deterministyczne bramki, mierzone porównanie, adversarial review',
    '04-mcp-topology': 'Agent połączony z plikiem designu, przeglądarką i miejscem publikacji',
    '05-dynamic-workflow': 'Trzy przebiegi review rozchodzące się równolegle, każde znalezisko wysłane do obalenia, na końcu filtr większościowy',
    '06-ninety-minutes': 'Dziewięćdziesiąt minut: trzy odcinki pracy własnej między czterema blokami mówienia',
    '07-loop-vs-workflow': 'Dwa kształty: pętla zdefiniowana warunkiem wyjścia i workflow zdefiniowany fazami',
  },
}
