import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

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
    const possibleMoves = game.moves({ verbose: true });
    if (game.isGameOver() || possibleMoves.length === 0) return;
  
    let validMove = null;
    while (possibleMoves.length > 0 && !validMove) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      const move = possibleMoves[randomIndex];
      try {
        validMove = game.move(move);
      } catch (error) {
        console.error('Invalid move:', error);
        possibleMoves.splice(randomIndex, 1);
      }
    }

    if (validMove) {
      safeGameMutate((g) => {
        g.move(validMove);
      });
    } else {
      console.error('No valid moves available');
      toast.error('AI couldn\'t make a move. Resetting the game.');
      resetGame();
    }
  }

  useEffect(() => {
    if (!gameOver && game.turn() === 'b') {
      const timer = setTimeout(makeRandomMove, 300);
      return () => clearTimeout(timer);
    }
    checkGameOver();
  }, [game, gameOver]);

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
    const resetFirstMove = (square) => {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);
        const moves = game.moves({ square: square, verbose: true });
        const newOptionSquares = {};
        moves.forEach((move) => {
          newOptionSquares[move.to] = {
            background: 'rgba(255, 255, 0, 0.4)',
            borderRadius: '50%',
          };
        });
        setOptionSquares(newOptionSquares);
      }
    };

    // If no piece is selected yet, select the piece
    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    // If a piece is already selected, try to make a move
    try {
      const move = game.move({
        from: moveFrom,
        to: square,
        promotion: 'q', // always promote to queen for simplicity
      });

      if (move === null) {
        // If the move was invalid, reset the first move
        resetFirstMove(square);
        return;
      }

      // If the move was valid, update the game state
      setGame(new Chess(game.fen()));
      setMoveFrom('');
      setOptionSquares({});

      // Make an AI move after a short delay
      setTimeout(makeRandomMove, 300);
    } catch (error) {
      console.error('Invalid move:', error);
      toast.error('Invalid move. Please try again.');
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
