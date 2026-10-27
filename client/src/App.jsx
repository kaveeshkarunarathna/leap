import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, useIsPresent } from 'framer-motion';
import Background from './components/Background.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { Spinner } from './components/Form.jsx';
import { useAuth } from './auth.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import BusinessPage from './pages/BusinessPage.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BusinessEditor from './pages/BusinessEditor.jsx';
import Admin from './pages/Admin.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

function Protected({ children, admin = false }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  const isPresent = useIsPresent();
  if (!ready) return <Spinner />;
  // A page that is animating out (e.g. after sign-out) must not redirect.
  if (!user && !isPresent) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (admin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);

  return (
    <>
      <Background />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/b/:slug" element={<BusinessPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/dashboard/new" element={<Protected><BusinessEditor /></Protected>} />
          <Route path="/dashboard/:id" element={<Protected><BusinessEditor /></Protected>} />
          <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  );
}
