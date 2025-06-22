import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <p style={styles.message}>Oops! The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")} style={styles.button}>Go Home</button>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    textAlign: "center",
  },
  code: {
    fontSize: "5rem",
    margin: 0,
  },
  message: {
    fontSize: "1.5rem",
    margin: "20px 0",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#ff4757",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default ErrorPage;