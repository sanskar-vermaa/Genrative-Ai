import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Chat from './pages/Chat.jsx';
import Presets from './pages/Presets.jsx';
import Usage from './pages/Usage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Chat />} />
        <Route path="presets" element={<Presets />} />
        <Route path="usage" element={<Usage />} />
      </Route>
      {/* Old account pages now go straight to the app */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
