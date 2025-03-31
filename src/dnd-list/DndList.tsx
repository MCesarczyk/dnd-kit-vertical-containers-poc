import {
  CSSProperties,
  Dispatch,
  JSXElementConstructor,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import {
  CancelDrop,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Modifiers,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  KeyboardCoordinateGetter,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  SortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { coordinateGetter as multipleContainersCoordinateGetter } from "./multipleContainersKeyboardCoordinates";
import { Container } from "./Container";
import { Item } from "./Item";
import { Items } from "./types";
import { getColor, getNewFakeContainerId, getNextContainerId } from "./helpers";
import { SortableItem } from "./SortableItem";
import { DroppableContainer } from "./DroppableContainer";
import { useCollisionDetectionStrategy } from "./useCollisionDetectionStrategy";

export default {
  title: "Presets/Sortable/Multiple Containers",
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

interface Props {
  items: Items;
  setItems: Dispatch<SetStateAction<Items>>;
  containers: UniqueIdentifier[];
  setContainers: Dispatch<SetStateAction<UniqueIdentifier[]>>;
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): CSSProperties;
  wrapperStyle?(args: { index: number }): CSSProperties;
  handle?: boolean;
  renderItem?: <P>() => ReactElement<
    unknown,
    string | JSXElementConstructor<P>
  >;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

const PLACEHOLDER_ID = "placeholder";
const empty: UniqueIdentifier[] = [];

export function DndList({
  items,
  setItems,
  containers,
  setContainers,
  adjustScale = false,
  cancelDrop,
  columns,
  handle = false,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  vertical = false,
  scrollable,
}: Props) {
  const {
    collisionDetectionStrategy,
    setActiveId,
    recentlyMovedToNewContainer,
    activeId,
  } = useCollisionDetectionStrategy(items);

  const isSortingContainer =
    activeId != null ? containers.includes(activeId) : false;

  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  };

  const getIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id);
    setClonedItems(items);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const overId = over?.id;

    if (overId == null || active.id in items) {
      return;
    }

    const overContainer = findContainer(overId);
    const activeContainer = findContainer(active.id);

    if (!overContainer || !activeContainer) {
      return;
    }

    if (activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];
        const overIndex = overItems.indexOf(overId);
        const activeIndex = activeItems.indexOf(active.id);

        let newIndex: number;

        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        recentlyMovedToNewContainer.current = true;

        return {
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (item) => item !== active.id
          ),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length
            ),
          ],
        };
      });
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id in items && over?.id) {
      setContainers((containers) => {
        const activeIndex = containers.indexOf(active.id);
        const overIndex = containers.indexOf(over.id);

        return arrayMove(containers, activeIndex, overIndex);
      });
    }

    const activeContainer = findContainer(active.id);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    const overId = over?.id;

    if (overId == null) {
      setActiveId(null);
      return;
    }

    const fakeContainerContent = items[activeContainer][0];
    const droppableContainer = String(overId).endsWith("-container-droppable")
      ? overId
      : undefined;
    const droppableContainerParent = droppableContainer
      ? String(droppableContainer).replace("-droppable", "")
      : undefined;

    if (droppableContainer && droppableContainerParent) {
      setItems((items) => {
        const newItems: Items = items;
        delete newItems[activeContainer];

        return {
          ...newItems,
          [droppableContainerParent]: [
            ...(items[droppableContainerParent] || []),
            fakeContainerContent,
          ],
        };
      });
      setContainers((containers) =>
        containers.filter((id) => id !== activeContainer)
      );
    }

    if (
      (overId === PLACEHOLDER_ID || overId === "placeholder-droppable") &&
      !String(active.id).endsWith("-fake-container")
    ) {
      const newContainerId = getNewFakeContainerId(items);

      unstable_batchedUpdates(() => {
        setContainers((containers) => [...containers, newContainerId]);
        setItems((items) => ({
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (id) => id !== activeId
          ),
          [newContainerId]: [active.id],
        }));
        setActiveId(null);
      });
      return;
    }

    const overContainer = findContainer(overId);

    if (overContainer) {
      const activeIndex = items[activeContainer].indexOf(active.id);
      const overIndex = items[overContainer].indexOf(overId);

      if (activeIndex !== overIndex) {
        setItems((items) => ({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        }));
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    if (clonedItems) {
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items, recentlyMovedToNewContainer]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      cancelDrop={cancelDrop}
      onDragCancel={handleDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gap: 20,
          height: "100%",
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          <DroppableContainer
            id={PLACEHOLDER_ID}
            disabled={isSortingContainer}
            items={empty}
            placeholder
            style={{
              display: "flex",
              flexDirection: vertical ? "column" : "row",
              gap: 10,
              height: "100%",
              ...containerStyle,
            }}
          >
            {containers.map((containerId) => {
              const fake = String(containerId).endsWith("-fake-container");
              return (
                <>
                  {fake ? (
                    <SortableItem
                      key={containerId}
                      id={containerId}
                      index={containers.indexOf(containerId)}
                      handle={handle}
                      style={getItemStyles}
                      wrapperStyle={wrapperStyle}
                      renderItem={renderItem}
                      containerId={containerId}
                      getIndex={getIndex}
                    />
                  ) : (
                    <DroppableContainer
                      key={containerId}
                      id={containerId}
                      label={minimal ? undefined : `Container ${containerId}`}
                      columns={columns}
                      items={items[containerId]}
                      scrollable={scrollable}
                      style={containerStyle}
                      unstyled={minimal}
                      onRemove={() => handleRemove(containerId)}
                    >
                      <SortableContext
                        items={items[containerId]}
                        strategy={strategy}
                      >
                        {items[containerId].map((value, index) => {
                          return (
                            <SortableItem
                              disabled={isSortingContainer}
                              key={value}
                              id={value}
                              index={index}
                              handle={handle}
                              style={getItemStyles}
                              wrapperStyle={wrapperStyle}
                              renderItem={renderItem}
                              containerId={containerId}
                              getIndex={getIndex}
                            />
                          );
                        })}
                      </SortableContext>
                    </DroppableContainer>
                  )}
                </>
              );
            })}
            <button onClick={handleAddContainer}>Add container</button>
          </DroppableContainer>
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId
            ? containers.includes(activeId) &&
              String(activeId).endsWith("-fake-container")
              ? renderSortableItemDragOverlay(activeId)
              : String(activeId).endsWith("-container")
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  function renderSortableItemDragOverlay(id: UniqueIdentifier) {
    return (
      <Item
        value={id}
        handle={handle}
        style={getItemStyles({
          containerId: findContainer(id) as UniqueIdentifier,
          overIndex: -1,
          index: getIndex(id),
          value: id,
          isSorting: true,
          isDragging: true,
          isDragOverlay: true,
        })}
        color={getColor(id)}
        wrapperStyle={wrapperStyle({ index: 0 })}
        renderItem={renderItem}
        dragOverlay
      />
    );
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    return (
      <Container
        label={`Container ${containerId}`}
        columns={columns}
        style={{
          height: "100%",
        }}
        shadow
        unstyled={false}
      >
        {items[containerId].map((item, index) => (
          <Item
            key={item}
            value={item}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(item),
              value: item,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            color={getColor(item)}
            wrapperStyle={wrapperStyle({ index })}
            renderItem={renderItem}
          />
        ))}
      </Container>
    );
  }

  function handleRemove(containerID: UniqueIdentifier) {
    setItems((items) => {
      const newItems = { ...items };
      items[containerID].forEach((item, index) => {
        const newContainerId = getNewFakeContainerId(items, index);
        newItems[newContainerId] = [...(newItems[newContainerId] || []), item];
      });

      delete newItems[containerID];

      return newItems;
    });
    setContainers((containers) => {
      const newContainers = [...containers.filter((id) => id !== containerID)];
      items[containerID].forEach((_, index) => {
        const newContainerId = getNewFakeContainerId(items, index);
        newContainers.push(newContainerId);
      });

      return newContainers;
    });
    setActiveId(null);
    setClonedItems(null);
  }

  function handleAddContainer() {
    const newContainerId = getNextContainerId(items);

    unstable_batchedUpdates(() => {
      setContainers((containers) => [...containers, newContainerId]);
      setItems((items) => ({
        ...items,
        [newContainerId]: [],
      }));
    });
  }
}
