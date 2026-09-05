import { prisma } from "../lib/prisma.js";

const MAX_ROWS_FETCH = 50;

export async function recordSearch(userId: string, term: string): Promise<void> {
  await prisma.search.create({
    data: { userId, term },
  });
}

export async function recentSearches(
  userId: string,
  limit = 10
): Promise<string[]> {
  const rows = await prisma.search.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS_FETCH,
    select: { term: true },
  });

  const seen = new Set<string>();
  const terms: string[] = [];
  for (const row of rows) {
    if (seen.has(row.term)) continue;
    seen.add(row.term);
    terms.push(row.term);
    if (terms.length >= limit) break;
  }
  return terms;
}