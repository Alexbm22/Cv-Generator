import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../Store';
import { usePreferencesStore } from '../Store/usePreferencesStore';
import { UserServerService } from '../services/UserServer';
import { GuestPreferences, UserPreferences } from '../interfaces/user';

const QUERY_KEY = ['userPreferences'] as const;

export function useUserPreferences() {
    const isUser = useAuthStore((state) => state.isAuthenticated)

    const guestPreferences = usePreferencesStore((s) => s.guestPreferences);
    const setGuestCustomColors = usePreferencesStore((s) => s.setGuestCustomColors);

    const queryClient = useQueryClient();

    const {
        data: serverPreferences,
        refetch,
        error,
        isLoading,
    } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => UserServerService.getUserPreferences(),
        staleTime: 5 * 60 * 1000,
        enabled: isUser,
    });

    const preferences: UserPreferences | GuestPreferences | undefined = isUser ? serverPreferences : guestPreferences;

    const updateCustomColors = useCallback(
        async (colors: string[]) => {
            if (isUser) {
                await UserServerService.updateCustomColors(colors);
                await refetch();
            } else {
                setGuestCustomColors(colors.slice(-20));
            }
        },
        [isUser, refetch, setGuestCustomColors]
    );

    const updateUseProfilePictureAsDefault = useCallback(
        async (value: boolean) => {
            if (isUser) {
                await UserServerService.updateProfilePicturePreference(value);
                queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            }
        },
        [isUser, queryClient]
    );

    return {
        preferences,
        isLoading: isUser ? isLoading : false,
        error: isUser ? error : null,
        refetch,
        updateCustomColors,
        updateUseProfilePictureAsDefault,
    };
}
