"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  defaultValue?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Search...",
  debounceMs = 300,
  className,
  defaultValue = "",
}: SearchBarProps) {
  const [value, setValue] = React.useState(defaultValue);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(newValue);
    }, debounceMs);
  };

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pl-8"
      />
    </div>
  );
}
