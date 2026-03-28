// Optional overlays: richer summaries, interview prompts, and extra highlights.
// Defaults for missing keys come from SECTION_GUIDE in seed.js.

module.exports = {
    aptitude: {
        "QA - Arithmetic (Core)": {
            summary:
                "Number properties, HCF/LCM, percentages and successive change, ratios, profit/loss and interest, time–speed–distance, and time–work/pipes together account for the largest share of marks in typical campus quant papers. Master standard templates first, then chase speed.",
            interviewFocus: [
                "How do you mentally check whether a percentage or ratio answer is in the right ballpark?",
                "Explain the difference between markup and margin in one sentence.",
                "When is it faster to use inverse variation in time-and-work vs LCM of days?",
                "What is your skip/mark-for-review rule when the clock is tight?",
            ],
            moreHighlights: [
                "Common fraction ↔ percent anchors (½=50%, ¼=25%, ⅛=12.5%)",
                "Relative speed: same direction vs opposite direction",
            ],
        },
        "QA - Algebra & Geometry": {
            summary:
                "Linear and quadratic equations, inequalities, basic coordinate geometry, triangles/circles, and mensuration formulas appear as standalone questions or embedded in DI. Accuracy beats memorizing rare shortcuts.",
            interviewFocus: [
                "How do you choose between factorization vs quadratic formula under time pressure?",
                "State the conditions for two triangles to be similar vs congruent.",
                "Which 2D/3D formulas do you rewrite on the rough sheet before the test?",
                "How do you verify a geometry answer without redrawing the whole figure?",
            ],
            moreHighlights: ["Sum/product of roots for quadratics", "Basic circle chord/tangent facts used in aptitude"],
        },
        "QA - Modern Math": {
            summary:
                "Permutations, combinations, probability with AND/OR, and sets/Venn diagrams underpin counting and probability items. Focus on distinguishing arrangement vs selection and independence vs mutual exclusivity.",
            interviewFocus: [
                "When is order important—permutation vs combination?",
                "Explain P(A|B) in words and when P(A∩B)=P(A)P(B) holds.",
                "How do you count outcomes for ‘at least one’ without double counting?",
                "What is a classic probability trap you now watch for?",
            ],
            moreHighlights: ["nCr and nPr with restrictions (items together/separated)", "Basic Bayes intuition for weighted screens"],
        },
        "Logical Reasoning": {
            summary:
                "Coding-decoding, blood relations, directions, syllogisms, seating, puzzles, and input-output patterns test structured thinking. Seating and linear/circular arrangements are repeatedly high weightage.",
            interviewFocus: [
                "How do you represent a complex seating constraint without clutter?",
                "What is your first move when a puzzle has multiple possibility branches?",
                "How do you validate a syllogism quickly (Venn vs elimination)?",
                "When do you abandon a puzzle to protect the rest of the section?",
            ],
        },
        "Verbal Ability (English)": {
            summary:
                "Reading comprehension, cloze/grammar, para-jumbles, and vocabulary carry heavy weight in many AMCAT/Cocubes-style flows. Daily reading improves both speed and inference, not just vocab lists.",
            interviewFocus: [
                "How do you skim an RC passage without missing the author’s main claim?",
                "What signals help you order sentences in a para-jumble?",
                "How do you tackle ‘closest meaning’ without pure guessing?",
                "Which one grammar rule do you still double-check under pressure?",
            ],
            moreHighlights: ["Tone and inference questions vs factual detail", "Transition words for para-jumbles"],
        },
        "Data Interpretation (DI)": {
            summary:
                "Charts and tables test calculation hygiene, approximation, and reading the question stem carefully. Most errors come from wrong units or comparing the wrong rows—not from weak math.",
            interviewFocus: [
                "When is aggressive rounding safe given the answer choices?",
                "How do you catch unit traps (%, pp, lakhs vs thousands)?",
                "What is your order: read question first or scan the full chart?",
                "Describe a caselet strategy when data is split across two exhibits.",
            ],
            moreHighlights: [
                "Growth rate vs absolute growth; average vs total",
                "Pie chart angle ↔ fraction conversions",
                "Two-chart linked questions (trend + composition)",
            ],
        },
        "Final Strategy (Mocks)": {
            summary:
                "Concept learning must transition into timed, mixed-topic mocks that mimic your target company pattern. Analysis of errors and time sinks matters more than raw number of mocks.",
            interviewFocus: [
                "What is your section order and time budget on a real test?",
                "How do you review a mock: by topic, by mistake type, or by speed?",
                "What is a realistic weekly mock cadence two weeks before exams?",
                "How do you calm a bad mock streak without changing fundamentals randomly?",
            ],
        },
    },

    webdev: {
        "HTML & Accessibility": {
            summary:
                "Semantic HTML improves accessibility, SEO, and maintainability. Forms, labels, focus order, and ARIA only when HTML alone is insufficient are interview-ready talking points.",
            interviewFocus: [
                "Why is <button> preferred over <div> for actions?",
                "How do label[for], aria-label, and aria-labelledby differ?",
                "What breaks keyboard navigation on a custom dropdown?",
                "Name one WCAG principle you can demonstrate in a small demo.",
            ],
        },
        "Modern CSS (Flex/Grid)": {
            summary:
                "Flexbox handles one-dimensional layouts; CSS Grid handles two-dimensional tracks. Responsive design combines fluid type, minmax(), clamp(), and media/container queries.",
            interviewFocus: [
                "When do you choose Grid over Flex for a dashboard layout?",
                "How does min-width: 0 fix overflow in flex children?",
                "Explain mobile-first vs desktop-first breakpoints.",
                "How do you avoid layout shift (CLS) when loading images or fonts?",
            ],
        },
        "Advanced JavaScript": {
            summary:
                "Closures, prototypes, the event loop, promises/async-await, and `this` binding separate junior from strong frontend candidates. Be able to trace microtasks vs macrotasks.",
            interviewFocus: [
                "Trace console order for sync code, Promise.then, and setTimeout(0).",
                "What is a closure and a memory pitfall it can cause?",
                "How does async/await desugar to promises?",
                "Explain call, apply, and bind with a concrete example.",
            ],
        },
        "React Fundamentals": {
            summary:
                "Functional components, hooks, controlled inputs, and lists/keys form the core of React 18+ interviews. Understand when effects run and how dependency arrays change behavior.",
            interviewFocus: [
                "When does useEffect run vs useLayoutEffect?",
                "Why are keys required in lists and what breaks if you use index wrongly?",
                "How do you avoid infinite re-renders in effects?",
                "What is stale state and how does the functional updater fix it?",
            ],
        },
        "React Advanced (Redux/Context)": {
            summary:
                "Context fits localized dependency injection; Redux Toolkit scales predictable global state with slices and middleware. Know when colocation beats global stores.",
            interviewFocus: [
                "When would Context cause unnecessary re-renders and how do you mitigate?",
                "What belongs in Redux vs local useState vs URL state?",
                "How does RTK’s createSlice reduce boilerplate?",
                "How would you structure async data fetching (RTK Query or thunks)?",
            ],
        },
        "TypeScript for Web Apps": {
            summary:
                "TypeScript adds static types to JavaScript: interfaces, unions, generics, and strict null checks catch bugs before runtime and improve editor support in large codebases.",
            interviewFocus: [
                "What is structural typing vs nominal typing?",
                "How do you type React children and event handlers?",
                "When do you use unknown instead of any?",
                "Explain discriminated unions for UI state machines.",
            ],
        },
        "Web Performance & Core Web Vitals": {
            summary:
                "Core Web Vitals measure real-user experience: loading (LCP), interactivity (INP), and visual stability (CLS). Performance work combines assets, network, and main-thread discipline.",
            interviewFocus: [
                "Define LCP, INP, and CLS in one line each.",
                "What commonly hurts LCP on a content-heavy landing page?",
                "How does code splitting interact with route-based loading?",
                "What is the difference between lab (Lighthouse) and field (CrUX) data?",
            ],
        },
        "Web Security (OWASP-minded)": {
            summary:
                "Web apps must mitigate injection, broken auth, XSS, CSRF, and insecure configuration. Defense combines validation, encoding, headers, HTTPS, and least-privilege cookies.",
            interviewFocus: [
                "Compare reflected vs stored XSS with an example.",
                "How do CSRF tokens and SameSite cookies help?",
                "What is CSP and what class of attacks does it reduce?",
                "Why store session IDs in HttpOnly cookies for classic session auth?",
            ],
        },
    },

    dsa: {
        "Graphs": {
            moreHighlights: ["Union-Find for connectivity", "Dijkstra vs BFS for unweighted shortest path"],
        },
    },

    academics: {
        DBMS: {
            moreHighlights: ["Isolation levels and anomalies", "Covering indexes vs non-covering"],
        },
        "Operating Systems": {
            moreHighlights: ["Critical section and mutex vs semaphore", "Virtual memory and page faults (conceptual)"],
        },
        "Computer Networks": {
            moreHighlights: ["TLS handshake overview", "HTTP/1.1 vs HTTP/2 multiplexing (high level)"],
        },
    },

    fullstack: {
        "API Design (REST/GraphQL)": {
            moreHighlights: ["Idempotency for POST vs PUT", "Pagination: offset vs cursor"],
        },
        "System Architecture Basics": {
            moreHighlights: ["Strong vs eventual consistency (when acceptable)", "Rate limiting and backpressure basics"],
        },
    },
};
