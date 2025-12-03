import { useRef, useEffect, useCallback } from 'react';

interface UseKeyboardNavigationOptions {
    loop?: boolean;
    pageStep?: number;
    orientation?: 'vertical' | 'horizontal';
}

export const useKeyboardNavigation = <T extends HTMLElement>(
    itemCount: number,
    onSelect?: (index: number) => void,
    options: UseKeyboardNavigationOptions = {}
) => {
    const { loop = false, pageStep = 10, orientation = 'vertical' } = options;
    const itemRefs = useRef<(T | null)[]>([]);

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, itemCount);
    }, [itemCount]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
        const isVertical = orientation === 'vertical';
        const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
        const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

        let nextIndex: number | null = null;

        if (e.key === nextKey) {
            e.preventDefault();
            if (loop) {
                nextIndex = (index + 1) % itemCount;
            } else {
                nextIndex = Math.min(index + 1, itemCount - 1);
            }
        } else if (e.key === prevKey) {
            e.preventDefault();
            if (loop) {
                nextIndex = (index - 1 + itemCount) % itemCount;
            } else {
                nextIndex = Math.max(index - 1, 0);
            }
        } else if (e.key === 'Home') {
            e.preventDefault();
            nextIndex = 0;
        } else if (e.key === 'End') {
            e.preventDefault();
            nextIndex = itemCount - 1;
        } else if (e.key === 'PageDown') {
            e.preventDefault();
            nextIndex = Math.min(index + pageStep, itemCount - 1);
        } else if (e.key === 'PageUp') {
            e.preventDefault();
            nextIndex = Math.max(index - pageStep, 0);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(index);
        }

        if (nextIndex !== null && itemRefs.current[nextIndex]) {
            itemRefs.current[nextIndex]?.focus();
        }
    }, [itemCount, onSelect, loop, pageStep, orientation]);

    const setRef = (index: number) => (el: T | null) => {
        itemRefs.current[index] = el;
    };

    return { handleKeyDown, setRef, itemRefs };
};
