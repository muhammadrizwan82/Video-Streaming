import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [videos, setVideos] = useState([]);

  // Fetch videos from the API
  useEffect(() => {
    fetch('http://localhost:8000/videos')
      .then((response) => response.json())
      .then((data) => setVideos(data.lessons.sort((a, b) => new Date(a) < new Date(b) ? 1 : -1) || []))
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);

  const handleVideoClick = (videoUrl) => {
    // Open video player in a new window
    window.open(`/video-player?src=${encodeURIComponent(videoUrl)}`, '_blank');
  };

  return (
    <div className="app-container">
      <h1>Video List</h1>
      {videos.length > 0 ? (
        <table className="video-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Lession ID</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video, index) => (
              <tr key={video.lessionId}>
                <td>{index + 1}</td>
                <td>{video.lessionId}</td>
                <td>{new Date(video.createdAt).toLocaleString('en-US', { hour12: true })}</td>
                <td>
                  <button
                    onClick={() => handleVideoClick(video.videoUrl)}
                    className="play-button"
                  >
                    Play
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading videos...</p>
      )}
    </div>
  );
}

export default App;
