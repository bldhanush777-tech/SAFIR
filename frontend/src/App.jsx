import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ConsoleFrame from './components/layout/ConsoleFrame';

// 10 Core Application Pages
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Experiments from './pages/Experiments';
import ExperimentDetail from './pages/ExperimentDetail';
import Compare from './pages/Compare';
import HabitatRanking from './pages/HabitatRanking';
import ResearchGaps from './pages/ResearchGaps';
import Visualizations from './pages/Visualizations';
import EarthApplications from './pages/EarthApplications';
import Sources from './pages/Sources';

// SpaceFire Decision Platform (SAFIR) - Fixed Full-Screen SPA Bento Dashboard (/app)
import SafirPlatform from './pages/SafirPlatform';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dedicated Fixed Full-Screen SPA Bento Dashboard */}
        <Route path="/app" element={<SafirPlatform />} />
        {/* Backwards compatibility alias */}
        <Route path="/safir" element={<Navigate to="/app" replace />} />

        {/* Multi-Module Aerospace Console Framework & Cinematic Landing Page (/) */}
        <Route
          path="/*"
          element={
            <ConsoleFrame>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/experiments" element={<Experiments />} />
                <Route path="/experiments/:code" element={<ExperimentDetail />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/habitat-ranking" element={<HabitatRanking />} />
                <Route path="/research-gaps" element={<ResearchGaps />} />
                <Route path="/visualizations" element={<Visualizations />} />
                <Route path="/earth-applications" element={<EarthApplications />} />
                <Route path="/sources" element={<Sources />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ConsoleFrame>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
