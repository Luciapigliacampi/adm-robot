import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import AppRouter from './AppRouter.jsx';
import './App.css';
import './index.css';

//mismo dominio y tenant que el front del control 
const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos TODO con Auth0Provider */}
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      cacheLocation="localstorage"       
      useRefreshTokens={true}            
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Auth0Provider>
  </StrictMode>
);
