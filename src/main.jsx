import { StrictMode, useState, useEffect, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DiaryPage from './DiaryPage.jsx'
import MemoriesPage from './MemoriesPage.jsx'

function useHash() {
  return useSyncExternalStore(
    (cb) => { window.addEventListener("hashchange", cb); return () => window.removeEventListener("hashchange", cb); },
    () => window.location.hash,
  );
}

function Router() {
  const hash = useHash();

  if (hash === "#/diary") return <DiaryPage />;
  if (hash === "#/memories") return <MemoriesPage />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router />
  </StrictMode>,
)
