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

export function estimateClauseHeight(clause: ParsedClause): number {
  const titleH = clause.title ? 15 : 0;
  const paragraphs = clause.body.split("\n").filter(Boolean);
  let totalLines = 0;
  for (const p of paragraphs) {
    totalLines += Math.max(1, Math.ceil(p.length / 62));
  }
  const paragraphGaps = Math.max(0, paragraphs.length - 1) * 5;
  const singleColH = titleH + totalLines * 13 + paragraphGaps + 8;
  return Math.ceil(singleColH / 2);
}

export interface TermsPageChunk {
  clauses: ParsedClause[];
  isLastPage: boolean;
}

export function paginateTerms(termsText: string, hasNotes: boolean): TermsPageChunk[] {
  const clauses = parseTermsIntoClauses(termsText);
  if (clauses.length === 0) {
    return [{ clauses: [], isLastPage: true }];
  }

  // 2-column layout capacity: holds up to 640px of clauses on the final page together with execution block
  const intermediateCapacity = 880;
  const lastPageCapacity = hasNotes ? 560 : 640;

  const clauseHeights = clauses.map(estimateClauseHeight);
  const totalHeight = clauseHeights.reduce((acc, h) => acc + h, 0);

  console.log("Total estimated 2-col clause height:", totalHeight, "Capacity:", lastPageCapacity);

  if (totalHeight <= lastPageCapacity) {
    return [{ clauses, isLastPage: true }];
  }

  const pages: TermsPageChunk[] = [];
  let currentClauses: ParsedClause[] = [];
  let currentHeight = 0;

  for (let i = 0; i < clauses.length; i++) {
    const c = clauses[i];
    const h = clauseHeights[i];

    let remainingNeed = 0;
    for (let j = i; j < clauses.length; j++) {
      remainingNeed += clauseHeights[j];
    }

    if (currentHeight + remainingNeed <= lastPageCapacity) {
      for (let j = i; j < clauses.length; j++) {
        currentClauses.push(clauses[j]);
      }
      pages.push({ clauses: currentClauses, isLastPage: true });
      return pages;
    }

    if (currentHeight + h > intermediateCapacity && currentClauses.length > 0) {
      pages.push({ clauses: [...currentClauses], isLastPage: false });
      currentClauses = [c];
      currentHeight = h;
    } else {
      currentClauses.push(c);
      currentHeight += h;
    }
  }

  if (currentHeight > lastPageCapacity && pages.length > 0) {
    pages.push({ clauses: currentClauses, isLastPage: false });
    pages.push({ clauses: [], isLastPage: true });
  } else {
    pages.push({ clauses: currentClauses, isLastPage: true });
  }

  for (let i = 0; i < pages.length; i++) {
    pages[i].isLastPage = i === pages.length - 1;
  }

  return pages;
}

const chunks = paginateTerms(DEFAULT_AGREEMENT_TERMS, false);
console.log("Chunks returned:", chunks.length);
console.log("Total agreement pages:", chunks.length + 1);
