// src/App.js
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PollDetail from "./pages/PollDetail";
import VotedPolls from "./pages/VotedPolls";
import MyPolls from "./pages/MyPolls"; // <--- IMPORT MyPolls
import Navbar from "./components/Navbar/Navbar";
import { useAuthContext } from "./hooks/useAuthContext";

const AppContent = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  const showNavbar =
    location.pathname !== "/login" && location.pathname !== "/signup";

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="pages">
        <Routes>
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/" />}
          />
          <Route path="/poll/:id" element={<PollDetail />} />
          <Route
            path="/voted"
            element={user ? <VotedPolls /> : <Navigate to="/login" />}
          />
          {/* Add route for My Polls */}
          <Route
            path="/mypolls"
            element={user ? <MyPolls /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <div className="App">
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
