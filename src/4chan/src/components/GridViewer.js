import React, { useState, useEffect } from 'react';
import { Configuration } from './../configuration';
import { ImageViewer } from './ImageViewer';
import { VideoViewer } from './VideoViewer';

export const GridViewer = ({ board, threadId, onCloseGrid }) => {
    let THREADS_URL = `${Configuration.Schema}://${Configuration.URL}:${Configuration.Port}/thread/${board}/${threadId}`;

    const [thumbnails, setThumbnails] = useState([]);
    const [image, setImage] = useState('');
    const [video, setVideo] = useState('');
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [videoViewerVisible, setVideoViewerVisible] = useState(false);

    useEffect(() => {
        const getThreads = async () => {

            const threadResult = await fetch(THREADS_URL, { method: 'GET' });
            const threadObect = await threadResult.json();


            setThumbnails(threadObect.posts.map(t => {
                return {
                    threadId: t.no,
                    thumbnail: t.thumbnail,
                    hasMedia: t.hasMedia,
                    isVideo: t.isVideo,
                    media: t.media
                }
            }));

            console.log(thumbnails);
        };

        getThreads().catch(console.error);

    }, [board, threadId]);

    const showMedia = async (media) => {
        console.log(media);
        if (media.hasMedia && !media.isVideo) {
            const getMediaURL = `${Configuration.Schema}://${Configuration.URL}:${Configuration.Port}/media/${encodeURIComponent(media.media)}`;
            const mediaResponse = await fetch(getMediaURL);
            const mediaJson = await mediaResponse.json();
            setImage(mediaJson);
            setImageViewerVisible(true);
            setVideoViewerVisible(false);
        } else {
            const getMediaURL = `${Configuration.Schema}://${Configuration.URL}:${Configuration.Port}/media/video/${encodeURIComponent(media.media)}`;
            const mediaResponse = await fetch(getMediaURL);

            setVideo(media.media);
            setVideoViewerVisible(true);
            setImageViewerVisible(false);
        }
    };

    const hideMedia = () => {
        setImageViewerVisible(false);
        setVideoViewerVisible(false);
    }

    return (
        <>
            {videoViewerVisible ? <VideoViewer onImageClick={hideMedia}></VideoViewer> : null}
            {imageViewerVisible ? <ImageViewer no={threadId} image={image.media} onImageClick={setImageViewerVisible}></ImageViewer> : null}

            <div className='grid-image-viewer-parent'>
                <div className='image-viewer-grid'>
                    <span onClick={onCloseGrid}>x</span>
                    {thumbnails.map(t => {
                        return t.hasMedia ? <img
                            onClick={() => showMedia(t).catch(console.error)}
                            key={t.threadId}
                            className={t.isVideo
                                ? 'video-viewer-thumbnail'
                                : 'image-viewer-thumbnail'} src={t.thumbnail} /> : null
                    })}
                </div>
            </div>
        </>
    );

};

