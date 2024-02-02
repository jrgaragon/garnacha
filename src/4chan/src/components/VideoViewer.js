import React from 'react';
import { Configuration } from './../configuration';

export const VideoViewer = ({ video, onImageClick }) => {

    const closeVideo = () => {
        onImageClick(false);
    }

    return (
        <>
            <div className='image-viewer-parent' onClick={closeVideo}>
                <button onClick={closeVideo}>X</button>
                <video className='video-viewer' src={`${Configuration.Schema}://${Configuration.URL}:${Configuration.Port}/media/video?t=${new Date()}`} preload='auto' autoPlay muted controls>
                </video>
            </div>
        </>
    );
};