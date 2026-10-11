import { useQuery } from "@tanstack/react-query";
import { passwordApi, toPasswordActionError } from "../../../services/passwordApi";
import { ActionSessionResponse } from "../../../interfaces/passwordAction";
import { PasswordActionApiError } from "../../../interfaces/passwordAction";

/**
 * Fetches the current password-action session (set by the one-time link
 * exchange). A 401 here is an expected "no/invalid/expired session" result,
 * not an application error, so callers should branch on `isError` to render
 * the shared invalid/expired state rather than a generic error screen.
 */
export const usePasswordActionSession = () => {
  return useQuery<ActionSessionResponse, PasswordActionApiError>({
    queryKey: ["passwordActionSession"],
    queryFn: async () => {
      try {
        return await passwordApi.getSession();
      } catch (error) {
        throw toPasswordActionError(error);
      }
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
};
