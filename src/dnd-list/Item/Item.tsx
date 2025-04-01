import { CSSProperties, forwardRef, memo, MouseEvent, ReactElement, ReactNode, Ref, useEffect } from "react";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import styled, { css } from "styled-components";

import { Handle, Remove } from "./components";

export interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: Parameters<typeof Handle>[0];
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: CSSProperties;
  transition?: string | null;
  wrapperStyle?: CSSProperties;
  value: ReactNode;
  label: string;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: Ref<HTMLElement>;
    style: CSSProperties | undefined;
    transform: Props["transform"];
    transition: Props["transition"];
    value: Props["value"];
  }): ReactElement;
}

export const Item = memo(
  forwardRef<HTMLLIElement, Props>(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        label,
        wrapperStyle,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      const handleOnRemoveClick = (
        event: MouseEvent<HTMLButtonElement>
      ) => {
        event.stopPropagation();
        event.preventDefault();
        onRemove?.();
      };

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
        })
      ) : (
        <Wrapper
          $fadeIn={fadeIn}
          $dragOverlay={dragOverlay}
          style={
            {
              ...wrapperStyle,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(", "),
              "--translate-x": transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              "--translate-y": transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              "--scale-x": transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              "--scale-y": transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              "--index": index,
              "--color": color,
            } as CSSProperties
          }
          ref={ref}
        >
          <ItemBody
            $dragging={dragging}
            $handle={handle}
            $dragOverlay={dragOverlay}
            disabled={disabled}
            $color={color}
            style={style}
            data-cypress="draggable-item"
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            {label}
            <Actions>
              {onRemove ? <RemoveButton onClick={handleOnRemoveClick} /> : null}
              {handle ? <Handle {...handleProps} {...listeners} /> : null}
            </Actions>
          </ItemBody>
        </Wrapper>
      );
    }
  )
);

const Wrapper = styled.li<{ $fadeIn?: boolean; $dragOverlay?: boolean }>`
  width: 100%;
  display: flex;
  box-sizing: border-box;
  transform: translate3d(var(--translate-x, 0), var(--translate-y, 0), 0)
    scaleX(var(--scale-x, 1)) scaleY(var(--scale-y, 1));
  transform-origin: 0 0;
  touch-action: manipulation;

  ${({ $fadeIn }) =>
    $fadeIn &&
    css`
      animation: fadeIn 500ms ease;
    `}

  ${({ $dragOverlay }) =>
    $dragOverlay &&
    css`
      --scale: 1.05;
      --box-shadow: 0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05),
        0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15);
      --box-shadow-picked-up: 0 0 0 calc(1px / var(--scale-x, 1))
          rgba(63, 63, 68, 0.05),
        -1px 0 15px 0 rgba(34, 33, 81, 0.01),
        0px 15px 15px 0 rgba(34, 33, 81, 0.25);
      z-index: 999;
    `}

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
`;

const ItemBody = styled.div<{
  $dragging?: boolean;
  $handle?: boolean;
  $dragOverlay?: boolean;
  disabled?: boolean;
  $color?: string;
}>`
  position: relative;
  display: flex;
  flex-grow: 1;
  align-items: center;
  padding: 4px 16px;
  background-color: lightgray;
  box-shadow: 0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05),
    0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15);
  outline: none;
  border-radius: calc(4px / var(--scale-x, 1));
  box-sizing: border-box;
  list-style: none;
  transform-origin: 50% 50%;

  -webkit-tap-highlight-color: transparent;

  color: #333;
  font-weight: 400;
  font-size: 1rem;
  white-space: nowrap;

  transform: scale(var(--scale, 1));
  transition: box-shadow 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22);

  &:focus-visible {
    box-shadow: 0 0px 4px 1px #4c9ffe,
      0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05),
      0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15);
  }

  ${({ $handle }) =>
    !$handle &&
    css`
      touch-action: manipulation;
      cursor: grab;
    `}

  ${({ $dragging, $dragOverlay }) =>
    $dragging &&
    !$dragOverlay &&
    css`
      opacity: var(--dragging-opacity, 0.5);
      z-index: 0;

      &:focus {
        box-shadow: 0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05),
          0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15);
      }
    `}

  &.disabled {
    color: #999;
    background-color: #f1f1f1;

    &:focus {
      box-shadow: 0 0px 4px 1px rgba(0, 0, 0, 0.1),
        0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05),
        0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15);
    }

    cursor: not-allowed;
  }

  ${({ $dragOverlay }) =>
    $dragOverlay &&
    css`
      cursor: inherit;
      animation: pop 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22);
      transform: scale(var(--scale));
      box-shadow: var(--box-shadow-picked-up);
      opacity: 1;
    `}

  ${({ $color }) =>
    $color &&
    css`
      &:before {
        content: "";
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: 0;
        height: 100%;
        width: 3px;
        display: block;
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
        background-color: var(--color);
      }
    `}

  @keyframes pop {
    0% {
      transform: scale(1);
      box-shadow: var(--box-shadow);
    }

    100% {
      transform: scale(var(--scale));
      box-shadow: var(--box-shadow-picked-up);
    }
  }
`;

const RemoveButton = styled(Remove)`
  opacity: 0;

  &:hover {
    opacity: 1;
  }
`;

const Actions = styled.span`
  display: flex;
  align-self: flex-start;
  margin-top: -12px;
  margin-left: auto;
  margin-bottom: -15px;
  margin-right: -10px;
`;
