import { BrowserRouter as Router, Routes } from "react-router-dom"
import { AuthProvider } from "./components/AuthProvider"

// Importez vos composants existants
// import { HomePage } from './pages/HomePage';
// import { AdminDashboard } from './pages/AdminDashboard';
// import { LoginPage } from './pages/LoginPage';
// etc...

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Vos routes existantes - ne changez rien ici */}
            {/* <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            etc... */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
