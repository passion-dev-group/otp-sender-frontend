import { create } from "zustand";
import { getSites } from "./api";

interface SitesStore {
    sites: string[];
    loading: boolean;
    error: string | null;
    fetchSites: () => Promise<void>;
}

export const useSitesStore = create<SitesStore>((set) => ({
    sites: [],
    loading: false,
    error: null,

    fetchSites: async () => {
        set({ loading: true, error: null });
        try {
            const sites = await getSites();
            set({ sites, loading: false });
        } catch (error) {
            console.error("Failed to fetch sites:", error);
            set({
                error: error instanceof Error ? error.message : "Failed to fetch sites",
                loading: false,
            });
        }
    },
}));
