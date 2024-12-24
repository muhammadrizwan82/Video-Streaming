import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function FileUpload() {
  const [file, setFile] = useState(null);
  const [lessonName, setLessonName] = useState(""); // State for lesson name
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleLessonNameChange = (event) => {
    setLessonName(event.target.value);
};

  const handleUpload = () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    if (!lessonName.trim()) {
      alert("Please enter a lesson name.");
      return;
    }


    const formData = new FormData();
    formData.append('file', file);
    formData.append("lessonName", lessonName); // Include lesson name

    fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          alert('Video uploaded successfully!');
          navigate('/'); // Redirect back to App.jsx
        } else {
          alert('Failed to upload video.');
        }
      })
      .catch((error) => {
        console.error('Error uploading video:', error);
        alert('An error occurred while uploading the video.');
      });
  };

  return (
    <div className="upload-container">
      <h1>Upload Video</h1>
       <input
                type="text"
                placeholder="Enter Lesson Name"
                value={lessonName}
                onChange={handleLessonNameChange}
            />
            <br/>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button className="upload-button" onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}

export default FileUpload;
