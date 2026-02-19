import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const PrivateRoute = () => {
    const { auth } = useAuth();

    return auth.isAuthenticated ? (
        <>
            <Navbar />
            <div className="pt-16 min-h-screen bg-[#141414] text-white">
                <Outlet />
            </div>
        </>
    ) : (
        <Navigate to="/login" />
    );
};

export default PrivateRoute;
