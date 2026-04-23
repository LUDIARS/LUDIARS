/// LUDIARS Services Dashboard — client-side renderer.
///
/// Loads `data/services.json` (static catalog) + `data/snapshots.json`
/// (time-series of per-repo completion %) and renders:
///   - Overall completion bar (latest)
///   - Tier counts (how many repos in each completion bucket)
///   - Categories with per-service completion
///   - Snapshot history timeline
///
/// The routine (`ludiars-status`) appends to `data/snapshots.json` and
/// drops a `.md` into `snapshots/YYYY-MM-DD.md` each week. The site
/// re-renders from whatever JSON is there — no build step.

const TIER_DEFS = [
    { key: "ship",   min: 80, max: 100, label: "80%+" },
    { key: "strong", min: 60, max: 79,  label: "60-79%" },
    { key: "mvp",    min: 40, max: 59,  label: "40-59%" },
    { key: "early",  min: 20, max: 39,  label: "20-39%" },
    { key: "seed",   min: 0,  max: 19,  label: "0-19%" },
];

function tierOf(pct) {
    for (const t of TIER_DEFS) {
        if (pct >= t.min && pct <= t.max) return t;
    }
    return TIER_DEFS[TIER_DEFS.length - 1];
}

async function main() {
    const [services, snapshots] = await Promise.all([
        fetch("./data/services.json").then(r => r.json()),
        fetch("./data/snapshots.json").then(r => r.json()),
    ]);

    const latestDate = snapshots.latest;
    const latest = snapshots.snapshots.find(s => s.date === latestDate)
                 ?? snapshots.snapshots[0];

    renderHero(latest, services);
    renderCategories(services, latest);
    renderTimeline(snapshots);
}

function renderHero(snap, services) {
    document.getElementById("snapshot-date").textContent =
        "Latest snapshot · " + snap.date;

    const fill  = document.getElementById("overall-fill");
    const label = document.getElementById("overall-label");
    // Defer to next tick so the CSS transition plays on first load.
    requestAnimationFrame(() => {
        fill.style.width = snap.weighted_completion + "%";
    });
    label.textContent = snap.weighted_completion + "%";

    // Tier breakdown — group the repos in the snapshot by completion tier.
    const byTier = Object.fromEntries(TIER_DEFS.map(t => [t.key, []]));
    for (const [repo, pct] of Object.entries(snap.repos)) {
        byTier[tierOf(pct).key].push(repo);
    }
    const grid = document.getElementById("tier-grid");
    grid.innerHTML = "";
    const tpl = document.getElementById("tpl-tier");
    for (const def of TIER_DEFS) {
        const node = tpl.content.firstElementChild.cloneNode(true);
        node.classList.add(def.key);
        node.querySelector(".tier-range").textContent = def.label;
        const repos = byTier[def.key];
        node.querySelector(".tier-count").textContent = repos.length;
        node.querySelector(".tier-repos").textContent =
            repos.length ? repos.join(" · ") : "—";
        grid.appendChild(node);
    }

    // Highlights
    const hl = document.getElementById("highlights-list");
    hl.innerHTML = "";
    for (const line of (snap.highlights ?? [])) {
        const li = document.createElement("li");
        li.textContent = line;
        hl.appendChild(li);
    }
}

function renderCategories(services, snap) {
    const root = document.getElementById("categories-root");
    root.innerHTML = "";
    const catTpl = document.getElementById("tpl-category");
    const svcTpl = document.getElementById("tpl-service");

    for (const cat of services.categories) {
        const catNode = catTpl.content.firstElementChild.cloneNode(true);
        catNode.style.setProperty("--cat-accent", cat.accent);
        catNode.querySelector(".category-title").textContent = cat.label;

        const repoList = cat.repos.filter(r => r in snap.repos);
        const avg = repoList.length
            ? Math.round(repoList.reduce((s, r) => s + snap.repos[r], 0) / repoList.length)
            : 0;
        catNode.querySelector(".category-count").textContent =
            `${repoList.length} service${repoList.length === 1 ? "" : "s"}  ·  avg ${avg}%`;

        const list = catNode.querySelector(".service-list");
        // sort by completion desc so "most-done" repos bubble up
        repoList.sort((a, b) => snap.repos[b] - snap.repos[a]);

        for (const repo of repoList) {
            const pct = snap.repos[repo];
            const meta = services.services[repo] ?? {};
            const row = svcTpl.content.firstElementChild.cloneNode(true);
            const tier = tierOf(pct);
            row.classList.add("tier-" + tier.key);

            const link = row.querySelector(".service-link");
            link.href = `https://github.com/LUDIARS/${encodeURIComponent(repo)}`;

            row.querySelector(".service-icon").textContent    = meta.icon ?? "📦";
            row.querySelector(".service-name").textContent    = repo;
            row.querySelector(".service-summary").textContent = meta.summary ?? "";
            row.querySelector(".service-pct").textContent     = pct + "%";

            const fill = row.querySelector(".mini-fill");
            requestAnimationFrame(() => { fill.style.width = pct + "%"; });

            list.appendChild(row);
        }
        root.appendChild(catNode);
    }
}

function renderTimeline(snapshots) {
    const ul = document.getElementById("timeline");
    ul.innerHTML = "";
    // newest first
    const sorted = [...snapshots.snapshots].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
    for (const snap of sorted) {
        const li = document.createElement("li");
        li.className = "timeline-item";
        const date = document.createElement("span");
        date.className = "timeline-date";
        date.textContent = snap.date;
        const desc = document.createElement("span");
        desc.className = "timeline-desc";
        const firstHighlight = snap.highlights?.[0] ?? "定期スナップショット";
        const mdHref = snap.md ?? `snapshots/${snap.date}.md`;
        desc.innerHTML = `<a href="${mdHref}">${escapeHtml(firstHighlight)}</a>`;
        const score = document.createElement("span");
        score.className = "timeline-score";
        const tier = tierOf(snap.weighted_completion);
        score.style.color = `var(--tier-${tier.key})`;
        score.textContent = snap.weighted_completion + "%";
        // invisible bullet spacer lives in ::before, so just append items
        li.appendChild(document.createElement("span")); // bullet dot slot
        li.appendChild(date);
        li.appendChild(desc);
        li.appendChild(score);
        ul.appendChild(li);
    }
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[c]);
}

main().catch(err => {
    document.body.innerHTML =
        `<pre style="padding:24px;color:#e66060">Failed to load dashboard: ${err.message}</pre>`;
});
