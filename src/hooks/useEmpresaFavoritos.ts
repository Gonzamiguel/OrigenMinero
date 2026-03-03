import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'empresa-favoritos';

export function useEmpresaFavoritos() {
  const [favoritos, setFavoritos] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
  }, [favoritos]);

  const toggleFavorito = useCallback((perfilId: string) => {
    setFavoritos((prev) =>
      prev.includes(perfilId) ? prev.filter((id) => id !== perfilId) : [...prev, perfilId]
    );
  }, []);

  const isFavorito = useCallback(
    (perfilId: string) => favoritos.includes(perfilId),
    [favoritos]
  );

  return { favoritos, toggleFavorito, isFavorito };
}
