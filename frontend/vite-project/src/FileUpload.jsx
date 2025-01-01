import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import './FileUpload.css';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [lessonName, setLessonName] = useState(""); // State for lesson name
  const [videoUrl, setVideoUrl] = useState('');
  const navigate = useNavigate();
  const { lessonId } = useParams(); // Get the lessonId from the URL  


  const videoPlayerOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: false,
    sources: [
      {
        src: videoUrl,
        type: 'application/x-mpegURL',
      },
    ],
  };

  // Fetch the lesson details from the API
  if (lessonId) {
    useEffect(() => {
      fetch(`http://localhost:8000/lesson/${lessonId}`)
        .then((response) => response.json())
        .then((data) => {
          setLessonName(data.lessonName || '');
          setVideoUrl(data.videoUrl || '');
        })
        .catch((error) => console.error('Error fetching lesson details:', error));
    }, [lessonId]);
  }

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleLessonNameChange = (event) => {
    setLessonName(event.target.value);
  };

  const handleUpload = () => {
    
    if (!lessonName.trim()) {
      alert('Please enter a lesson name.');
      return;
    }

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append("lessonName", lessonName); // Include lesson name
    
    fetch('http://localhost:8000/lesson', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          alert('Lesson uploaded successfully!');
          navigate('/'); // Redirect back to App.jsx
        } else {
          alert('Failed to upload lesson.');
        }
      })
      .catch((error) => {
        console.error('Error uploading lesson:', error);
        alert('An error occurred while updating the lesson.');
      });
  };

  const handleUpdate = () => {
    
    if (!lessonName.trim()) {
      alert('Please enter a lesson name.');
      return;
    }

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append("lessonName", lessonName); // Include lesson name
    
    fetch(`http://localhost:8000/lesson/${lessonId}`, {
      method: 'PATCH',
      body: formData,
    }).then((response) => {
        
        if (response.ok) {
          alert('Lesson updated successfully!');
          navigate('/'); // Redirect back to App.jsx
        } else {
          alert('Failed to update lesson.');
        }
      })
      .catch((error) => {
        console.error('Error updating lesson:', error);
        alert('An error occurred while updating the lesson.');
      });
  };

  const handleCancel = () => {
    navigate('/'); // Replace '/video-listing' with your actual route for the video listing page
  };

  return (
    <div className="upload-container">
      <h1>{lessonId ? 'Edit Lesson' : 'Upload Lesson'}</h1>
      <div className="content-wrapper">
        <div className="controls">
          <div className="flex">
            <label>Lesson Name:</label>
            <br />
            <input
              type="text"
              placeholder="Enter Lesson Name"
              value={lessonName}
              onChange={handleLessonNameChange}
            />
          </div>
          <br />
          <div className="flex">
            <label>Upload New Video:</label>
            <br />
            <input type="file" accept="video/*" onChange={handleFileChange} />
          </div>
          <br />
          <div className="flex">
            {lessonId ? (
              <button className="upload-button" onClick={handleUpdate}>
                Update
              </button>
            ) : (
              <button className="upload-button" onClick={handleUpload}>
                Upload
              </button>
            )}
            &nbsp;
            <button className="upload-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
        {lessonId && videoUrl && (

          <div className="video-player">
            <VideoPlayer options={videoPlayerOptions} />

          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
