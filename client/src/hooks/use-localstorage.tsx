import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Obter do localStorage pelo chave
      const item = window.localStorage.getItem(key);
      // Analisar JSON armazenado ou retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Função para atualizar o valor no localStorage e estado
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir valor ser uma função para o mesmo API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Salvar estado
      setStoredValue(valueToStore);
      // Salvar para localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  return [storedValue, setValue] as const;
}