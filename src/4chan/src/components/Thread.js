import React, { useState, useEffect } from "react";
import { ImageViewer } from "./ImageViewer";
import { VideoViewer } from "./VideoViewer";
import { Configuration } from "./../configuration";
import { GridViewer } from "./GridViewer";

export const Thread = ({ board, threadId, gridViewState }) => {
  let THREADS_URL = `${Configuration.Schema}://${Configuration.URL}:${Configuration.Port}/thread/${board}/${threadId}`;

  const [threads, setThreads] = useState([]);
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);

  useEffect(() => {
    const getThreads = async () => {
      const threadResult = await fetch(THREADS_URL, { method: "GET" });

      const threadObect = await threadResult.json();
      setThreads(threadObect.posts);
    };

    getThreads().catch(console.error);
  }, [board, threadId]);

  const showMedia = async (media) => {
    if (media.hasMedia && !media.isVideo) {
      const getMediaURL = `${Configuration.Schema}://${Configuration.URL}:${
        Configuration.Port
      }/media/${encodeURIComponent(media.media)}`;
      const mediaResponse = await fetch(getMediaURL);
      const mediaJson = await mediaResponse.json();
      setImage(mediaJson);
      setImageViewerVisible(true);
      setVideoViewerVisible(false);
    } else {
      const getMediaURL = `${Configuration.Schema}://${Configuration.URL}:${
        Configuration.Port
      }/media/video/${encodeURIComponent(media.media)}`;
      const mediaResponse = await fetch(getMediaURL);

      setVideo(media.media);
      setVideoViewerVisible(true);
      setImageViewerVisible(false);
    }
  };

  const hideMedia = () => {
    setImageViewerVisible(false);
    setVideoViewerVisible(false);
    gridViewState.setShowGrid(false);
  };

  return (
    <>
      {gridViewState.showGrid ? (
        <GridViewer
          board={board}
          threadId={threadId}
          onCloseGrid={hideMedia}></GridViewer>
      ) : null}

      {imageViewerVisible || videoViewerVisible ? (
        <button onClick={hideMedia}>x</button>
      ) : null}
      {videoViewerVisible ? (
        <VideoViewer onImageClick={hideMedia}></VideoViewer>
      ) : null}
      {imageViewerVisible ? (
        <ImageViewer
          no={threadId}
          image={image.media}
          onImageClick={setImageViewerVisible}></ImageViewer>
      ) : null}

      <div className="boards">
        {threads.map((t) => {
          return (
            <div className="board" id={t.no} key={t.no}>
              <div className="image-board">
                <a onClick={() => showMedia(t).catch(console.error)}>
                  {t.hasMedia ? <img src={t.thumbnail} /> : null}
                </a>
              </div>
              <div className="description-board">
                <span dangerouslySetInnerHTML={{ __html: t.com }}></span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
