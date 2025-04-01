import { CSSProperties, forwardRef, HTMLAttributes, ReactNode } from "react";
import styled, { css } from "styled-components";

import { Handle, Remove } from "../Item";

export interface Props {
  children: ReactNode;
  columns?: number;
  label?: string;
  style?: CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: HTMLAttributes<unknown>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  onClick?(): void;
  onRemove?(): void;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      horizontal,
      hover,
      onClick,
      onRemove,
      label,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      ...props
    }: Props,
    ref
  ) => {
    const Component = onClick ? "button" : "div";

    return (
      <Wrapper
        as={Component}
        $unstyled={unstyled}
        $horizontal={horizontal}
        $placeholder={placeholder}
        $scrollable={scrollable}
        $shadow={shadow}
        $hover={hover}
        {...props}
        ref={ref}
        style={
          {
            ...style,
            "--columns": columns,
          } as CSSProperties
        }
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? (
          <Header>
            {label}
            <Actions>
              {onRemove ? <Remove onClick={onRemove} /> : undefined}
              <Handle {...handleProps} />
            </Actions>
          </Header>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Wrapper>
    );
  }
);

const Wrapper = styled.div<{
  $unstyled?: boolean;
  $horizontal?: boolean;
  $placeholder?: boolean;
  $scrollable?: boolean;
  $shadow?: boolean;
  $hover?: boolean;
}>`
  display: flex;
  flex-direction: column;
  grid-auto-rows: max-content;
  overflow: hidden;
  box-sizing: border-box;
  appearance: none;
  outline: none;
  min-width: 350px;
  border-radius: 8px;
  min-height: 120px;
  transition: background-color 350ms ease;
  background-color: rgba(246, 246, 246, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 1em;

  ul {
    display: grid;
    grid-gap: 4px;
    grid-template-columns: repeat(var(--columns, 1), 1fr);
    list-style: none;
    padding: 4px 8px 24px;
    margin: 0;
  }

  ${({ $scrollable }) =>
    $scrollable &&
    css`
      ul {
        overflow-y: auto;
      }
    `}

  ${({ $placeholder }) =>
    $placeholder &&
    css`
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: rgba(0, 0, 0, 0.5);
      background-color: transparent;
      border-style: dashed;
      border-color: rgba(0, 0, 0, 0.08);

      &:hover {
        border-color: rgba(0, 0, 0, 0.15);
      }
    `}

  ${({ $hover }) =>
    $hover &&
    css`
      background-color: rgb(235, 235, 235, 1);
    `}

  ${({ $unstyled }) =>
    $unstyled &&
    css`
      overflow: visible;
      background-color: transparent !important;
      border: none !important;
    `}

  ${({ $horizontal }) =>
    $horizontal &&
    css`
      width: 100%;

      ul {
        grid-auto-flow: column;
      }
    `}

  ${({ $shadow }) =>
    $shadow &&
    css`
      box-shadow: 0 1px 10px 0 rgba(34, 33, 81, 0.1);
    `}

  &:focus-visible {
    border-color: transparent;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0), 0 0px 0px 2px #4c9ffe;
  }
`;

const Header = styled.div`
  display: flex;
  padding: 4px 16px;
  padding-right: 8px;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const Actions = styled.div`
  display: flex;

  > *:first-child:not(:last-child) {
    opacity: 0;

    &:hover {
      opacity: 1;
    }

    &:focus-visible {
      opacity: 1;
    }
  }
`;
