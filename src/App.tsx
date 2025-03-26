import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import dndLogo from "./assets/dnd-kit-docs-gradient-logo.svg";
import "./App.css";
import styled from "styled-components";
import { DndList } from "./dnd-list/DndList";

function App() {
  return (
    <Grid>
      <Sidebar>
        <DndList vertical />
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
        <h1>Vite + React + Dndkit</h1>
        <p className="read-the-docs">
          Click on the logos to learn more
        </p>
      </Placeholder>
    </Grid>
  );
}

export default App;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1200px 1fr;
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
