import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import SeriesDetail from './pages/SeriesDetail';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { auth } = useAuth();

  if (auth.loading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={!auth.isAuthenticated ? <LandingPage /> : <Navigate to="/home" />} />
      <Route path="/login" element={!auth.isAuthenticated ? <Login /> : <Navigate to="/home" />} />
      <Route path="/register" element={!auth.isAuthenticated ? <Register /> : <Navigate to="/home" />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
