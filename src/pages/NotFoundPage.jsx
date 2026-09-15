import { Link } from "react-router-dom";
import PageSEO from "../components/common/PageSEO";

const NotFoundPage = () => {
  return (
    <>
      <PageSEO title="404 - Page Not Found" description="The page you're looking for does not exist." />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
        <h1 className="text-9xl font-extrabold text-lily opacity-20">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-600 max-w-md mb-8">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="bg-lily text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-lily/30 hover:bg-lily/90 transition-all active:scale-95"
        >
          Go Back Home
        </Link>
      </div>
    </>
  );
};

export default NotFoundPage;
