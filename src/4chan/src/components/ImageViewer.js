import React, { useState, useEffect } from 'react';

export const ImageViewer = ({no, image, onImageClick }) => {

    const hideMedia = () => {
        onImageClick(false);
        document.body.style.overflow = "auto";
    };

    return (
        <>
            <div className='image-viewer-parent'>
                <div className='image-viewer' >
                    <img herf={`#${no}`} onClick={hideMedia} src={image}></img>
                </div>
            </div>

        </>
    );
};