import React, { useCallback, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import type { Section } from '../../../../../interfaces/cv';

interface SortableSectionListProps {
    sections: Section[];
    onReorder: (activeId: string, overId: string) => void;
    children: React.ReactNode;
}

const modifiers = [restrictToVerticalAxis, restrictToParentElement];

const SortableSectionList: React.FC<SortableSectionListProps> = ({
    sections,
    onReorder,
    children,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const sectionIds = useMemo(
        () => sections.map(s => s.id),
        [sections]
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;
            onReorder(String(active.id), String(over.id));
        },
        [onReorder]
    );

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={modifiers}
        >
            <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
        </DndContext>
    );
};

export default React.memo(SortableSectionList);
