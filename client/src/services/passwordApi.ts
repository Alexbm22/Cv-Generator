import axios from 'axios';
import { AuthService } from './auth';
import { useAuthStore } from '../Store';
import {
    ActionSessionResponse,
    CompletePasswordActionInput,
    ExchangeActionResponse,
    PasswordActionApiError,
    PasswordActionErrorCode,
    PasswordPolicyErrorCode,
} from '../interfaces/passwordAction';

/**
 * Dedicated axios instance for the password-action endpoints.
 *
 * It intentionally does NOT use the shared `apiService` client: that client's
 * interceptors treat any 401 as "access token expired" and transparently try to
 * refresh the main auth session, and it pushes every error into the global
 * error banner (`useErrorStore`). Both behaviors are wrong here — a 401 from
 * `GET /actions/session` is an expected, silent "invalid/expired link" state
 * that the password pages render inline, not a global error or a token refresh
 * trigger. Credentials/base URL otherwise match the shared client's convention.
 */
const passwordActionClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/password`,
    withCredentials: true,
    timeout: parseInt(import.meta.env.VITE_API_DEFAULT_TIMEOUT || '5000', 10),
    headers: {
        'Content-Type': 'application/json',
    },
});

const getOptionalAuthorizationHeader = async (): Promise<Record<string, string>> => {
    const authStore = useAuthStore.getState();
    if (!authStore.isAuthenticated) return {};

    let tokenData = authStore.tokenData;
    if (!tokenData || authStore.isTokenExpired()) {
        const authResponse = await AuthService.checkAuth();
        useAuthStore.getState().handleAuthSuccess(authResponse);
        tokenData = useAuthStore.getState().tokenData;
    }

    if (!tokenData?.token) {
        throw new Error('Unable to refresh the authenticated session.');
    }

    return { Authorization: `Bearer ${tokenData.token}` };
};

const authenticatedPost = async (path: string): Promise<void> => {
    const headers = await getOptionalAuthorizationHeader();
    await passwordActionClient.post(path, {}, { headers });
};

interface PasswordActionErrorBody {
    message?: string;
    errors?: { code?: unknown; errors?: unknown };
}

const ERROR_CODES: PasswordActionErrorCode[] = [
    'INVALID_PASSWORD',
    'INVALID_CURRENT_PASSWORD',
    'SAME_PASSWORD',
    'NO_PASSWORD_SET',
    'ALREADY_HAS_PASSWORD',
    'INVALID_SESSION',
    'INVALID_TOKEN',
    'UNKNOWN',
];

const isPasswordPolicyErrorCode = (value: unknown): value is PasswordPolicyErrorCode =>
    value === 'TOO_SHORT' || value === 'TOO_LONG';

/** Converts an axios error into a normalized, code-only error. Never surfaces raw backend text. */
export const toPasswordActionError = (error: unknown): PasswordActionApiError => {
    if (axios.isAxiosError<PasswordActionErrorBody>(error)) {
        const axiosError = error;
        const status = axiosError.response?.status ?? 0;
        const data = axiosError.response?.data;
        const codeValue = data?.errors?.code;
        const code = ERROR_CODES.find((supportedCode) => supportedCode === codeValue) ?? 'UNKNOWN';
        const rawPolicyErrors = data?.errors?.errors;
        return {
            status,
            code,
            policyErrors: Array.isArray(rawPolicyErrors)
                ? rawPolicyErrors.filter(isPasswordPolicyErrorCode)
                : undefined,
        };
    }
    return { status: 0, code: 'UNKNOWN' };
};

export const passwordApi = {
    forgot: async (email: string): Promise<void> => {
        await passwordActionClient.post('/forgot', { email });
    },

    requestChange: async (): Promise<void> => {
        await authenticatedPost('/change/request');
    },

    requestSet: async (): Promise<void> => {
        await authenticatedPost('/set/request');
    },

    exchange: async (token: string): Promise<ExchangeActionResponse> => {
        const headers = await getOptionalAuthorizationHeader();
        const response = await passwordActionClient.post<ExchangeActionResponse>(
            '/actions/exchange',
            { token },
            { headers }
        );
        return response.data;
    },

    getSession: async (): Promise<ActionSessionResponse> => {
        const response = await passwordActionClient.get<ActionSessionResponse>('/actions/session');
        return response.data;
    },

    complete: async (input: CompletePasswordActionInput): Promise<void> => {
        await passwordActionClient.post('/actions/complete', input);
    },

    cancel: async (): Promise<void> => {
        await passwordActionClient.post('/actions/cancel');
    },
};
