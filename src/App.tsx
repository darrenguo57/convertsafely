import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import About from '@/pages/about/About';
import Privacy from '@/pages/legal/Privacy';
import Terms from '@/pages/legal/Terms';
import ImageConverter from '@/pages/converter/ImageConverter';
import PDFConverter from '@/pages/converter/PDFConverter';
import AudioConverter from '@/pages/converter/AudioConverter';
import VideoConverter from '@/pages/converter/VideoConverter';
import Pricing from '@/pages/pricing/Pricing';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import Dashboard from '@/pages/dashboard/Dashboard';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}> {/* Default layout without ads */}
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="converter/image" element={<ImageConverter />} />
          <Route path="converter/pdf" element={<PDFConverter />} />
          <Route path="converter/audio" element={<AudioConverter />} />
          <Route path="converter/video" element={<VideoConverter />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}
