import { useState, useCallback } from 'react';
import { useRecipeStore } from '../store/recipeStore';

export function useOCR() {
  const { scanReceiptOCR } = useRecipeStore();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanReceipt = useCallback(
    async (file: File): Promise<string[]> => {
      setIsScanning(true);
      setError(null);
      try {
        const ingredients = await scanReceiptOCR(file);
        setIsScanning(false);
        if (ingredients.length === 0) {
          setError('No ingredients detected. Please try uploading a clearer image.');
        }
        return ingredients;
      } catch (err: any) {
        setIsScanning(false);
        const errMsg = err.response?.data?.error || 'Failed to scan receipt image.';
        setError(errMsg);
        return [];
      }
    },
    [scanReceiptOCR]
  );

  return {
    scanReceipt,
    isScanning,
    error,
  };
}
