import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-bold text-black mb-2">404</h1>
            <p className="text-gray-600 mb-6">
                The page you are looking for does not exist or is unavailable.
            </p>

            <Link
                to="/home"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
                Go to Home
            </Link>
        </div>
    );
};

export default NotFound;
