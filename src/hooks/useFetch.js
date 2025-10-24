// 🌐 useFetch Hook - Template Method Pattern for API calls
// Following Template Method Pattern and Single Responsibility Principle

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  
  const abortControllerRef = useRef();
  const mountedRef = useRef(true);

  const {
    immediate = true,
    method = 'GET',
    params = {},
    body = null,
    headers = {},
    onSuccess,
    onError,
    transform,
    retry = 0,
    retryDelay = 1000,
    cache = false,
    refetchInterval,
  } = options;

  // Template method for making the actual fetch request
  const fetchData = useCallback(async (fetchUrl = url, fetchOptions = {}) => {
    if (!fetchUrl) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const mergedOptions = {
      method,
      headers,
      body,
      ...fetchOptions,
    };

    setLoading(true);
    setError(null);

    let retryCount = 0;
    const maxRetries = retry;

    const executeRequest = async () => {
      try {
        let response;
        
        // Build URL with params
        const urlWithParams = params && Object.keys(params).length > 0
          ? `${fetchUrl}?${new URLSearchParams(params).toString()}`
          : fetchUrl;

        // Make the request based on method
        switch (mergedOptions.method.toUpperCase()) {
          case 'GET':
            response = await apiService.httpClient.get(urlWithParams, {
              signal: abortControllerRef.current.signal,
              ...mergedOptions,
            });
            break;
          case 'POST':
            response = await apiService.httpClient.post(fetchUrl, mergedOptions.body, {
              signal: abortControllerRef.current.signal,
              ...mergedOptions,
            });
            break;
          case 'PUT':
            response = await apiService.httpClient.put(fetchUrl, mergedOptions.body, {
              signal: abortControllerRef.current.signal,
              ...mergedOptions,
            });
            break;
          case 'PATCH':
            response = await apiService.httpClient.patch(fetchUrl, mergedOptions.body, {
              signal: abortControllerRef.current.signal,
              ...mergedOptions,
            });
            break;
          case 'DELETE':
            response = await apiService.httpClient.delete(fetchUrl, {
              signal: abortControllerRef.current.signal,
              ...mergedOptions,
            });
            break;
          default:
            throw new Error(`Unsupported method: ${mergedOptions.method}`);
        }

        // Transform data if transform function is provided
        const finalData = transform ? transform(response) : response;

        if (mountedRef.current) {
          setData(finalData);
          setError(null);
          setLastFetch(Date.now());
          
          // Call success callback
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(finalData);
          }
        }

        return finalData;

      } catch (err) {
        // Don't set error state if request was aborted
        if (err.name === 'AbortError') {
          return;
        }

        // Retry logic
        if (retryCount < maxRetries) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return executeRequest();
        }

        if (mountedRef.current) {
          setError(err);
          setData(null);
          
          // Call error callback
          if (onError && typeof onError === 'function') {
            onError(err);
          }
        }

        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    return executeRequest();
  }, [url, method, params, body, headers, retry, retryDelay, transform, onSuccess, onError]);

  // Template method for manual refetch
  const refetch = useCallback((newOptions = {}) => {
    return fetchData(url, newOptions);
  }, [fetchData, url]);

  // Template method for mutating data (POST, PUT, PATCH, DELETE)
  const mutate = useCallback(async (mutateUrl, mutateOptions = {}) => {
    return fetchData(mutateUrl, mutateOptions);
  }, [fetchData]);

  // Template method for updating local data without refetching
  const updateData = useCallback((updater) => {
    if (typeof updater === 'function') {
      setData(prevData => updater(prevData));
    } else {
      setData(updater);
    }
  }, []);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, url, JSON.stringify(params), JSON.stringify(body), fetchData]);

  // Auto-refetch interval
  useEffect(() => {
    if (refetchInterval && data) {
      const interval = setInterval(() => {
        refetch();
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [refetchInterval, data, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    error,
    loading,
    lastFetch,
    refetch,
    mutate,
    updateData,
  };
};

// Specialized hooks using the main useFetch hook
export const useGet = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'GET' });
};

export const usePost = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'POST', immediate: false });
};

export const usePut = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'PUT', immediate: false });
};

export const usePatch = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'PATCH', immediate: false });
};

export const useDelete = (url, options = {}) => {
  return useFetch(url, { ...options, method: 'DELETE', immediate: false });
};

export default useFetch;