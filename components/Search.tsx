'use client';

import { Search as SearchIcon } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";

const Search = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get('query') || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set('query', query);
      } else {
        params.delete('query');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, pathname, router, searchParams]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="library-search-wrapper">
      <SearchIcon className="ml-3 text-[var(--text-muted)] w-5 h-5" />
      <input
        type="text"
        placeholder="Search by title or author..."
        className="library-search-input"
        value={query}
        onChange={handleSearch}
      />
    </div>
  );
};

export default Search;
