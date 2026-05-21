import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'

// Home and Cocoons pages — placeholders until built
import Home    from './pages/Home'
import Cocoons from './pages/Cocoons'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />}      />
        <Route path="/cocoons"   element={<Cocoons />}   />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
