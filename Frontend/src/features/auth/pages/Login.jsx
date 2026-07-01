import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ error, setError ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const res = await handleLogin({ email, password })
        if (res?.success) {
            navigate('/')
        } else {
            setError(res?.error || "Login failed")
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
                        <h1>Master Your Next Interview with AI</h1>
                        <p>Get personalized interview roadmaps, technical and behavioral questions, and AI-tailored resumes.</p>
                    </div>
                    <img src="/login_graphic.jpg" alt="AI Interview" className="showcase-img" />
                    <div className="showcase-overlay" />
                </div>

                {/* Right Side: Form */}
                <div className="auth-form-side">
                    <div className="form-container">
                        <h1>Welcome Back</h1>
                        <p className="form-subtitle">Enter your credentials to access your dashboard</p>
                        
                        {error && <div className="error-message">{error}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    type="email" id="email" name='email' placeholder='name@gmail.com' required />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    type="password" id="password" name='password' placeholder='••••••••' required />
                            </div>
                            <button className='button primary-button' disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>
                        <p className="auth-redirect">Don't have an account? <Link to={"/register"} >Register</Link></p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Login