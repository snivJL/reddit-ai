import { useEffect, useState } from "react";

type Params = {
  searchTerm: string;
  delay?: number;
};
const useDebounce = ({ searchTerm, delay = 300 }: Params) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, searchTerm]);

  return debouncedSearchTerm;
};

export default useDebounce;
