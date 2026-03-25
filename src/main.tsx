import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "./assets/style/reset.scss"
import "./assets/style/main.scss"
import "./assets/style/custom.scss"
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './redux/store.tsx'
import AuthProvider from './context/authContext.tsx'
import { ThemeProvider } from './context/themeContext';
import './i18n/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
)