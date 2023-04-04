import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
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
    const [history, setHistory] = useState([Array(9).fill('')]);
    const [currentMove, setCurrentMove] = useState(0);
    const [winner, setWinner] = useState('');
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];

    async function handlePlay(nextSquares: string[]) {
      const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
      setHistory(nextHistory);
      setCurrentMove(nextHistory.length - 1);
      const nextwinner: string = await invoke('calculate_winner', { squares: nextSquares });
      setWinner(nextwinner);
    }

    function jumpTo(nextMove: number) {
      setCurrentMove(nextMove);
    }

    const moves = history.map((squares, move) => {
      let description;
      if (move > 0) {
        description = 'Go to move #' + move;
      } else {
        description = 'Go to game start';
      }
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    });

    return (
      <div className="game">
        <div className="game-board">
          <Status winner={winner} xIsNext={xIsNext} />
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winner={winner} />
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
