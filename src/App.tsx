
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import BreakerDetail from '@/pages/BreakerDetail';
import EditPanel from '@/pages/EditPanel';
import NotFound from '@/pages/NotFound';
import './App.css';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/breaker/:id" element={<BreakerDetail />} />
        <Route path="/edit-panel" element={<EditPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
