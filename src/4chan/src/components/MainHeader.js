import React, { useState, useEffect } from 'react';
import {Configuration} from './../configuration';

export const MainHeader = ({ setCurrentState, onBoardChange, onPageChange, gridViewState }) => {

	const BOARD_URL = `${Configuration.Schema}://${Configuration.URL}:${Configuration.Port}/board`;
	const [selectBoard, setSelectBoard] = useState([]);
	const [page, setPage] = useState(1);

	useEffect(() => {
		const getBoards = async () => {
			let options = [];

			const boardsResult = await fetch(BOARD_URL, { method: 'GET' });
			const boardObject = await boardsResult.json();

			options = boardObject.boards.map(b => {
				return {
					board: b.board,
					title: b.title
				}
			});

			//console.log(options)

			setSelectBoard(options);
		};

		getBoards().catch(console.error);

	}, []);

	const onSetCurrentState = () => {
		setCurrentState('catalog');
	};

	const changePage = (currentPage) => {

		if (currentPage >= 1) {
			console.log({ currentPage });
			setPage(currentPage);
			onPageChange(currentPage);
		}
	};

	const showGrid = () => {
		gridViewState.setShowGrid((currentState) => !currentState);	
		console.log(gridViewState.showGrid);	
	};

	const changeBoard = (e) => {
		setPage(1);
		onBoardChange(e);
	};

	return (
		<>
			<div className="head">
				<button className="board-back" onClick={onSetCurrentState}> {'<<'} </button>
				<select className='board-select' onChange={changeBoard} >

					{selectBoard.map((option) => {
						return (
							<option id={option.board} key={option.board}>
								{`/${option.board}/ - ${option.title}`}
							</option>
						);
					})}
				</select>

				<button className="button-main-show-grid" onClick={showGrid}> {'#'} </button>
				<button className="button-main-back" onClick={() => changePage(page - 1)}> {'<<'} </button>
				<span className='page'>{page}</span>
				<button className="button-main-next" onClick={() => changePage(page + 1)}> {'>>'} </button>
			</div>
		</>
	);
};