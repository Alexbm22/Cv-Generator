import { arrayMove } from '@dnd-kit/sortable';

/**
 * Reorders an array of items by moving an item from one position to another,
 * identified by their unique IDs rather than array indices.
 * Returns a new array (immutable). Returns the original array if no change is needed.
 */
export function reorderById<T extends { id: string }>(
    items: T[],
    activeId: string,
    overId: string
): T[] {
    if (activeId === overId) return items;

    const oldIndex = items.findIndex(item => item.id === activeId);
    const newIndex = items.findIndex(item => item.id === overId);

    if (oldIndex === -1 || newIndex === -1) return items;

    return arrayMove(items, oldIndex, newIndex);
}
