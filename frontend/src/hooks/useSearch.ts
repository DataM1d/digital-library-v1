import { useSearchParams, useRouter } from "next/navigation";

export function useSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("search") || "";

  const updateSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newQuery) {
      params.set("search", newQuery);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return { query, updateSearch };
}
