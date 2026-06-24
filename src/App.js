import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QRScanner from './pages/QrScanner';
import FaceRecognition from './pages/FaceRecognition';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<Login />} />
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/qr-scanner"       element={<QRScanner />} />
        <Route path="/face-recognition" element={<FaceRecognition />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;