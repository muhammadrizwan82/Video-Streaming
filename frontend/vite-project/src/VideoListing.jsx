import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VideoListing.css';

function VideoListing() {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  // Fetch videos from the API
  useEffect(() => {
    fetch('http://localhost:8000/lesson')
      .then((response) => response.json())
      .then((data) => setVideos(data.lessons.sort((a, b) => new Date(a) < new Date(b) ? 1 : -1) || []))
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);

  const handleVideoClick = (videoUrl) => {
    // Open video player in a new window
    window.open(`/video-player?src=${encodeURIComponent(videoUrl)}`, '_blank');
  };

  const handleDeleteLessonClick = (lessonId) => {
    // Open video player in a new window
    if(window.confirm("Are you sure to delete this lession?")) {
      console.log('lessonId->',lessonId)
      alert(`lessonId ${lessonId} is delete now`);

      fetch(`http://localhost:8000/lesson/${lessonId}`, {
        method: 'DELETE'        
      })
        .then((response) => {
          if (response.ok) {
            alert('Video delete successfully!');
            navigate('/'); // Redirect back to App.jsx
          } else {
            alert('Failed to delete video.');
          }
        })
        .catch((error) => {
          console.error('Error deleting video:', error);
          alert('An error occurred while deleting the video.');
        });

    }    
  };

  
  const handleEditLessionClick = (lessonId) => {
    // Open video player in a new window
    if(window.confirm("Are you sure to update this lession?")) {          
      navigate(`/upload-video/${lessonId}`);  
    }    
    
  };

  const handleUploadRedirect = () => {
    // Redirect to FileUpload page
    navigate('/upload-video');
  };

  return (
    <div className="app-container">
      <h1>Video Listing</h1>
      <div className="upload-button-container">
        <button className="upload-button" onClick={handleUploadRedirect}>
          Upload Video
        </button>
      </div>
      {videos.length > 0 ? (
        <table className="video-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Lession ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video, index) => (
              <tr key={video.lessonId}>
                <td>{index + 1}</td>
                <td>{video.lessonId}</td>
                <td>{video.lessonName}</td>
                <td>{new Date(video.createdAt).toLocaleString('en-US', { hour12: true })}</td>
                <td>
                  <button
                    onClick={() => handleVideoClick(video.videoUrl)}
                    className="play-button"
                  >
                    Play
                  </button>
                  &nbsp;
                  <button
                    onClick={() => handleEditLessionClick(video.lessonId)}
                    className="play-button"
                  >
                    Update
                  </button>
                  &nbsp;
                  <button
                    onClick={() => handleDeleteLessonClick(video.lessonId)}
                    className="play-button"
                  >
                    Delete
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

export default VideoListing;
