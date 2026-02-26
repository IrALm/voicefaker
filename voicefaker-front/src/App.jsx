import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Generate from './pages/Generate';
import Files from './pages/Files';
import Stats from './pages/Stats';

const layoutStyle = {
  display: 'flex',
  height: '100vh',
  position: 'relative',
  zIndex: 1,
};

const mainStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '40px 48px',
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={layoutStyle}>
        <Navbar />
        <main style={mainStyle}>
          <Routes>
            <Route path="/" element={<Navigate to="/generate" replace />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/files" element={<Files />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}