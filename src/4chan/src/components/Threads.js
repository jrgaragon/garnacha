import React, { useState, useEffect } from 'react';
import { Configuration } from './../configuration';

export const Threads = ({ board, page, setThreadId, setCurrentState }) => {
    let THREADS_URL = `${Configuration.Schema}://${Configuration.URL}:${Configuration.Port}/catalog/${board}/${page}`;
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        const getThreads = async () => {
            const threadResult = await fetch(THREADS_URL, { method: 'GET' });

            const threadObect = await threadResult.json();
            setThreads(threadObect);

        };

        getThreads().catch(console.error);

    }, [board, page]);

    const onSetThreadId = (id) => {
        console.log(id);
        setThreadId(id);
        setCurrentState('thread')
    };


    return (
        <>
            <div className="boards">
                {
                    threads.map(t => {
                        return (
                            <a href="#" key={t.no} className="board-link" onClick={() => onSetThreadId(t.no)}>
                                <div className="board" >
                                    <div className="image-board">
                                        <img src={t.thumbnail} />
                                    </div>
                                    <div className="description-board">
                                        <span dangerouslySetInnerHTML={{ __html: t.com }}></span>
                                    </div>
                                </div>
                            </a>
                        )
                    })
                }
            </div>
        </>
    );
};