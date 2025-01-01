import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import VideoPlayerPage from './VideoPlayerPage';
import FileUpload from './FileUpload';
import VideoListing from './VideoListing';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<VideoListing />} />
        <Route path="/upload-video" element={<FileUpload />} />
        <Route path="/upload-video/:lessonId" element={<FileUpload />} />
        <Route path="/video-player" element={<VideoPlayerPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
