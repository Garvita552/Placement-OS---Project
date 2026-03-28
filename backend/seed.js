const mongoose = require("mongoose");
const Topic = require("./models/Topic");
const dotenv = require("dotenv");
dotenv.config();

const { curriculumData: baseCurriculum } = require("./data/baseCurriculum");
const metaOverlay = require("./data/curriculumMeta");

const SECTION_GUIDE = {
    aptitude: {
        intro:
            "Quantitative aptitude, reasoning, verbal, and DI as tested in screening rounds: build repeatable methods, log mistakes, and finish with timed mixed mocks.",
        questions: (t) => [
            `For "${t}", which drills give the best marks-per-hour this week?`,
            "How do you trade speed vs accuracy on test day?",
            "What mistake pattern are you eliminating right now?",
            "How would you teach one reliable shortcut from this topic without hurting accuracy?",
        ],
    },
    dsa: {
        intro:
            "Coding rounds: pattern recognition, complexity, edge cases, and clear communication before typing.",
        questions: (t) => [
            `What is your checklist starting a "${t}" problem in an interview?`,
            "When is the brute-force answer acceptable to state first?",
            "How do you pick test cases before coding?",
            "Which 2–3 problems prove you practiced this area?",
        ],
    },
    academics: {
        intro:
            "CS theory for interviews: tight definitions, small diagrams, and trade-offs (e.g. consistency, isolation, TCP reliability).",
        questions: (t) => [
            `Explain "${t}" in under 90 seconds to another engineer.`,
            "What follow-up do interviewers usually ask next?",
            "Where does this appear in systems you use daily?",
            "What is a common wrong answer students give here?",
        ],
    },
    webdev: {
        intro:
            "Browser platform skills: semantics, layout, JavaScript depth, frameworks, performance, and security basics.",
        questions: (t) => [
            `How does "${t}" show up in a real page you built or debugged?`,
            "Which devtools panel do you open first for issues here?",
            "What breaks in production if this is ignored?",
            "Name one canonical doc or spec people should read.",
        ],
    },
    devops: {
        intro:
            "Delivery and operations: shells, containers, orchestration, pipelines, cloud primitives, observability, least privilege.",
        questions: (t) => [
            `Sketch a minimal CI path that touches "${t}".`,
            "What production failure mode connects to this topic?",
            "How are secrets handled differently in CI vs runtime?",
            "What would you alert on after a risky change here?",
        ],
    },
    ml: {
        intro:
            "ML literacy: when simple models win, how to evaluate fairly, and how to discuss bias and generalization honestly.",
        questions: (t) => [
            `When would you avoid the fanciest method from "${t}"?`,
            "How do you spot overfitting in plots or metrics?",
            "Which metric for imbalanced classification?",
            "How do train/validation/test differ from k-fold CV?",
        ],
    },
    datascience: {
        intro:
            "Data workflows: loading, cleaning, EDA, visualization, and statistics with clear assumptions.",
        questions: (t) => [
            `What pandas or stats pitfall shows up in "${t}"?`,
            "How do you state assumptions to stakeholders?",
            "Give an example of a misleading chart and a fix.",
            "How do you treat missing data without hiding bias?",
        ],
    },
    softskills: {
        intro:
            "Behavioral fit, communication, and credibility: stories, structure, and calm recovery under pressure.",
        questions: (t) => [
            `What STAR story demonstrates "${t}"?`,
            "How do you shorten the same story for a phone screen?",
            "What smart question do you ask the interviewer about culture or role?",
            "How do you reset after a weak answer?",
        ],
    },
    fullstack: {
        intro:
            "End-to-end systems: UI, APIs, persistence, auth, scaling concerns, and shipping to users.",
        questions: (t) => [
            `Draw "${t}" inside a 3-box architecture you have shipped or designed.`,
            "Main scalability or security risk if done poorly?",
            "MVP stub vs harden-first—which part of this topic?",
            "Name one standard tool or RFC people expect you to know.",
        ],
    },
    java: {
        intro:
            "Java backend track: OOP, collections, concurrency, JVM intuition, Spring/JPA for enterprise-style interviews.",
        questions: (t) => [
            `What JVM or API detail in "${t}" shows depth?`,
            "Contrast with how Node or Python would approach the same job.",
            "Where do concurrency bugs or memory issues hide?",
            "Which Spring/JPA piece do you reach for first for REST CRUD?",
        ],
    },
    python: {
        intro:
            "Python for services and tooling: idiomatic stdlib, async web stacks, Django/FastAPI, testing.",
        questions: (t) => [
            `Real project moment where "${t}" mattered?`,
            "GIL: when does it bite and when not?",
            "How do you test this area (fixtures, mocks)?",
            "stdlib vs dependency—your rule of thumb?",
        ],
    },
    cloudengineer: {
        intro:
            "Cloud operations: networking, compute, storage, IAM, serverless, and observability with cost and blast-radius awareness.",
        questions: (t) => [
            `Cost or blast-radius mistake to avoid in "${t}"?`,
            "IAM role vs long-lived key for automation?",
            "Metrics proving health after a deploy?",
            "Recovery if a resource was accidentally public?",
        ],
    },
};

function defaultRoadmap(section, title) {
    const safe = String(title).replace(/"/g, "'");
    return [
        `Phase 1 — Map & first reps: decompose “${safe}” into checkable sub-skills; one deep example each (book/video + your notes).`,
        `Phase 2 — Volume & timing: daily timed blocks; keep an error log (concept vs careless vs time).`,
        `Phase 3 — Proof of work: small project, public repo, or curated problem list you can narrate end-to-end.`,
        `Phase 4 — Interview cadence: 60–90s explanations, follow-up drills, tie to ${section} hiring signals for your target companies.`,
    ];
}

function mergeCurriculum() {
    const out = {};
    for (const section of Object.keys(baseCurriculum)) {
        const guide = SECTION_GUIDE[section] || SECTION_GUIDE.academics;
        out[section] = {};
        for (const title of Object.keys(baseCurriculum[section])) {
            const raw = { ...baseCurriculum[section][title] };
            const ov = (metaOverlay[section] && metaOverlay[section][title]) || {};
            const summary = ov.summary || `${title}. ${guide.intro}`;
            const interviewFocus =
                ov.interviewFocus && ov.interviewFocus.length ? ov.interviewFocus : guide.questions(title);
            const highlights = [...(raw.highlights || [])];
            if (ov.moreHighlights && ov.moreHighlights.length) highlights.push(...ov.moreHighlights);
            const roadmap =
                ov.roadmap && ov.roadmap.length ? ov.roadmap : defaultRoadmap(section, title);
            out[section][title] = {
                ...raw,
                summary,
                interviewFocus,
                highlights,
                roadmap,
            };
        }
    }
    return out;
}

const curriculumData = mergeCurriculum();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/placement_os";

async function seed() {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for Seeding...");

    await Topic.deleteMany({ userId: null });

    let inserted = 0;
    for (const sectionKey of Object.keys(curriculumData)) {
        const sectionObj = curriculumData[sectionKey];
        for (const topicTitle of Object.keys(sectionObj)) {
            const details = sectionObj[topicTitle];
            const newTopic = new Topic({
                section: sectionKey,
                title: topicTitle,
                summary: details.summary || "",
                highlights: details.highlights || [],
                interviewFocus: details.interviewFocus || [],
                roadmap: details.roadmap || [],
                youtube: details.youtube || [],
                websites: details.websites || [],
                practice: details.practice || "",
                userId: null,
            });
            await newTopic.save();
            inserted++;
        }
    }

    console.log(`Successfully seeded ${inserted} global topics!`);
    mongoose.disconnect();
}

seed().catch((err) => {
    console.error(err);
    mongoose.disconnect();
});
