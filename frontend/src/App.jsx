import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import SeriesDetail from './pages/SeriesDetail';
import Watchlist from './pages/Watchlist';
import GenrePage from './pages/GenrePage';
import SearchResults from './pages/SearchResults';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import FriendWatchlist from './pages/FriendWatchlist';
import PrivateRoute from './components/PrivateRoute';
import PageTransition from './components/PageTransition';
import { Toaster } from 'react-hot-toast';

function App() {
  const { auth } = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1c23',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px 24px',
          },
          success: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          }
        }}
      />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            {!auth.isAuthenticated ? <LandingPage /> : <Navigate to="/home" />}
          </PageTransition>
        } />
        <Route path="/login" element={
          <PageTransition>
            {!auth.isAuthenticated ? <Login /> : <Navigate to="/home" />}
          </PageTransition>
        } />
        <Route path="/register" element={
          <PageTransition>
            {!auth.isAuthenticated ? <Register /> : <Navigate to="/home" />}
          </PageTransition>
        } />
        <Route path="/verify-otp" element={
          <PageTransition>
            <VerifyOtp />
          </PageTransition>
        } />

        <Route element={<PrivateRoute />}>
          <Route path="/home" element={
            <PageTransition>
              <Home />
            </PageTransition>
          } />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route path="/profile" element={
            <PageTransition>
              <Profile />
            </PageTransition>
          } />
          <Route path="/profile/:userId" element={
            <PageTransition>
              <Profile />
            </PageTransition>
          } />
          <Route path="/watchlist" element={
            <PageTransition>
              <Watchlist />
            </PageTransition>
          } />
          <Route path="/genre/:genreName" element={
            <PageTransition>
              <GenrePage />
            </PageTransition>
          } />
          <Route path="/search" element={
            <PageTransition>
              <SearchResults />
            </PageTransition>
          } />
          <Route path="/friends" element={
            <PageTransition>
              <Friends />
            </PageTransition>
          } />
          <Route path="/friends/watchlist/:id" element={
            <PageTransition>
              <FriendWatchlist />
            </PageTransition>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
    </>
  );
}

export default App;
