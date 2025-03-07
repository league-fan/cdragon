import { createFetch as createBetterFetch } from "@better-fetch/fetch";

export const createFetch = (baseURL: string) => {
  return createBetterFetch({
    baseURL,
    retry: {
      type: "exponential",
      attempts: 4,
      baseDelay: 1000,
      maxDelay: 100000,
    },
  });
};
