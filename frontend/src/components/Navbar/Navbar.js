// src/components/Navbar/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext"; // Assuming this path is correct
import styles from "./Navbar.module.css";
import {
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
  List,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import your logo image. Make sure the path is correct.
import logoImage from "../../assets/polls-logo.png";

const Navbar = () => {
  const { user, dispatch } = useAuthContext();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Effect to handle clicks outside of the dropdown menus to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        // We also check the hamburger button itself
        if (!event.target.closest(`.${styles.mobileMenuButton}`)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("user");
    setIsUserMenuOpen(false); // Close menu on logout
    // Consider navigating to home or login page
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Animation variants for Framer Motion
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15 } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 260, damping: 30 },
    },
    exit: { opacity: 0, x: "100%", transition: { duration: 0.2 } },
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo and Brand Name */}
        <Link to="/" className={styles.logoLink} onClick={closeMobileMenu}>
          <img src={logoImage} alt="Voxta Logo" className={styles.logo} />
          <h1 className={styles.brandName}>Voxta</h1>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={styles.navLinks}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
            }
          >
            <Home size={18} />
            <span>Home</span>
          </NavLink>
          {user && ( // Only show these links if the user is logged in
            <>
              <NavLink
                to="/mypolls"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navItem} ${styles.active}`
                    : styles.navItem
                }
              >
                <List size={18} />
                <span>My Polls</span>
              </NavLink>
              <NavLink
                to="/voted"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navItem} ${styles.active}`
                    : styles.navItem
                }
              >
                <CheckSquare size={18} />
                <span>Voted Polls</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Section: Auth buttons or User Menu */}
        <div className={styles.rightSection}>
          {user ? (
            <div className={styles.userMenuContainer} ref={userMenuRef}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={styles.userButton}
              >
                <User className={styles.userIcon} size={22} />
                <span className={styles.usernameText}>
                  {user.username || "Profile"}
                </span>
                <ChevronDown
                  size={16}
                  className={`${styles.chevronIcon} ${
                    isUserMenuOpen ? styles.chevronOpen : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    className={styles.dropdownMenu}
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className={styles.dropdownHeader}>
                      Signed in as <br />
                      <strong>{user.username}</strong>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`${styles.dropdownItem} ${styles.logoutButton}`}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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

          {/* Mobile Menu Button (Hamburger) */}
          <div className={styles.mobileMenuButton}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.mobileMenu}
            ref={mobileMenuRef}
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <nav className={styles.mobileNavLinks}>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `${styles.mobileNavItem} ${styles.active}`
                    : styles.mobileNavItem
                }
                onClick={closeMobileMenu}
              >
                <Home size={22} />
                <span>Home</span>
              </NavLink>
              {user && (
                <>
                  <NavLink
                    to="/mypolls"
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.mobileNavItem} ${styles.active}`
                        : styles.mobileNavItem
                    }
                    onClick={closeMobileMenu}
                  >
                    <List size={22} />
                    <span>My Polls</span>
                  </NavLink>
                  <NavLink
                    to="/voted"
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.mobileNavItem} ${styles.active}`
                        : styles.mobileNavItem
                    }
                    onClick={closeMobileMenu}
                  >
                    <CheckSquare size={22} />
                    <span>Voted Polls</span>
                  </NavLink>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
