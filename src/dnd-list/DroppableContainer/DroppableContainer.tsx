import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import styled from "styled-components";
import { Container, ContainerProps } from "../Container";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export const DroppableContainer = ({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: UniqueIdentifier[];
  style?: React.CSSProperties;
}) => {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });
  const { setNodeRef: droppableNodeRef, isOver } = useDroppable({
    id: `${id}-droppable`,
  });
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.includes(over.id)
    : false;

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      <>
        <Dropzone
          ref={droppableNodeRef}
          style={
            isOver && String(active?.id).endsWith("-fake-container")
              ? { border: "1px solid red", borderRadius: "4px" }
              : undefined
          }
        >
          {children}
        </Dropzone>
      </>
    </Container>
  );
};

const Dropzone = styled.div`
  width: 100%;
  height: 100%;
  min-height: 48px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;
