"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

export function useProductFilters() {
  const [query, setQuery] = useQueryState(
    "query",
    parseAsString.withDefault("").withOptions({ shallow: true, history: "push" })
  );

  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("").withOptions({ shallow: true, history: "push" })
  );

  const [subCategory, setSubCategory] = useQueryState(
    "subCategory",
    parseAsString.withDefault("").withOptions({ shallow: true, history: "push" })
  );

  const [tag, setTag] = useQueryState(
    "tag",
    parseAsString.withDefault("").withOptions({ shallow: true, history: "push" })
  );

  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("newest").withOptions({ shallow: true, history: "push" })
  );

  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true, history: "push" })
  );

  const setCategoryAndResetSub = (cat: string) => {
    setCategory(cat || null);
    setSubCategory(null);
    setPage(1);
  };

  const setSubCategoryFilter = (sub: string) => {
    setSubCategory(sub || null);
    setPage(1);
  };

  const setTagFilter = (t: string) => {
    setTag(t === tag ? null : t || null);
    setPage(1);
  };

  const setSortFilter = (s: string) => {
    setSort(s || "newest");
    setPage(1);
  };

  const setQueryFilter = (q: string) => {
    setQuery(q || null);
    setPage(1);
  };

  const resetAllFilters = () => {
    setQuery(null);
    setCategory(null);
    setSubCategory(null);
    setTag(null);
    setSort("newest");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    query || category || subCategory || tag || (sort && sort !== "newest")
  );

  return {
    query,
    category,
    subCategory,
    tag,
    sort,
    page,
    setQuery: setQueryFilter,
    setCategory: setCategoryAndResetSub,
    setSubCategory: setSubCategoryFilter,
    setTag: setTagFilter,
    setSort: setSortFilter,
    setPage,
    resetAllFilters,
    hasActiveFilters,
  };
}
