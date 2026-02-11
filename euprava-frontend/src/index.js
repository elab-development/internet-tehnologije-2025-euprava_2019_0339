import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
//Ovo je root u okviru index.html tj. onaj div sa tim ID-ijem
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
