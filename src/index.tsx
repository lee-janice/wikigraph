import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // React.StrictMode double-invokes renders, so this causes a glitch in the graph visualization 
  // https://stackoverflow.com/questions/48846289/why-is-my-react-component-is-rendering-twice
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);