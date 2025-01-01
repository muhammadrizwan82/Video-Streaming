import React from 'react';
import VideoPlayer from './VideoPlayer';
import { useSearchParams } from 'react-router-dom';
import './VideoplayerPage.css';

function VideoPlayerPage() {
    const [searchParams] = useSearchParams();
    const videoUrl = searchParams.get('src');
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

    return (
        <div className="video-player-container">
            <VideoPlayer options={videoPlayerOptions} />
        </div>
    );
}

export default VideoPlayerPage;
