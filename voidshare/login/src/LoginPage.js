import { useState } from "react";
import "./LoginPage.css";
// import { loginUser, registerUser } from "./api";

const LoginPage = () => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [storedUser, setStoredUser] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNewUser) {
      setStoredUser({ username, password });
      setIsNewUser(false);
      setUsername("");
      setPassword("");
    } else {
      if (storedUser && storedUser.username === username && storedUser.password === password) {
        alert("Login successful!");
      } else {
        alert("Invalid credentials!");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>{isNewUser ? "Sign Up" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isNewUser ? "Sign Up" : "Login"}</button>
      </form>
      <p onClick={() => setIsNewUser(!isNewUser)}>
        {isNewUser ? "Already have an account? Login" : "New user? Sign up"}
      </p>
    </div>
  );
};

export default LoginPage;


// import { useState } from "react";
// import "./LoginPage.css";
// import { loginUser, registerUser } from "./api";

// const LoginPage = () => {
//   const [isNewUser, setIsNewUser] = useState(false);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (isNewUser) {
//         await registerUser(username, password);
//         alert("Registration successful! Please log in.");
//         setIsNewUser(false);
//       } else {
//         await loginUser(username, password);
//         alert("Login successful!");
//       }
//       setUsername("");
//       setPassword("");
//     } catch (error) {
//       alert(error);
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>{isNewUser ? "Sign Up" : "Login"}</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit">{isNewUser ? "Sign Up" : "Login"}</button>
//       </form>
//       <p onClick={() => setIsNewUser(!isNewUser)}>
//         {isNewUser ? "Already have an account? Login" : "New user? Sign up"}
//       </p>
//     </div>
//   );
// };

// export default LoginPage;
