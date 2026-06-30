import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")

    const { loading, handleRegister } = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const res = await handleRegister({ username, email, password })
        if (res?.success) {
            navigate("/")
        } else {
            setError(res?.error || "Registration failed")
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-container">
                {/* Left Side: Graphic & Brand */}
                <div className="auth-showcase">
                    <div className="showcase-content">
                        <div className="brand">
                            <span className="brand-icon">⚡</span>
                            <h2>InterviewIQ</h2>
                        </div>
                        <h1>Start Your Preparation Today</h1>
                        <p>Join thousands of candidates using AI to simulate real interviews and land their dream jobs.</p>
                    </div>
                    <img src="/login_graphic.jpg" alt="AI Interview" className="showcase-img" />
                    <div className="showcase-overlay" />
                </div>

                {/* Right Side: Form */}
                <div className="auth-form-side">
                    <div className="form-container">
                        <h1>Create Account</h1>
                        <p className="form-subtitle">Get started with your free account</p>

                        {error && <div className="error-message">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="username">Username</label>
                                <input
                                    onChange={(e) => { setUsername(e.target.value) }}
                                    type="text" id="username" name='username' placeholder='johndoe' required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    type="email" id="email" name='email' placeholder='name@example.com' required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    type="password" id="password" name='password' placeholder='••••••••' required />
                            </div>

                            <button className='button primary-button' disabled={loading}>
                                {loading ? "Registering..." : "Register"}
                            </button>
                        </form>

                        <p className="auth-redirect">Already have an account? <Link to={"/login"} >Login</Link></p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Register