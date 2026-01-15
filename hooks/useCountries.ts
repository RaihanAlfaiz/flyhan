"use client";

import { useState, useEffect } from "react";

export interface Country {
  name: {
    common: string;
  };
  cca2: string;
  flags: {
    svg: string;
  };
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,flags"
        );
        if (!response.ok) throw new Error("Failed to fetch countries");
        const data = await response.json();

        // Sort countries alphabetically
        data.sort((a: Country, b: Country) =>
          a.name.common.localeCompare(b.name.common)
        );

        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading };
}
