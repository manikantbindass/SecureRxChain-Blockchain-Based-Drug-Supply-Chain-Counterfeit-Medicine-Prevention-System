import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Shared/Navbar';
import Layout from './components/Shared/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Manufacturer from './components/Dashboard/Manufacturer';
import Distributor from './components/Dashboard/Distributor';
import Pharmacy from './components/Dashboard/Pharmacy';
import Consumer from './components/Dashboard/Consumer';
import QRScanner from './components/Dashboard/QRScanner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/manufacturer" element={<Manufacturer />} />
            <Route path="/distributor" element={<Distributor />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/consumer" element={<QRScanner />} />
            <Route path="/verify/:id" element={<Consumer />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
