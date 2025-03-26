import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "./LoginPage";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        toastStyle={{
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
        }}
      />
      <LoginPage />
    </>
  );
}

export default App;
