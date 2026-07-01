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
    const [ isOtpSent, setIsOtpSent ] = useState(false)
    const [ otp, setOtp ] = useState("")
    const [ verificationEmail, setVerificationEmail ] = useState("")
    const [ successMessage, setSuccessMessage ] = useState("")

    const { loading, handleRegister, handleVerifyOtp, handleResendOtp } = useAuth()
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccessMessage("")

        // Enforce @gmail.com domain check on the client side
        if (!email.toLowerCase().endsWith("@gmail.com")) {
            setError("Only @gmail.com email addresses are allowed.")
            return
        }

        const res = await handleRegister({ username, email, password })
        if (res?.success) {
            if (res.requiresVerification) {
                setIsOtpSent(true)
                setVerificationEmail(res.email || email)
                setSuccessMessage(res.message || "Verification OTP sent to your Gmail.")
            } else {
                navigate("/")
            }
        } else {
            setError(res?.error || "Registration failed")
        }
    }

    const handleVerifySubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccessMessage("")
        const res = await handleVerifyOtp({ email: verificationEmail, otp })
        if (res?.success) {
            navigate("/")
        } else {
            setError(res?.error || "OTP verification failed")
        }
    }

    const handleResendClick = async () => {
        setError("")
        setSuccessMessage("")
        const res = await handleResendOtp({ email: verificationEmail })
        if (res?.success) {
            setSuccessMessage(res.message || "OTP resent successfully.")
        } else {
            setError(res?.error || "Failed to resend OTP")
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
                    {isOtpSent ? (
                        <div className="form-container">
                            <h1>Verify Email</h1>
                            <p className="form-subtitle">Enter the 6-digit code sent to <strong style={{color: '#4ecdc4'}}>{verificationEmail}</strong></p>

                            {error && <div className="error-message">{error}</div>}
                            {successMessage && <div className="success-message" style={{color: '#4ecdc4', backgroundColor: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.2)', padding: '0.85rem 1rem', borderRadius: '0.7rem', fontSize: '0.85rem', marginBottom: '1rem'}}>{successMessage}</div>}

                            <form onSubmit={handleVerifySubmit}>
                                <div className="input-group">
                                    <label htmlFor="otp" style={{ textAlign: 'center', width: '100%', display: 'block' }}>Verification Code</label>
                                    <input
                                        value={otp}
                                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)) }}
                                        type="text" 
                                        id="otp" 
                                        name='otp' 
                                        placeholder='••••••' 
                                        maxLength={6} 
                                        required 
                                        style={{letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem', fontFamily: 'monospace'}} 
                                    />
                                </div>

                                <button className='button primary-button' disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
                                    {loading ? "Verifying..." : "Verify Code"}
                                </button>
                            </form>

                            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.85rem'}}>
                                <button onClick={handleResendClick} className="link-btn" style={{background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500'}} disabled={loading}>Resend Code</button>
                                <button onClick={() => { setIsOtpSent(false); setError(""); setSuccessMessage(""); }} className="link-btn" style={{background: 'none', border: 'none', color: '#6b7894', cursor: 'pointer', fontFamily: 'inherit'}} disabled={loading}>Back to Register</button>
                            </div>
                        </div>
                    ) : (
                        <div className="form-container">
                            <h1>Create Account</h1>
                            <p className="form-subtitle">Get started with your free account (Gmail only)</p>

                            {error && <div className="error-message">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        onChange={(e) => { setUsername(e.target.value) }}
                                        type="text" id="username" name='username' placeholder='johndoe' required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="email">Email Address (Gmail)</label>
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
                                    {loading ? "Registering..." : "Register"}
                                </button>
                            </form>

                            <p className="auth-redirect">Already have an account? <Link to={"/login"} >Login</Link></p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default Register