/**
 * Polska wersja wszystkich napisów interfejsu. Struktura jest identyczna z `ui.en.mjs` —
 * `scripts/build-guideline.mjs` buduje całą stronę raz na każdy język, a
 * `checks/guideline-i18n.mjs` sprawdza, czy oba pliki mają ten sam kształt.
 *
 * Styl: dokumentacja. Co zrobić, czym i jak sprawdzić, że zadziałało. Bez wstępów,
 * bez liczb dla efektu, bez uspokajania.
 *
 * Nazwy narzędzi i to, co widać na ekranie, zostają po angielsku — w takiej formie
 * uczestnik je zobaczy: terminal, prompt, commit, deploy, Authorize.
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
      'Materiały do masterclassu na WaysConf 2026: przygotowanie, warsztat, prezentacja i gotowa strona.',
    preparationTitle: 'Przygotowanie · masterclass WaysConf 2026',
    preparationDesc:
      'Przygotuj komputer przed warsztatem: konta, narzędzia, logowanie, repozytorium na GitHubie i automatyczne sprawdzenie konfiguracji.',
    duringTitle: 'Warsztat · masterclass WaysConf 2026',
    duringDesc:
      'Idee, diagramy i osiem promptów, które prowadzą od pustego folderu do zweryfikowanej strony w internecie.',
  },

  chrome: {
    skip: 'Przejdź do treści',
    home: 'WaysConf 2026: materiały do warsztatu',
    tocTitle: 'Na tej stronie',
    footerSession:
      '<strong>Build an AI that checks and fixes its own work</strong> · WaysConf 2026 · 16 września, 14:55, ROOM-PM · Szymon Paluch',
    footerRepo: 'Repozytorium warsztatu:',
    footerFiction:
      'TURBINE to zmyślony festiwal, stworzony jako materiał szkoleniowy. Nazwy artystów, zdjęcia i teksty są wymyślone.',
  },

  copy: { button: 'Kopiuj', aria: 'Skopiuj komendę: ', done: 'Skopiowane' },

  hub: {
    kicker: 'WaysConf 2026 · masterclass',
    h1: 'Build an AI that checks and fixes its own work',
    lede: 'Na warsztacie budujesz stronę internetową z pliku Figmy. Robi to agent, Claude Code albo Codex. Pisze też program, który porównuje stronę z projektem, i poprawia każdy błąd, który ten program zgłosi.',
    when: '16 września 2026 · 14:55 · ROOM-PM · EXPO Kraków',
    partsHeading: 'Materiały',
    partsIntro: 'Przygotowanie zrób przed 16 września. Pozostałe materiały otworzę w dniu warsztatu.',
    open: 'Otwórz',
    locked: 'Dostępne 16 września',
    parts: [
      {
        key: 'preparation',
        n: '01',
        title: 'Przygotowanie',
        body: 'Zakładasz konta, instalujesz narzędzia, logujesz się i tworzysz repozytorium na GitHubie. Na końcu agent sprawdza, czy wszystko działa. Zajmie ci to około 30 minut.',
      },
      {
        key: 'workshop',
        n: '02',
        title: 'Warsztat',
        body: 'Plik Figmy i osiem promptów, które wklejasz w trakcie sesji.',
      },
      {
        key: 'deck',
        n: '03',
        title: 'Prezentacja',
        body: 'Slajdy, które pokazuję na sesji.',
      },
      {
        key: 'site',
        n: '04',
        title: 'Gotowa strona',
        body: 'Tak wygląda strona festiwalu zbudowana z tego samego projektu. Do tego wyniku dąży twój agent.',
      },
    ],
  },

  accounts: [
    {
      n: '01',
      title: 'GitHub',
      body: 'Za darmo. Przechowuje repozytorium projektu. Przez GitHuba zakładasz też konto w Netlify i uruchamiasz Codespace.',
      buttons: [{ href: 'https://github.com/signup', label: 'Załóż konto' }],
      meta: '2 min · potwierdź e-mail',
    },
    {
      n: '02',
      title: 'Agent do kodu',
      pay: true,
      body: '<strong>Claude Pro lub Max</strong> (dla Claude Code) albo <strong>ChatGPT Plus</strong> (dla Codeksa). Wystarczy jedna subskrypcja. Prompty działają z obydwoma.',
      buttons: [
        { href: 'https://claude.ai/', label: 'Claude' },
        { href: 'https://chatgpt.com/', label: 'ChatGPT', ghost: true },
      ],
      meta: 'płatne · około 20 € miesięcznie',
    },
    {
      n: '03',
      title: 'Netlify',
      body: 'Za darmo. Publikuje twoją stronę. Wybierz <strong>Sign up with GitHub</strong>.',
      buttons: [{ href: 'https://app.netlify.com/signup', label: 'Załóż konto' }],
      meta: '2 min · bez karty',
    },
    {
      n: '04',
      title: 'Figma',
      body: 'Darmowy plan. Zapisujesz projekt z Figmy jako plik i przekazujesz go agentowi.',
      buttons: [{ href: 'https://www.figma.com/signup', label: 'Załóż konto' }],
      meta: 'darmowy plan',
    },
  ],

  osPicker: {
    legend: 'System operacyjny',
    mac: 'macOS',
    windows: 'Windows',
    linux: 'Linux',
    hintNeutral: 'Instrukcje poniżej dopasują się do wyboru.',
    hintGuessed: (os) => `Wykryty system: ${os}. Jeśli to nie ten, wybierz inny.`,
    hintSet: (os) => `Instrukcje poniżej są dla systemu ${os}.`,
  },

  terminal: {
    mac: {
      heading: 'macOS',
      steps: [
        'Naciśnij <kbd>Cmd</kbd> + <kbd>Spacja</kbd>.',
        'Wpisz <code>Terminal</code>.',
        'Naciśnij <kbd>Enter</kbd>.',
      ],
      note: 'Wklejanie: <kbd>Cmd</kbd> + <kbd>V</kbd>.',
    },
    windows: {
      heading: 'Windows',
      steps: [
        'Naciśnij klawisz <kbd>Windows</kbd>.',
        'Wpisz <code>PowerShell</code>.',
        'Kliknij <strong>Windows PowerShell</strong>. Nie używaj Wiersza polecenia.',
      ],
      note: 'Wklejanie: <kbd>Ctrl</kbd> + <kbd>V</kbd> albo prawy przycisk myszy.',
    },
    linux: {
      heading: 'Linux',
      steps: [
        'Naciśnij <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>.',
        'Jeśli okno się nie otworzy, wyszukaj <code>Terminal</code> w menu aplikacji.',
      ],
      note: 'Wklejanie: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd>. Samo <kbd>Ctrl</kbd> + <kbd>V</kbd> w terminalu nie wkleja.',
    },
  },

  terminalRules: [
    '<b>Znak zachęty:</b> linijka z kursorem, zakończona na <code>$</code>, <code>%</code> albo <code>&gt;</code>. Terminal czeka na komendę.',
    '<b>Uruchomienie komendy:</b> wklej ją i naciśnij <kbd>Enter</kbd>.',
    '<b>Brak komunikatów:</b> niektóre komendy przez minutę albo dłużej nic nie wypisują. Nadal działają.',
    '<b>Koniec:</b> komenda skończyła działanie, kiedy znów pojawi się znak zachęty.',
    '<b>Wcześniejsze linijki:</b> nie da się ich edytować. Wpisywać można tylko w bieżącej.',
    '<b>Komendy na tej stronie:</b> instalują narzędzia, logują cię, zakładają repozytorium albo wypisują status.',
  ],

  install: {
    mac: {
      heading: 'Node, Git i GitHub CLI na macOS',
      cmds: ['brew install node gh'],
      note: 'Wymaga Homebrew. Jeśli go nie masz, najpierw uruchom komendę instalacyjną ze strony <a href="https://brew.sh">brew.sh</a>. Zapyta o hasło do Maca, a wpisywane znaki nie będą widoczne. Homebrew instaluje też Gita. Na koniec zamknij terminal i otwórz nowy.',
    },
    windows: {
      heading: 'Node, Git i GitHub CLI na Windows',
      cmds: [
        'winget install --id OpenJS.NodeJS.LTS',
        'winget install --id Git.Git',
        'winget install --id GitHub.cli',
        'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned',
      ],
      note: 'Uruchamiaj komendy po jednej. Ostatnia pozwala PowerShellowi uruchamiać npm i agenta. Bez niej pojawi się błąd <em>running scripts is disabled on this system</em>. Jeśli padnie pytanie, wpisz <code>Y</code> i naciśnij Enter. Na koniec zamknij PowerShell i otwórz nowy.',
    },
    linux: {
      heading: 'Node, Git i GitHub CLI na Linuksie',
      cmds: [
        'sudo apt install -y curl git gh',
        'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash',
        'nvm install --lts',
      ],
      note: 'Pierwsza komenda zapyta o hasło, a wpisywane znaki nie będą widoczne. Przed trzecią komendą zamknij terminal i otwórz nowy. Node instalujemy przez nvm, bo paczki z dystrybucji bywają starsze niż wymagana wersja 20.11. Dzięki temu instalacja przez npm nie wymaga też <code>sudo</code>. Inne dystrybucje: zainstaluj <code>curl</code>, <code>git</code> i <code>gh</code> swoim menedżerem paczek (<a href="https://github.com/cli/cli#installation">instrukcja dla gh</a>).',
    },
    agentHeading: 'Agent do kodu (jeden z dwóch)',
    agentBody: 'Zainstaluj agenta, który pasuje do twojej subskrypcji.',
    claude: 'Claude Pro lub Max',
    chatgpt: 'ChatGPT Plus',
    netlifyHeading: 'Netlify CLI',
    netlifyBody: 'Publikuje stronę na końcu warsztatu.',
    after:
      'Jeśli komenda zaraz po instalacji zwraca <code>command not found</code>, zamknij terminal i otwórz nowy.',
  },

  signin: {
    intro:
      'Każda komenda logowania otwiera przeglądarkę. Tam zatwierdzasz dostęp i wracasz do terminala. Komenda statusu potwierdza wynik.',
    check: 'Sprawdź:',
    github: {
      heading: 'GitHub',
      cmd: 'gh auth login',
      body: 'Odpowiadaj strzałkami i klawiszem <kbd>Enter</kbd>: <strong>GitHub.com</strong> → <strong>HTTPS</strong> → <strong>Yes</strong> (logowanie Gita) → <strong>Login with a web browser</strong>. Skopiuj jednorazowy kod i naciśnij <kbd>Enter</kbd>. W przeglądarce wklej kod i kliknij <strong>Authorize</strong>.',
      checkCmd: 'gh auth status',
      expect: 'Logged in to github.com',
    },
    agent: {
      heading: 'Agent do kodu',
      claude: {
        cmd: 'claude auth login',
        body: 'Zaloguj się na claude.ai w przeglądarce i kliknij <strong>Authorize</strong>. Jeśli terminal poprosi o kod, skopiuj go z przeglądarki i wklej.',
        checkCmd: 'claude auth status',
        expect: '"loggedIn": true',
      },
      codex: {
        cmd: 'codex login',
        body: 'Zaloguj się do ChatGPT w przeglądarce i zezwól na dostęp. Terminal potwierdzi zakończenie logowania.',
        checkCmd: 'codex login status',
        expect: 'Logged in using ChatGPT',
      },
    },
    netlify: {
      heading: 'Netlify',
      cmd: 'netlify login',
      body: 'Kliknij <strong>Authorize</strong> w przeglądarce i wróć do terminala.',
      checkCmd: 'netlify status',
      expect: 'twój adres e-mail',
    },
  },

  repo: {
    intro:
      'Ta komenda zakłada na twoim koncie GitHub prywatne repozytorium <code>turbine</code>. Klonuje je też do folderu <code>turbine</code> w bieżącym katalogu.',
    cmds: ['gh repo create turbine --private --clone', 'cd turbine'],
    after:
      'Warsztat zaczyna się w tym folderze: <code>cd turbine</code>, potem uruchom agenta. Nie dodawaj do niego plików.',
    checkCmd: 'git remote -v',
    expect: 'github.com/twoja-nazwa/turbine',
    taken:
      'Jeśli masz już repozytorium o nazwie turbine, wybierz inną nazwę. Używaj jej wszędzie tam, gdzie ta strona pisze turbine.',
  },

  ready: {
    intro:
      'Agent sprawdza wszystko z poprzednich kroków i wypisuje, czego brakuje. Niczego nie zmienia.',
    steps: [
      'Przejdź do folderu projektu:',
      'Uruchom agenta: <code>claude</code> albo <code>codex</code>. Jeśli zapyta, czy ufasz temu folderowi, odpowiedz tak.',
      'Wklej prompt poniżej i naciśnij <kbd>Enter</kbd>.',
    ],
    promptLabel: 'Wklej to agentowi',
    prompt: `Sprawdź, czy ten komputer jest gotowy do warsztatu. Niczego nie instaluj, nie loguj się
i niczego nie zmieniaj: tylko sprawdzaj i uruchamiaj takie komendy, jakich do tego potrzebujesz.

Sprawdź każdy punkt i podaj wynik w tabeli z trzema kolumnami: co sprawdziłeś, co znalazłeś,
OK albo NIE OK.

1. Node jest zainstalowany, w wersji 20.11 lub nowszej, i npm działa.
2. Git jest zainstalowany i ma ustawione imię oraz adres e-mail.
3. GitHub CLI (gh) jest zainstalowane i zalogowane.
4. Netlify CLI jest zainstalowane i zalogowane.
5. Ty, agent, który robi to sprawdzenie, jesteś zainstalowany i zalogowany. Napisz, którym
   agentem jesteś.
6. Ten folder jest repozytorium git z remote na GitHubie, a to repozytorium istnieje na
   koncie, na które zalogowane jest gh.
7. W tym folderze nie ma nic poza plikami samego gita.

Dla każdego punktu NIE OK podaj poprawkę w jednym lub dwóch prostych zdaniach, z dokładną
komendą, jeśli taka jest. Zakończ jedną linijką: GOTOWE albo NIEGOTOWE i liczba punktów
do poprawienia.`,
    after:
      'Przed każdą komendą agent pyta o zgodę. Zgódź się. Popraw każdy punkt NIE OK i uruchom ten sam prompt jeszcze raz, aż wynik będzie <strong>GOTOWE</strong>. Jeśli agent się nie uruchamia, powtórz krok <a href="#zaloguj-sie">Zaloguj się</a>.',
  },

  codespaces: {
    intro:
      'Jeśli nie możesz instalować oprogramowania, użyj <strong>GitHub Codespace</strong>. To komputer w chmurze, dostępny w przeglądarce. Ma zainstalowane Node, Gita i GitHub CLI, zalogowane do GitHuba.',
    steps: [
      {
        text: 'Na github.com kliknij <strong>+</strong> → <strong>New repository</strong>. Nazwa: <code>turbine</code>. Widoczność: <strong>Private</strong>. Zaznacz <strong>Add a README file</strong>, bo dla pustego repozytorium nie da się utworzyć Codespace. Kliknij <strong>Create repository</strong>.',
      },
      {
        text: 'Na stronie repozytorium kliknij <strong>Code</strong> → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. Terminal to panel na dole, otwarty w folderze repozytorium.',
      },
      {
        text: 'Usuń README, żeby folder był pusty:',
        cmds: ['rm README.md'],
      },
      {
        text: 'Zainstaluj agenta i Netlify CLI komendami z sekcji <a href="#zainstaluj-narzedzia">Zainstaluj narzędzia</a>. Node, Git i GitHub CLI są już zainstalowane.',
      },
      {
        text: 'Zaloguj się do agenta i do Netlify zgodnie z sekcją <a href="#zaloguj-sie">Zaloguj się</a>. Zamiast otwierać przeglądarkę, terminal wypisze link. Przytrzymaj <kbd>Ctrl</kbd> albo <kbd>Cmd</kbd> i kliknij go. W Codeksie użyj logowania kodem urządzenia:',
        cmds: ['codex login --device-auth'],
        note: 'Jeśli Codex zgłosi, że logowanie kodem urządzenia jest wyłączone, włącz je w ChatGPT → Settings → Security i uruchom komendę ponownie.',
      },
      {
        text: 'Wykonaj krok <a href="#sprawdz-konfiguracje">Sprawdź konfigurację</a> w terminalu Codespace. Pomiń <code>cd turbine</code>, bo terminal jest już w folderze projektu.',
      },
    ],
    after:
      'Darmowy plan GitHuba obejmuje 120 rdzeniogodzin Codespaces miesięcznie. Warsztat zużywa około 3. W dniu warsztatu otwórz ten sam Codespace z <a href="https://github.com/codespaces">github.com/codespaces</a>.',
  },

  faq: [
    [
      'Czy muszę umieć programować?',
      'Nie. Opisujesz problemy zwykłym językiem, a kod pisze agent.',
    ],
    [
      'Czy wystarczy darmowy plan AI?',
      'Nie. Darmowe plany Claude i ChatGPT nie obejmują Claude Code ani Codeksa. Wystarczy najtańszy płatny plan jednego z nich.',
    ],
    [
      'Po co repozytorium na GitHubie?',
      'Przechowuje projekt. Po warsztacie zostaje ci kod.',
    ],
    [
      'Czy potrzebuję płatnej Figmy?',
      'Nie. Plik projektu zapiszesz z darmowego planu.',
    ],
    [
      'Sprawdzenie zwraca NIE OK i nie wiem dlaczego.',
      'Poproś agenta, żeby wyjaśnił ten punkt krok po kroku. Jeśli problem zostanie, przyjdź 15 minut przed startem warsztatu.',
    ],
    [
      'Czy w trakcie warsztatu potrzebny jest internet?',
      'Tak. Na sali jest wifi. Agent instaluje paczki, dekoduje plik Figmy i publikuje stronę.',
    ],
    [
      'Nie mogę instalować programów na laptopie.',
      'Użyj Codespace. Opis jest w sekcji o pracy bez instalacji.',
    ],
    [
      'Czy to działa na Windows?',
      'Tak. Używaj PowerShella, nie Wiersza polecenia.',
    ],
    [
      'Co zostaje mi po warsztacie?',
      'Opublikowana strona, repozytorium z kodem i prompty.',
    ],
  ],

  during: {
    promptsHeading: 'Osiem promptów',
    designTitle: 'Zobacz projekt',
    designBody: 'Otwiera plik TURBINE w Figmie. Możesz w nim oglądać projekt, kiedy agent pracuje.',
    designCta: 'Otwórz w Figmie',
    fileTitle: 'Pobierz turbine.fig',
    fileBody: (size) => `Ten sam projekt jako jeden plik (${size}). Ten plik czyta agent.`,
    fileCta: 'Pobierz',
    fileNote:
      'Kiedy prompt 01 utworzy projekt, załóż w folderze projektu folder <code>design</code> i włóż do niego <code>turbine.fig</code>. Nie obok projektu: Claude Code pyta o zgodę, zanim przeczyta plik spoza folderu projektu.',
  },

  pages: {
    preparationH1: 'Przygotowanie',
    preparationLede: [
      'Wykonaj te kroki przed 16 września, na komputerze, który przyniesiesz na warsztat. Zajmie to około 30 minut.',
      'Ostatni krok to prompt: agent sprawdza konfigurację i wypisuje, czego brakuje.',
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
