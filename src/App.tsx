import { Reducer, useEffect, useReducer, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { AsyncActionHandlers, useReducerAsync } from "use-reducer-async";

type State = {
  history: string[][],
  currentMove: number,
  winner: string,
};

const initialState: State = {
  history: [Array(9).fill('')],
  currentMove: 0,
  winner: '',
};

type Action =
  | { type: 'play', nextSquares: string[] }
  | { type: 'winner', currentSquares: string[] }
  | { type: 'setWinner', nextWinner: string }
  | { type: 'jumpTo', nextMove: number };

type AsyncAction = 
  | { type: 'TAP', nextSquares: string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'play':
      console.log('普通のplayだよ');
      const nextHistory = [...state.history.slice(0, state.currentMove + 1), action.nextSquares];
      return {
        history: nextHistory,
        currentMove: nextHistory.length - 1,
        winner: '',
      };
    case 'winner':
      return state;
    case 'setWinner':
      console.log('winner');
      console.log(state);
      return {
        ...state,
        winner: action.nextWinner,
      };

    case 'jumpTo':
      return {
        ...state,
        currentMove: action.nextMove,
      };
    default:
      throw new Error();
  }
}

const asyncActionHandlers: AsyncActionHandlers<Reducer<any, any>, AsyncAction> = {
  TAP: ({ dispatch }) => async (action: AsyncAction) => {
    console.log('asyncからのplayだよ');
    dispatch({ type: 'play', nextSquares: action.nextSquares });
    const nextWinner: string = await invoke('calculate_winner', { squares: action.nextSquares });
    dispatch({ type: 'setWinner', nextWinner });
  }
}

function App() {
  const [state, dispatch] = useReducerAsync(reducer, initialState, asyncActionHandlers);
  function Square({ value, onSquareClick }: { value: string; onSquareClick: () => void }) {
    return (
      <button className="square" onClick={onSquareClick}>
        {value}
      </button>
    );
  }

  function Board({ xIsNext, squares, winner, onPlay }: { xIsNext: boolean; squares: string[]; winner: string, onPlay: (nextSquares: string[]) => void }) {
    function handleClick(i: number) {
      if (winner !== '' || squares[i]) {
        return;
      }
      const nextSquares = squares.slice();
      if (xIsNext) {
        nextSquares[i] = 'X';
      } else {
        nextSquares[i] = 'O';
      }
      onPlay(nextSquares);
    }

    return (
      <>
        <div className="board-row">
          <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
          <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
          <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
        </div>
        <div className="board-row">
          <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
          <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
          <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
        </div>
        <div className="board-row">
          <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
          <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
          <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
        </div>
      </>
    );
  }

  function Status({ winner, xIsNext }: { winner: string, xIsNext: boolean }) {
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (xIsNext ? 'X' : 'O');
    }
    return (
      <div className="status">{status}</div>
    );
  }

  function Game() {
    console.log('Game');
    const xIsNext = state.currentMove % 2 === 0;
    const currentSquares = state.history[state.currentMove];

    const moves = state.history.map((_squares, move: number) => {
      let description;
      if (move > 0) {
        description = 'Go to move #' + move;
      } else {
        description = 'Go to game start';
      }
      return (
        <li key={move}>
          <button onClick={() => dispatch({ type: 'jumpTo', nextMove: move})}>{description}</button>
        </li>
      );
    });

    return (
      <div className="game">
        <div className="game-board">
          <Status winner={state.winner} xIsNext={xIsNext} />
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={(nextSquares: string[]) => dispatch({ type: 'TAP', nextSquares: nextSquares})} winner={state.winner} />
        </div>
        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Game />
    </div>
  );
}

export default App;
