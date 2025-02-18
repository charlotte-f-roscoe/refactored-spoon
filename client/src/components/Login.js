import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Login request being sent to:", `${API_URL}/api/auth/login`);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { username, password }, { withCredentials: true });
            console.log("Login successful:", res.data);
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err.response ? err.response.data : err.message);
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Login</h2>
            {error && <p style={{color: "red"}}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                       required/>
                <input type="password" placeholder="Password" value={password}
                       onChange={e => setPassword(e.target.value)} required/>
                <button type="submit">Log In</button>
            </form>

            <hr/>
            <p>Or log in with GitHub:</p>
            <a href={"https://refactored-spoon-bpck.onrender.com/api/auth/github"} className="btn btn-dark">GitHub</a>
        </div>
    );
};

export default Login;
