import ChessGame from '@/components/ChessGame';

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Chess Game vs AI</h1>
      <ChessGame />
    </div>
  );
};

export default Index;
