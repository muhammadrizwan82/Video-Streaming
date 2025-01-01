import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
   <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/upload-video" element={<FileUpload />} />
        <Route path="/video-player" element={<VideoPlayerPage />} />
      </Routes>
    </Router>
}
export default App