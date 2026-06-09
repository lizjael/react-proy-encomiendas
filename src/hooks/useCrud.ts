// src/hooks/useCrud.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

interface UseCrudOptions<T> {
  fetchFn: () => Promise<T[]>;
  deleteFn?: (id: number) => Promise<void>;
  onSuccess?: () => void;
}

export function useCrud<T>({
  fetchFn,
  deleteFn,
  onSuccess,
}: UseCrudOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a ref for onSuccess to avoid infinite re-fetch when caller defines it inline
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      onSuccessRef.current?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar datos");
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  const deleteItem = useCallback(
    async (id: number) => {
      if (!deleteFn) return;
      try {
        await deleteFn(id);
        toast.success("Registro eliminado correctamente");
        await loadData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Error al eliminar");
      }
    },
    [deleteFn, loadData],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refresh: loadData, deleteItem };
}
