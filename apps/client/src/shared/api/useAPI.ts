import { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import { axiosInstance } from '@/shared/api';

type APIQueryState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export const useAPI = <T>(apiInfo: AxiosRequestConfig): APIQueryState<T> => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axiosInstance.request(apiInfo);
        setData(result.data.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiInfo]);

  return { data, isLoading, error };
};
