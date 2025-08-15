// src/components/Navbar/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext"; // Assuming this path is correct
import styles from "./Navbar.module.css";
import { UserCircle2 } from "lucide-react"; // Import a user icon from lucide-react (install if needed: npm install lucide-react)
import logoImage from "../../assets/polls-logo.png";

const Navbar = () => {
  const { user, dispatch } = useAuthContext();

  const handleLogout = () => {
    // Dispatch logout action
    dispatch({ type: "LOGOUT" });
    // Remove user from local storage
    localStorage.removeItem("user");
    // You might want to navigate to the login page after logout
    // import { useNavigate } from 'react-router-dom';
    // const navigate = useNavigate();
    // navigate('/login');
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.leftSection}>
        <Link to="/" className={styles.logoLink}>
          {/* Replace this with your actual logo import */}
          <img src={logoImage} alt="PollsApp Logo" className={styles.logo} />
          <h3>Voxta</h3>
        </Link>
      </div>

      <nav className={styles.navLinks}>
        <Link to="/" className={styles.navItem}>
          Home
        </Link>
        {user && ( // Only show these links if user is logged in
          <>
            <Link to="/mypolls" className={styles.navItem}>
              My Polls
            </Link>
            <Link to="/voted" className={styles.navItem}>
              Voted Polls
            </Link>{" "}
            {/* Shortened "Polls I've Voted On" */}
          </>
        )}
      </nav>

      <div className={styles.rightSection}>
        {user ? (
          <div className={styles.userInfo}>
            {user.username && ( // Display username if available
              <span className={styles.usernameText}>{user.username}</span>
            )}
            <UserCircle2 className={styles.userIcon} size={32} />{" "}
            {/* User icon */}
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        ) : (
          <div className={styles.authLinks}>
            <Link to="/login" className={styles.loginButton}>
              Login
            </Link>
            <Link to="/signup" className={styles.signupButton}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
