import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold text-gray-800">My App</Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
            {/* Add more navigation links here */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
