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
    beforeTitle: 'Zanim przyjdziesz · masterclass WaysConf 2026',
    beforeDesc:
      'Piętnaście minut przygotowań do masterclassu na WaysConf 2026: cztery darmowe konta, jedna instalacja i jak otworzyć terminal.',
    duringTitle: 'Warsztat · masterclass WaysConf 2026',
    duringDesc:
      'Idee, diagramy i osiem promptów, które prowadzą od pustego folderu do zweryfikowanej strony w internecie.',
  },

  chrome: {
    skip: 'Przejdź do treści',
    tabsLabel: 'Warsztat',
    before: 'Przed',
    during: 'W trakcie',
    tocTitle: 'Na tej stronie',
    footerSession:
      '<strong>Build an AI that checks and fixes its own work</strong> · WaysConf 2026 · 16 września, 14:55, ROOM-PM · Szymon Paluch',
    footerRepo: 'Wszystko zostaje online po konferencji. Repozytorium, jeśli chcesz:',
    footerFiction:
      'TURBINE to zmyślony festiwal stworzony jako materiał dydaktyczny. Nazwy artystów, zdjęcia i teksty są wymyślone. Podobieństwo do prawdziwego wydarzenia lub wykonawcy jest przypadkowe.',
  },

  copy: { button: 'Kopiuj', aria: 'Skopiuj komendę: ', done: 'Skopiowane' },

  accounts: [
    {
      n: '01',
      title: 'GitHub',
      body: 'Za darmo. Potrzebny, żeby zalogować się do Netlify jednym kliknięciem — i do wersji w przeglądarce, jeśli nic nie możesz zainstalować.',
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
    '<b>Niczym z tej strony nie zepsujesz komputera.</b> Każda komenda tutaj albo coś instaluje, albo wypisuje numer wersji.',
  ],

  install: {
    mac: {
      heading: 'Node, na macOS',
      cmd: 'brew install node',
      note: 'Nie masz Homebrew? Pobierz instalator LTS z <a href="https://nodejs.org">nodejs.org</a>, otwórz i przeklikaj. Potem zamknij terminal i otwórz nowy.',
    },
    windows: {
      heading: 'Node, na Windows',
      cmd: 'winget install OpenJS.NodeJS.LTS',
      note: 'Albo instalator z <a href="https://nodejs.org">nodejs.org</a>. Tak czy inaczej zamknij potem PowerShell i otwórz nowy — nowe programy zauważa tylko przy starcie.',
    },
    linux: {
      heading: 'Node, na Linuksie',
      cmd: 'sudo apt install -y nodejs npm',
      note: 'Zapyta o hasło; przy wpisywaniu nic się nie pokazuje i tak ma być. Potrzebny jest Node 20.11 albo nowszy — jeśli twoja dystrybucja ma starszy, użyj <a href="https://github.com/nvm-sh/nvm">nvm</a>.',
    },
    agentHeading: 'Potem jeden agent — ten, za którego już płacisz',
    agentBody:
      'Potrzebujesz <strong>jednego</strong> z tych dwóch, nie obu. Masz subskrypcję Claude — bierz pierwszy. Masz ChatGPT Plus — drugi.',
    claude: 'Claude Pro albo Max',
    chatgpt: 'ChatGPT Plus',
  },

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

  selftest: [
    ['node -v', 'wypisze v20.11.0 albo wyżej'],
    ['npm -v', 'wypisze dowolną wersję'],
    ['claude --version', 'tylko jeśli wybrałeś Claude'],
    ['codex --version', 'tylko jeśli wybrałeś ChatGPT'],
  ],

  faq: [
    [
      'Nigdy nie używałem terminala.',
      'Dobrze — jedna trzecia sali też nie. Jest o tym osobna sekcja wyżej, a pierwsze, o co poprosisz agenta, to żeby tłumaczył każdą komendę na bieżąco.',
    ],
    [
      'Czy muszę umieć programować?',
      'Nie. Będziesz czytać kod i mówić po ludzku, co jest nie tak z wynikiem. Dokładnie o tej robocie jest ta sesja.',
    ],
    [
      'Nie chcę płacić za subskrypcję AI.',
      'Darmowe plany obu produktów nie obejmują narzędzia w terminalu, więc na darmowym koncie pętla nie ruszy. Najtańszy plan któregokolwiek wystarczy, a potem można zrezygnować.',
    ],
    [
      'Mam darmową Figmę.',
      'To wszystko, czego potrzebujesz. Zapisujesz plik z Figmy — dwa kliknięcia — i dajesz go agentowi. Nic w warsztacie nie wymaga płatnego miejsca.',
    ],
    [
      'Czy na warsztacie będę potrzebować internetu?',
      'Tak, i na sali on jest. Agent instaluje paczki, rozkodowuje plik Figmy i publikuje twoją stronę — wszystko to idzie przez sieć. Jeśli Codex zapyta o dostęp do sieci, odpowiedz tak.',
    ],
    [
      'Służbowy laptop nie pozwala mi nic instalować.',
      'Skorzystaj z wersji w przeglądarce. Dostajesz gotową maszynę ze wszystkim i nie instalujesz niczego.',
    ],
    [
      'Czy to zadziała na Windows?',
      'Tak. Używaj PowerShella, nie starego Wiersza polecenia. Reszta sesji jest identyczna.',
    ],
    [
      'A jeśli zostanę w tyle?',
      'Nie da się — nie w sposób, który ma znaczenie. Każdy prompt stoi sam: jeśli któryś idzie źle, powiedz agentowi, żeby przestał, i wklej następny. Wpół zbudowana strona z działającym checkerem uczy więcej niż skończona bez niego.',
    ],
    [
      'Co zabieram do domu?',
      'Działający adres URL, stronę z promptami i design. Wszystko zostaje online po konferencji.',
    ],
  ],

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
      'Ta strona to przygotowanie. Zajmuje jakieś piętnaście minut i idzie dużo lepiej w domu niż na konferencyjnym wifi.',
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
