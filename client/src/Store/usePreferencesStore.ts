import { create } from 'zustand';
import { persist, devtools, createJSONStorage } from 'zustand/middleware';
import { GuestPreferences } from '../interfaces/user';

interface PreferencesStore {
    guestPreferences: GuestPreferences;
    setGuestCustomColors: (colors: string[]) => void;
}

const DEFAULT_GUEST_PREFERENCES: GuestPreferences = {
    customColors: [],
};

export const usePreferencesStore = create<PreferencesStore>()(
    devtools(
        persist(
            (set) => ({
                guestPreferences: DEFAULT_GUEST_PREFERENCES,

                setGuestCustomColors: (colors) =>
                    set(
                        (s) => ({
                            guestPreferences: {
                                ...s.guestPreferences,
                                customColors: colors,
                            },
                        }),
                        false,
                        'setGuestCustomColors'
                    ),
            }),
            {
                name: 'guest-preferences',
                storage: createJSONStorage(() => localStorage),
            }
        ),
        { name: 'PreferencesStore' }
    )
);
