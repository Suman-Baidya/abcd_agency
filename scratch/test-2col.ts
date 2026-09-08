import { DEFAULT_AGREEMENT_TERMS } from "../src/lib/agreement-defaults";

export interface ParsedClause {
  title: string;
  body: string;
}

export function parseTermsIntoClauses(termsText: string): ParsedClause[] {
  if (!termsText || !termsText.trim()) return [];
  const normalized = termsText.replace(/\r\n/g, "\n");
  const paragraphs = normalized.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.map((p) => {
      const lines = p.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1 && lines[0].length < 75 && /^[0-9A-Z\s.,&/\-()]+$/.test(lines[0])) {
        return { title: lines[0], body: lines.slice(1).join("\n") };
      }
      return { title: "", body: p };
    });
  }

  return [{ title: "", body: termsText }];
}

export function estimate2ColHeight(clauses: ParsedClause[]): number {
  const mid = Math.ceil(clauses.length / 2);
  const left = clauses.slice(0, mid);
  const right = clauses.slice(mid);

  function colH(colClauses: ParsedClause[]) {
    let h = 0;
    for (const c of colClauses) {
      const titleH = c.title ? 16 : 0;
      const paragraphs = c.body.split("\n").filter(Boolean);
      let lines = 0;
      for (const p of paragraphs) {
        lines += Math.max(1, Math.ceil(p.length / 55));
      }
      const gaps = Math.max(0, paragraphs.length - 1) * 6;
      h += titleH + lines * 13.5 + gaps + 10;
    }
    return h;
  }

  return Math.max(colH(left), colH(right));
}

const clauses = parseTermsIntoClauses(DEFAULT_AGREEMENT_TERMS);
const h2col = estimate22ColHeight(clauses);
console.log("2-column Section 4 height:", h2col, "px");

// Total Page 2 height:
// Running header: 40px
// Section 4 header: 25px
// Section 4 clauses: h2col
// Execution block: 155px
// Audit ledger: 105px
// Compliance banner: 30px
// Footer: 40px
// Margin & padding: 45px
const totalPage2 = 40 + 25 + h2col + 155 + 105 + 30 + 40 + 45;
console.log("Total Page 2 height:", totalPage2, "px (out of 1043px usable inner height)");
console.log("Remaining safety headroom:", 1043 - totalPage2, "px");

function estimate22ColHeight(clauses: ParsedClause[]) {
  return estimate2ColHeight(clauses);
}
