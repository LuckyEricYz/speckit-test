const fs = require("fs");
const path = require("path");

const root = path.join(process.cwd(), "coverage_preview");
const baseUrl =
  process.env.BASE_URL?.replace(/\/+$/, "") ||
  process.env.FALLBACK_URL?.replace(/\/+$/, "") ||
  ".";
const metrics = ["statements", "branches", "functions", "lines"];
const labels = {
  statements: "Statements",
  branches: "Branches",
  functions: "Functions",
  lines: "Lines"
};

const summaries = [];
const reports = [];

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      if (entry.name === "coverage-summary.json") summaries.push(full);
      if (entry.name === "index.html" && full.endsWith("coverage/index.html")) {
        reports.push(full);
      }
    }
  }
};

if (fs.existsSync(root)) {
  walk(root);
}

if (!summaries.length) {
  console.log("## Coverage Preview\n\n> No coverage summaries generated for this PR.");
  process.exit(0);
}

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
    // ignore malformed files
  }
}

rows.sort((a, b) => a.pkg.localeCompare(b.pkg));

const formatPct = (pct) => {
  if (!Number.isFinite(pct)) return "N/A";
  return `${pct % 1 === 0 ? pct.toString() : pct.toFixed(1)}%`;
};

const summarizeTotals = () =>
  metrics
    .map((metric) => {
      const { covered, total } = totals[metric];
      const pct = total ? (covered / total) * 100 : NaN;
      return `- ${labels[metric]}: ${formatPct(pct)} (${covered}/${total})`;
    })
    .join("\n");

const packageTableHeader = `| Package | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |`;

const packageTableRows = rows
  .map(({ pkg, metricValues }) => {
    const cells = metricValues.map(({ pct }) => formatPct(pct)).join(" | ");
    return `| ${pkg} | ${cells} |`;
  })
  .join("\n");

const reportLinks =
  reports.length > 0
    ? reports
        .map((report) => {
          const pkg = report
            .replace(/^coverage_preview\//, "")
            .replace(/\/coverage\/index\.html$/, "");
          const urlBase = baseUrl === "." ? "." : `${baseUrl}`;
          return `- [${pkg}](${urlBase}/${pkg}/coverage/index.html)`;
        })
        .join("\n")
    : "- No HTML coverage reports generated.";

const body = `## Coverage Preview

Preview site: ${baseUrl}

Repository coverage (aggregated):
${summarizeTotals()}

Package coverage:
${packageTableHeader}
${packageTableRows}

HTML reports:
${reportLinks}
`;

console.log(body);
