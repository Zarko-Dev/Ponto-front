import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const result = await apiFunction(...args);
        setState(prev => ({ ...prev, data: result, loading: false }));
        return result;
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook específico para operações de CRUD
export function useCrudApi<T, CreateData = any, UpdateData = any>(
  apiService: {
    get: (id?: any) => Promise<T | T[]>;
    create: (data: CreateData) => Promise<T>;
    update: (id: any, data: UpdateData) => Promise<T>;
    delete: (id: any) => Promise<void>;
  }
) {
  const [data, setData] = useState<T | T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (id?: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.get(id);
      setData(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao buscar dados';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService]);

  const createData = useCallback(async (createData: CreateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.create(createData);
      // Atualizar a lista se for uma operação de lista
      if (Array.isArray(data)) {
        setData(prev => [...(prev as T[]), result]);
      }
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao criar';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService, data]);

  const updateData = useCallback(async (id: any, updateData: UpdateData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiService.update(id, updateData);
      // Atualizar o item na lista
      if (Array.isArray(data)) {
        setData(prev => (prev as T[]).map(item => 
          (item as any).id === id ? result : item
        ));
      } else if (data && (data as any).id === id) {
        setData(result);
      }
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiService, data]);

  const deleteData = useCallback(async (id: any) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.delete(id);
      // Remover o item da lista
      if (Array.isArray(data)) {
        setData(prev => (prev as T[]).filter(item => (item as any).id !== id));
      } else if (data && (data as any).id === id) {
        setData(null);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao deletar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiService, data]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    createData,
    updateData,
    deleteData,
    reset,
  };
}
