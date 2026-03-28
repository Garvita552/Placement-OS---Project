/**
 * Domain & productivity card copy + industry-style roadmaps.
 * User notes persist in localStorage under placement_user_note_${storageKey}.
 */
(function () {
    const PLACEMENT = [
        {
            title: "DSA for interviews",
            desc: "Industry standard: patterns (two pointers, binary search on answer, graphs, DP), complexity proof, and clean communication—not memorized code. Align with LeetCode/company tags for your tier.",
            link: "dsa.html",
            set: null,
            storageKey: "dsa",
            pillars: ["Patterns & templates", "Complexity & trade-offs", "Testing & edge cases"],
            roadmap: [
                { t: "Weeks 1–3", d: "Arrays, strings, hash maps, binary search, two pointers; 1 Easy + 1 Medium daily with editorial review." },
                { t: "Weeks 4–7", d: "Linked lists, stacks/queues, trees, heaps; recursion → iterative comfort; draw state before coding." },
                { t: "Weeks 8–11", d: "Graphs (BFS/DFS, topo, shortest path), intervals, greedy intro; timed mixed sets 3×/week." },
                { t: "Weeks 12+", d: "DP families, hard picks by company; full mock interviews; explain approach in ≤3 minutes." },
            ],
        },
        {
            title: "Aptitude & online tests",
            desc: "Campus/service-company screens: quant, reasoning, verbal, DI. Accuracy and skip strategy beat cramming rare tricks. Calibrate to your target test (AMCAT, Cocubes, etc.).",
            set: "aptitude",
            storageKey: "aptitude",
            pillars: ["Arithmetic core", "LR + puzzles", "RC & DI"],
            roadmap: [
                { t: "Weeks 1–2", d: "Number system, %, profit/loss, TSD, T&W—timed topic drills; error log (concept vs careless)." },
                { t: "Weeks 3–4", d: "Reasoning: seating, syllogism, blood relations; 2 puzzle sets daily with strict timer." },
                { t: "Weeks 5–6", d: "DI + mixed quant; verbal RC focus; first full-length mock." },
                { t: "Ongoing", d: "Weekly mocks; section order fixed; review only marked questions + weak topics." },
            ],
        },
        {
            title: "Web development",
            desc: "Product-grade frontend: semantic HTML, layout systems, JS runtime model, React/TS, Web Vitals, and OWASP basics. Hiring bars expect debugging in DevTools and accessibility awareness.",
            set: "webdev",
            storageKey: "webdev",
            pillars: ["Platform fundamentals", "Component architecture", "Perf & security"],
            roadmap: [
                { t: "Phase A", d: "HTML semantics + forms; CSS Grid/Flex; one responsive clone (nav + cards + footer)." },
                { t: "Phase B", d: "JS deep: scope, closures, promises/async, event loop; fetch + error handling." },
                { t: "Phase C", d: "React + TypeScript project; routing, state, one performance pass (Lighthouse)." },
                { t: "Phase D", d: "Security mindset (XSS/CSRF/CSP); deploy to Vercel/Netlify; document decisions in README." },
            ],
        },
        {
            title: "Soft skills & HR",
            desc: "Structured stories (STAR), resume as evidence, salary/role clarity, and calm under follow-ups. Most offers are lost on communication and fit—not only technical score.",
            set: "softskills",
            storageKey: "softskills",
            pillars: ["STAR inventory", "Resume ↔ JD alignment", "Professional presence"],
            roadmap: [
                { t: "Week 1", d: "Draft 8 STAR stories (academic + projects + conflict + failure); one-pager resume v1." },
                { t: "Week 2", d: "Record answers; trim to 60–90s; tailor bullets to 3 target JDs." },
                { t: "Week 3", d: "Mock HR + technical small-talk; prepare 10 smart questions for interviewers." },
                { t: "Continuous", d: "Update doc after each interview; refine weak stories; track referrals and follow-ups." },
            ],
        },
        {
            title: "CS core (OS, DBMS, CN)",
            desc: "Theory rounds: crisp definitions, trade-offs, and “what breaks in production”. Covers scheduling, memory, SQL vs NoSQL, indexing, TCP/TLS/DNS—typical for Indian IT and many product companies.",
            set: "academics",
            storageKey: "academics",
            pillars: ["OS & concurrency", "DBMS & SQL", "Networks & web path"],
            roadmap: [
                { t: "Track 1", d: "OS: processes/threads, scheduling, deadlocks, paging; draw diagrams from memory." },
                { t: "Track 2", d: "DBMS: ACID, isolation, normalization, indexes, simple join queries on paper." },
                { t: "Track 3", d: "CN: OSI vs TCP/IP, TCP vs UDP, HTTP/TLS handshake sketch, DNS journey." },
                { t: "Polish", d: "90-second answers; link each topic to something you built or operated." },
            ],
        },
        {
            title: "Full-stack engineering",
            desc: "End-to-end delivery: SPA/PWA, REST/GraphQL, auth (sessions/JWT/OAuth), SQL/NoSQL, caching, queues, Docker, CI/CD. Interviewers look for ownership from UI bug to deployment.",
            set: "fullstack",
            storageKey: "fullstack",
            pillars: ["API & data", "Auth & sessions", "Deploy & observe"],
            roadmap: [
                { t: "Milestone 1", d: "CRUD API + DB schema + migrations; OpenAPI/Swagger or typed client." },
                { t: "Milestone 2", d: "Auth with refresh rotation; role checks; environment config documented." },
                { t: "Milestone 3", d: "Docker Compose local stack; CI (lint, test, build); staging deploy." },
                { t: "Milestone 4", d: "Load/health story: caching, rate limits, logs/metrics; architecture diagram in repo." },
            ],
        },
        {
            title: "Java backend",
            desc: "Enterprise track: OOP, collections, concurrency, JVM basics, Spring Boot, JPA/Hibernate. Common in banking, consulting, and large product maintainers in India.",
            set: "java",
            storageKey: "java",
            pillars: ["Language + JVM", "Spring ecosystem", "Data access"],
            roadmap: [
                { t: "Core", d: "OOP, exceptions, generics, streams; collections complexity; one CLI tool project." },
                { t: "Concurrency", d: "ExecutorService, synchronized vs locks; reproduce a race and fix it." },
                { t: "Spring", d: "REST + validation + Spring Data JPA; integration test with Testcontainers (optional)." },
                { t: "Hardening", d: "Security basics, config profiles, structured logging; deploy JAR or container." },
            ],
        },
        {
            title: "Python & backends",
            desc: "FastAPI/Django services, typing, asyncio where it fits, pytest, packaging. Strong for startups, ML engineering glue, and automation-heavy roles.",
            set: "python",
            storageKey: "python",
            pillars: ["Idiomatic Python", "Web frameworks", "Quality & tests"],
            roadmap: [
                { t: "Foundations", d: "Data structures in stdlib, virtualenv, typing; script → package layout." },
                { t: "APIs", d: "FastAPI or Django REST; Pydantic models; auth dependency injection pattern." },
                { t: "Persistence", d: "ORM queries, migrations, transactions; one non-trivial schema." },
                { t: "Shipping", d: "pytest + coverage; Dockerfile; CI; 12-factor config (.env + secrets)." },
            ],
        },
        {
            title: "Data science",
            desc: "Reproducible notebooks → pipelines: pandas/numpy, EDA, visualization, statistics, experiment hygiene. Emphasis on assumptions and stakeholder-ready outputs.",
            set: "datascience",
            storageKey: "datascience",
            pillars: ["Wrangling", "EDA & viz", "Inference basics"],
            roadmap: [
                { t: "Weeks 1–2", d: "Pandas fluency; 3 Kaggle-style cleans with documented assumptions." },
                { t: "Weeks 3–4", d: "Matplotlib/Seaborn storytelling; correlation vs causation checklist." },
                { t: "Weeks 5–6", d: "Descriptive + inferential refresh; hypothesis tests with plain-English conclusions." },
                { t: "Capstone", d: "End-to-end report: question, data, methods, limits, next steps—PDF or slide deck." },
            ],
        },
        {
            title: "Cloud engineering",
            desc: "AWS-style primitives: IAM, VPC/security groups, EC2, S3, Lambda, observability. Design for least privilege, cost, and recovery—not console clicking without understanding.",
            set: "cloudengineer",
            storageKey: "cloud",
            pillars: ["Identity & network", "Compute & storage", "Serverless & ops"],
            roadmap: [
                { t: "Basics", d: "IAM users vs roles; one multi-AZ mental model; CLI or IaC for repeatability." },
                { t: "Core services", d: "EC2 + S3 static site or app artifact; bucket policy exercise least privilege." },
                { t: "Serverless", d: "Lambda + API Gateway; event-driven resize or webhook; cold start awareness." },
                { t: "Ops", d: "CloudWatch alarms; backup/lifecycle; incident runbook in markdown." },
            ],
        },
        {
            title: "DevOps & platforms",
            desc: "Linux, Git, Docker, Kubernetes fundamentals, CI/CD, GitHub Actions. Goal: repeatable builds, safe deploys, and observable systems.",
            set: "devops",
            storageKey: "devops",
            pillars: ["Containers", "Orchestration", "Pipelines"],
            roadmap: [
                { t: "Linux & Git", d: "Shell productivity; branching strategy; hooks or conventional commits (optional)." },
                { t: "Docker", d: "Multi-stage builds; Compose for local full stack; image scanning basics." },
                { t: "K8s", d: "Pods, Deployments, Services, ConfigMaps/Secrets; deploy to minikube/kind." },
                { t: "CI/CD", d: "GitHub Actions: lint, test, build, deploy with protected secrets." },
            ],
        },
        {
            title: "Machine learning",
            desc: "Supervised/unsupervised basics, evaluation metrics, bias/variance, and when not to use ML. Interview depth is often “metrics + failure modes”, not only API calls.",
            set: "ml",
            storageKey: "ml",
            pillars: ["Models & loss", "Evaluation", "Responsible use"],
            roadmap: [
                { t: "Math & code", d: "Linear/logistic intuition; implement one loss gradient on paper or numpy." },
                { t: "Trees & ensembles", d: "RF vs boosting; overfitting controls; feature importance caveats." },
                { t: "Workflow", d: "Train/val/test leakage; cross-validation; metric choice for imbalance." },
                { t: "Project", d: "End-to-end notebook + saved model + README with limitations and next steps." },
            ],
        },
    ];

    const PRODUCT = [
        {
            title: "Topic dashboard",
            desc: "Single hub for every syllabus section—useful when you rotate topics weekly and want one consistent entry point.",
            link: "dashboard.html",
            storageKey: "dash",
            roadmap: [
                { t: "Use", d: "Pin 2–3 sections per month; open topic pages and log plans in Daily Tracker." },
            ],
        },
        {
            title: "Daily execution tracker",
            desc: "Plan vs done by topic drives your home analytics and weak-area insights—treat it as the source of truth for study honesty.",
            link: "daily-tracker.html",
            storageKey: "daily",
            roadmap: [
                { t: "Habit", d: "Same time each day; planned vs completed counts; one line retrospective." },
            ],
        },
        {
            title: "Long-term analytics",
            desc: "Velocity and consistency over months—better signal than single cram weeks for interview readiness.",
            link: "overall-tracker.html",
            storageKey: "overall",
            roadmap: [
                { t: "Review", d: "Weekly glance at trends; adjust next week’s capacity realistically." },
            ],
        },
        {
            title: "Engineering journal",
            desc: "Capture decisions, bugs, and links—becomes material for resume bullets and behavioral interviews.",
            link: "notes.html",
            storageKey: "notes",
            roadmap: [
                { t: "Template", d: "Context → decision → outcome → link; tag by technology." },
            ],
        },
        {
            title: "Routine designer",
            desc: "Time-blocked week view aligned with energy and deadlines; pairs well with domain roadmaps above.",
            link: "timetable.html",
            storageKey: "time",
            roadmap: [
                { t: "Setup", d: "Fixed slots for DSA, theory, mocks; protect one rest block." },
            ],
        },
        {
            title: "AI study assist",
            desc: "Use for hints and explanations after you attempt the problem—keeps learning active instead of passive.",
            link: "ai.html",
            storageKey: "ai",
            roadmap: [
                { t: "Discipline", d: "Paste your attempt + error; ask for concept hint, not full solution first." },
            ],
        },
    ];

    window.PLACEMENT_DOMAIN_CARDS = PLACEMENT;
    window.PRODUCTIVITY_CARDS_DATA = PRODUCT;
})();
