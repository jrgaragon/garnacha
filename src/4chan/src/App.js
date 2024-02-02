import React, { useState, useEffect } from 'react';

import './App.css';
import { MainHeader } from './components/MainHeader';
import { Threads } from './components/Threads';
import { Thread } from './components/Thread';

function App() {

  const [board, setBoard] = useState('b');
  const [page, setPage] = useState('1');
  const [threadId, setThreadId] = useState(null);
  const [currentState, setCurrentState] = useState('catalog');
  const [showGrid, setShowGrid] = useState(false);


  const onBoardChange = (e) => {
    const index = e.target.selectedIndex;
    const el = e.target.childNodes[index]
    const option = el.getAttribute('id');
    setBoard(option);
    setCurrentState('catalog');
  };

  const onPageChange = (e) => {
    setPage(e);
  };

  return (
    <div className="App">
      <div className="parent">
        <MainHeader
          gridViewState={{ showGrid: showGrid, setShowGrid: setShowGrid }}
          setCurrentState={setCurrentState}
          onBoardChange={onBoardChange}
          onPageChange={onPageChange}></MainHeader>
        {currentState === "catalog"
          ? <Threads
            board={board}
            page={page}
            setThreadId={setThreadId}
            setCurrentState={setCurrentState}></Threads> : null}
        {currentState === 'thread'
          ? <Thread
            gridViewState={{ showGrid: showGrid, setShowGrid: setShowGrid }}
            board={board}
            threadId={threadId}></Thread> : null}

      </div>

    </div>
  );
}

export default App;
