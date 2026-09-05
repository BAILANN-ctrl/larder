import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../src/lib/prisma.js", () => ({
  prisma: {
    search: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "../src/lib/prisma.js";
import { recordSearch, recentSearches } from "../src/services/searchService.js";

beforeEach(() => {
  vi.mocked(prisma.search.create).mockClear();
  vi.mocked(prisma.search.findMany).mockClear();
});

describe("recordSearch", () => {
  it("persists a search row for the user", async () => {
    vi.mocked(prisma.search.create).mockResolvedValue(undefined as any);
    await recordSearch("user-1", "nutella");

    expect(prisma.search.create).toHaveBeenCalledWith({
      data: { userId: "user-1", term: "nutella" },
    });
  });
});

describe("recentSearches", () => {
  it("returns recent distinct terms in recency order", async () => {
    vi.mocked(prisma.search.findMany).mockResolvedValue([
      { term: "nutella" },
      { term: "nutella" },
      { term: "cola" },
      { term: "chips" },
    ] as any);

    const terms = await recentSearches("user-1", 10);
    expect(terms).toEqual(["nutella", "cola", "chips"]);
  });

  it("never returns more than the requested limit", async () => {
    vi.mocked(prisma.search.findMany).mockResolvedValue([
      { term: "a" },
      { term: "b" },
      { term: "c" },
    ] as any);

    const terms = await recentSearches("user-1", 2);
    expect(terms).toEqual(["a", "b"]);
  });

  it("returns an empty list when there are no searches", async () => {
    vi.mocked(prisma.search.findMany).mockResolvedValue([]);
    const terms = await recentSearches("user-1", 10);
    expect(terms).toEqual([]);
  });
});