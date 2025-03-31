import { useState } from "react";
import styled from "styled-components";
import { UniqueIdentifier } from "@dnd-kit/core";

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import dndLogo from "./assets/dnd-kit-docs-gradient-logo.svg";
import { DndList } from "./dnd-list/DndList";
import { Items } from "./dnd-list/types";
import { createRange } from "./dnd-list/createRange";
import "./App.css";

const itemCount = 3;

function App() {
  const [items, setItems] = useState<Items>(() => ({
    ["1-container"]: createRange(
      itemCount,
      (index: number) => `A${index + 1}-item`
    ),
    ["2-container"]: createRange(
      itemCount,
      (index: number) => `B${index + 1}-item`
    ),
    ["3-container"]: createRange(
      itemCount,
      (index: number) => `C${index + 1}-item`
    ),
    ["4-container"]: createRange(
      itemCount,
      (index: number) => `D${index + 1}-item`
    ),
  }));

  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );

  const remappedItems: UniqueIdentifier[] = containers
    .map((c) => items[c])
    .flat();

  return (
    <Grid>
      <Sidebar>
        <DndList
          vertical
          {...{ items, setItems, containers, setContainers, handle: true }}
        />
      </Sidebar>
      <Placeholder>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
          <a href="https://docs.dndkit.com/" target="_blank">
            <img src={dndLogo} className="logo dndkit" alt="Dndkit logo" />
          </a>
        </div>
        <h1>Vertical nested list POC</h1>
        <p className="read-the-docs">Items order:</p>
        <PreviewWrapper>
          <Preview>
            {remappedItems.map((i) => (
              <li key={String(i)}>{i}</li>
            ))}
          </Preview>
        </PreviewWrapper>
      </Placeholder>
    </Grid>
  );
}

export default App;

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto 640px;
  gap: 10px;
  height: 100vh;
`;

const Sidebar = styled.div`
  background-color: #242424;
  color: #000;
  overflow-y: scroll;
`;

const Placeholder = styled.div`
  background-color: #242424;
  height: 100vh;
  display: grid;
  place-content: center;
`;

const PreviewWrapper = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  overflow-y: auto;
`;

const Preview = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  flex-grow: 0;
  flex-shrink: 1;
`;
