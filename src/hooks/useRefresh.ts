import { useState, useCallback } from 'react';

interface UseRefreshOptions {
    onRefresh: () => Promise<void>;
    initialLoading?: boolean;
}

interface UseRefreshReturn {
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useRefresh = ({
    onRefresh,
    initialLoading = false
}: UseRefreshOptions): UseRefreshReturn => {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(initialLoading);

    const handleRefresh = useCallback(async () => {
        if (refreshing) return; // Prevent multiple simultaneous refreshes

        setRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [onRefresh, refreshing]);

    return {
        refreshing,
        onRefresh: handleRefresh,
        loading,
        setLoading,
    };
};

export default useRefresh;
