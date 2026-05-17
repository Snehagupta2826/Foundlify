import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddLostItem from './pages/AddLostItem';
import AddFoundItem from './pages/AddFoundItem';
import Search from './pages/Search';
import Profile from './pages/Profile';
import MyItems from './pages/MyItems';
import ItemDetails from './pages/ItemDetails';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import ClaimTracker from './pages/ClaimTracker';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/add-lost-item" element={
              <PrivateRoute>
                <AddLostItem />
              </PrivateRoute>
            } />
            <Route path="/add-found-item" element={
              <PrivateRoute>
                <AddFoundItem />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/my-items" element={
              <PrivateRoute>
                <MyItems />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />
            <Route path="/claims" element={
              <PrivateRoute>
                <ClaimTracker />
              </PrivateRoute>
            } />
            <Route path="/search" element={<Search />} />
            <Route path="/item/:type/:id" element={<ItemDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
