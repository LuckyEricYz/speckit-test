const fs = require("fs");
const path = require("path");

const reports = (process.env.REPORTS || "").split("\n").filter(Boolean);
const summaries = (process.env.SUMMARIES || "").split("\n").filter(Boolean);
const metrics = ["statements", "branches", "functions", "lines"];
const labels = {
  statements: "Statements",
  branches: "Branches",
  functions: "Functions",
  lines: "Lines"
};

const totals = Object.fromEntries(
  metrics.map((metric) => [metric, { covered: 0, total: 0 }])
);
const rows = [];

for (const file of summaries) {
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const total = data.total || {};
    const pkg = file
      .replace(/^coverage_preview\//, "")
      .replace(/\/coverage\/coverage-summary\.json$/, "");

    const metricValues = metrics.map((metric) => {
      const info = total[metric] || {};
      const covered = Number(info.covered) || 0;
      const totalCount = Number(info.total) || 0;
      if (totalCount > 0) {
        totals[metric].covered += covered;
        totals[metric].total += totalCount;
      }
      const pct = Number.isFinite(info.pct)
        ? info.pct
        : totalCount
          ? (covered / totalCount) * 100
          : NaN;
      return { pct, covered, total: totalCount };
    });

    rows.push({ pkg, metricValues });
  } catch (error) {
    // Ignore malformed files
  }
}

rows.sort((a, b) => a.pkg.localeCompare(b.pkg));

const formatPct = (pct) => {
  if (!Number.isFinite(pct)) return "N/A";
  return `${pct % 1 === 0 ? pct.toString() : pct.toFixed(1)}%`;
};

const statusClass = (pct) => {
  if (!Number.isFinite(pct)) return "neutral";
  if (pct >= 90) return "good";
  if (pct >= 75) return "warn";
  return "bad";
};

const overallCards = metrics
  .map((metric) => {
    const { covered, total } = totals[metric];
    const pct = total ? (covered / total) * 100 : NaN;
    return `
          <div class="card ${statusClass(pct)}">
            <div class="label">${labels[metric]}</div>
            <div class="value">${formatPct(pct)}</div>
            <div class="meta">${covered}/${total} covered</div>
          </div>`;
  })
  .join("\n");

const tableBody = rows
  .map(({ pkg, metricValues }) => {
    const cells = metricValues
      .map(
        ({ pct }) => `            <td class="${statusClass(pct)}">${formatPct(pct)}</td>`
      )
      .join("\n");
    return `          <tr>
            <td>${pkg}</td>
${cells}
          </tr>`;
  })
  .join("\n");

const tableSection = summaries.length
  ? `        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Package</th>
                <th>Statements</th>
                <th>Branches</th>
                <th>Functions</th>
                <th>Lines</th>
              </tr>
            </thead>
            <tbody>
${tableBody}
            </tbody>
          </table>
        </div>`
  : `        <p class="empty">No coverage summaries generated.</p>`;

const reportLinks = reports.length
  ? reports
      .map((report) => {
        const pkg = report
          .replace(/^coverage_preview\//, "")
          .replace(/\/coverage\/index\.html$/, "");
        return `        <li><a href="${pkg}/coverage/index.html">${pkg}</a></li>`;
      })
      .join("\n")
  : "        <li>No coverage reports generated.</li>";

const overallSection = summaries.length
  ? `      <section>
        <h2>Repository Coverage</h2>
        <p>Aggregated across all coverage summaries in this PR.</p>
        <div class="cards">
${overallCards}
        </div>
      </section>`
  : "";

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Coverage Preview</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 2rem; line-height: 1.5; max-width: 1100px; margin: 0 auto; }
      h1 { margin-bottom: 1rem; }
      section { margin-top: 2rem; }
      ul { padding-left: 1.5rem; }
      li { margin-bottom: 0.5rem; }
      a { color: #2563eb; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .table-wrapper { overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 0.75rem; }
      table { width: 100%; border-collapse: collapse; min-width: 520px; }
      thead { background: #f8fafc; }
      th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e7eb; font-variant-numeric: tabular-nums; }
      th { font-size: 0.85rem; letter-spacing: 0.05em; text-transform: uppercase; color: #64748b; }
      tbody tr:last-child td { border-bottom: 0; }
      .empty { color: #6b7280; font-style: italic; }
      .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-top: 1rem; }
      .card { border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem 1.25rem; background: #f8fafc; }
      .card .label { font-size: 0.9rem; color: #475569; }
      .card .value { font-size: 1.6rem; font-weight: 700; margin-top: 0.35rem; }
      .card .meta { font-size: 0.9rem; color: #475569; margin-top: 0.2rem; }
      .good { color: #15803d; font-weight: 600; }
      .warn { color: #b45309; font-weight: 600; }
      .bad { color: #b91c1c; font-weight: 600; }
      .neutral { color: #6b7280; }
    </style>
  </head>
  <body>
    <h1>Coverage Reports</h1>
    <p>Review aggregated coverage, then open per-package HTML reports for details.</p>
${overallSection}
    <section>
      <h2>Package Coverage Summary</h2>
${tableSection}
    </section>
    <section>
      <h2>HTML Reports</h2>
      <p>Select a package to view its HTML coverage report.</p>
      <ul>
${reportLinks}
      </ul>
    </section>
  </body>
</html>`;

fs.writeFileSync(path.join("coverage_preview", "index.html"), html, "utf8");
