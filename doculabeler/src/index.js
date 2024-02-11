import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import LoginComponent from './login'
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  //NOTA!! Con React.StrictMode tutti i componenti vengono montati 2 volte
  //Per questo tutte le chiamate al server che dovrebbero essere fatte 1 sola volta
  //in realtà lo fanno 2 volte. A volte rompe delle cose.
  //React.StrictMode>
  <App />
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
