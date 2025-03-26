import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import styled from "styled-components";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Grid>
      <Sidebar>test</Sidebar>
      <Placeholder>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </Placeholder>
    </Grid>
  );
}

export default App;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 10px;
`;

const Sidebar = styled.div`
  background-color: #242424;
  min-height: 100vh;
  `

const Placeholder = styled.div`
    background-color: #242424;
    height: 100vh;
    display: grid;
    place-content: center;
`
