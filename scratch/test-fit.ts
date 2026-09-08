import { DEFAULT_AGREEMENT_TERMS } from "../src/lib/agreement-defaults";

export function parseTermsIntoClauses(termsText: string) {
  const normalized = termsText.replace(/\r\n/g, "\n");
  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p) => {
    const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1 && lines[0].length < 75 && /^[0-9A-Z\s.,&/\-()]+$/.test(lines[0])) {
      return { title: lines[0], body: lines.slice(1).join("\n") };
    }
    return { title: "", body: p };
  });
}

const clauses = parseTermsIntoClauses(DEFAULT_AGREEMENT_TERMS);

// 2 columns: column 1 has 5 clauses, column 2 has 5 clauses
// Column width is (730 - 20) / 2 = 355px
// In 355px width at 8.5px font, approx 62 characters per line, line-height 13px
function calcColHeight(colClauses: typeof clauses) {
  let h = 0;
  for (const c of colClauses) {
    const titleH = 15; // 9px font bold + margin
    const paras = c.body.split("\n").filter(Boolean);
    let lines = 0;
    for (const p of paras) {
      lines += Math.max(1, Math.ceil(p.length / 62));
    }
    const gaps = (paras.length - 1) * 5;
    const clauseH = titleH + lines * 13 + gaps + 8; // 8px bottom margin between clauses
    h += clauseH;
  }
  return h;
}

const col1H = calcColHeight(clauses.slice(0, 5));
const col2H = calcColHeight(clauses.slice(5));
const section4H = Math.max(col1H, col2H);

console.log("Col 1 Height:", col1H, "px");
console.log("Col 2 Height:", col2H, "px");
console.log("Section 4 Height:", section4H, "px");

// Elements on Page 2:
const runningHeader = 35;
const section4Title = 22;
const dualExecution = 145;
const auditLedger = 95;
const complianceBanner = 28;
const footer = 38;
const gaps = 30;

const totalPage2Height = runningHeader + section4Title + section4H + dualExecution + auditLedger + complianceBanner + footer + gaps;
console.log("\n=== TOTAL PAGE 2 HEIGHT ===");
console.log("Total Height:", totalPage2Height, "px");
console.log("Usable Height in p-8 (1059px): 1059 px");
console.log("Headroom / Margin:", 1059 - totalPage2Height, "px");
