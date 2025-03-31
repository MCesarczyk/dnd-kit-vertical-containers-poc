import { CSSProperties, ReactElement } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

import { Item } from "../Item";
import { useMountStatus } from "./useMountStatus";
import { getColor } from "../helpers";

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  label: string;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: unknown): CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  renderItem?(): ReactElement;
  wrapperStyle({ index }: { index: number }): CSSProperties;
  onRemove?(): void;
}

export const SortableItem = ({
  disabled,
  id,
  label,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
  onRemove,
}: SortableItemProps) => {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={id}
      label={label}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      onRemove={onRemove}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
    />
  );
}
