import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const ChessGame = () => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = new Chess(g.fen());
      modify(update);
      return update;
    });
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.isGameOver() || possibleMoves.length === 0) return;
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    safeGameMutate((game) => {
      game.move(possibleMoves[randomIndex]);
    });
  }

  useEffect(() => {
    if (game.turn() === 'b') {
      setTimeout(makeRandomMove, 300);
    }
    checkGameOver();
  }, [game]);

  function checkGameOver() {
    if (game.isCheckmate()) {
      setGameOver(true);
      setGameOverMessage(game.turn() === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!');
    } else if (game.isDraw()) {
      setGameOver(true);
      setGameOverMessage('Game ended in a draw!');
    } else if (game.isStalemate()) {
      setGameOver(true);
      setGameOverMessage('Game ended in a stalemate!');
    }
  }

  function onSquareClick(square) {
    function resetFirstMove(square) {
      setMoveFrom(square);
      setOptionSquares({
        [square]: { background: 'rgba(255, 255, 0, 0.4)' },
      });
    }

    // from square
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // attempt to make move
    const move = { from: moveFrom, to: square, promotion: 'q' };
    
    try {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      setGame(newGame);
      setMoveFrom('');
      setOptionSquares({});
      setTimeout(makeRandomMove, 300);
    } catch (error) {
      resetFirstMove(square);
    }
  }

  function onSquareRightClick(square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setMoveFrom('');
    setRightClickedSquares({});
    setOptionSquares({});
    setGameOver(false);
    setGameOverMessage('');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-[400px] h-[400px]">
        <Chessboard
          position={game.fen()}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          customSquareStyles={{
            ...rightClickedSquares,
            ...optionSquares,
          }}
        />
      </div>
      <Button onClick={resetGame}>Reset Game</Button>
      <AlertDialog open={gameOver}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Game Over</AlertDialogTitle>
            <AlertDialogDescription>{gameOverMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChessGame;
