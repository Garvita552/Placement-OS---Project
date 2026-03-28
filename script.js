// ================= INIT =================

let chartInstance = null;

const questionInput = document.getElementById("questionInput");
const topicSelect = document.getElementById("topicSelect");
const addBtn = document.getElementById("addBtn");
const tableBody = document.getElementById("tableBody");
const totalCount = document.getElementById("totalCount");
const todayCountEl = document.getElementById("todayCount");

const section = localStorage.getItem("section");
const topic = localStorage.getItem("topic");

function getISODate(d) {
    const date = d instanceof Date ? d : new Date(d);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

if (!section || !topic) {
    alert("No topic selected! Redirecting...");
    window.location.href = "index.html";
}

let entries = [];

async function loadEntries() {
    const res = await apiFetch(
        `/api/tracker/entries?section=${encodeURIComponent(section)}&topic=${encodeURIComponent(topic)}`
    );
    entries = res.entries || [];
}

// ================= CALCULATIONS =================

function calculateTotal() {
    return entries.reduce((sum, entry) => sum + entry.questions, 0);
}

function calculateToday() {
    const today = getISODate(new Date());
    return entries.filter((e) => e.date === today).reduce((sum, e) => sum + e.questions, 0);
}

// ================= UI UPDATE =================

function updateUI() {
    tableBody.innerHTML = "";

    if (entries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4">No progress yet 🚀 Add your first entry!</td>
            </tr>
        `;
    } else {
        entries.forEach((entry) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.questions}</td>
                <td>${entry.type}</td>
            `;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.addEventListener("click", () => deleteEntry(entry._id));

            const actionCell = document.createElement("td");
            actionCell.appendChild(deleteBtn);
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });
    }

    totalCount.textContent = calculateTotal();
    if (todayCountEl) todayCountEl.textContent = calculateToday();

    renderChart();
}

// ================= CORE FEATURES =================

async function addEntry() {
    const questions = questionInput.value.trim();
    const type = topicSelect.value;

    if (!questions || !type) {
        alert("Fill all fields!");
        return;
    }

    const q = Number(questions);
    if (!Number.isFinite(q) || q <= 0) {
        alert("Enter a valid positive number!");
        return;
    }

    const payload = {
        section,
        topic,
        date: getISODate(new Date()),
        questions: q,
        type,
    };

    await apiFetch("/api/tracker/entries", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    questionInput.value = "";
    topicSelect.value = "";
    questionInput.focus();

    await loadEntries();
    updateUI();
}

async function deleteEntry(id) {
    if (!id) return;
    if (!confirm("Delete this entry?")) return;

    await apiFetch(`/api/tracker/entries/${encodeURIComponent(id)}`, {
        method: "DELETE",
    });

    await loadEntries();
    updateUI();
}

// ================= EVENTS =================

if (addBtn) addBtn.addEventListener("click", addEntry);

if (questionInput) {
    questionInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addEntry().catch((err) => alert(err.message || "Failed to add entry."));
    });
    questionInput.focus();
}

// ================= CHART =================

function renderChart() {
    const ctx = document.getElementById("progressChart");
    if (!ctx) return;

    const dateMap = new Map();
    entries.forEach((entry) => {
        dateMap.set(entry.date, (dateMap.get(entry.date) || 0) + entry.questions);
    });

    const labels = Array.from(dateMap.keys()).sort();
    const values = labels.map((l) => dateMap.get(l) || 0);

    if (chartInstance) chartInstance.destroy();

    const ds =
        window.AbyssChart &&
        window.AbyssChart.lineDataset("Questions solved", values);
    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                ds || {
                    label: "Questions solved",
                    data: values,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    borderColor: "rgba(34, 211, 238, 0.95)",
                    backgroundColor: "rgba(34, 211, 238, 0.12)",
                },
            ],
        },
        options: {
            responsive: true,
            animation: { duration: 720, easing: "easeOutQuart" },
            plugins: { legend: { labels: { color: "#e0f7ff" } } },
            scales: {
                x: { ticks: { color: "#e0f7ff" } },
                y: { ticks: { color: "#e0f7ff" } },
            },
        },
    });
}

// ================= INIT LOAD =================

loadEntries()
    .then(updateUI)
    .catch((err) => {
        console.error(err);
        alert(err.message || "Failed to load tracker.");
    });