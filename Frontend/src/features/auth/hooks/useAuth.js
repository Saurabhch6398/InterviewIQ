import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {

    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            if (data && data.token) {
                localStorage.setItem("token", data.token)
                setUser(data.user)
                return { success: true }
            }
            return { success: false, error: "Invalid response from server" }
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid email or password"
            return { success: false, error: msg }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            if (data && data.token) {
                localStorage.setItem("token", data.token)
                setUser(data.user)
                return { success: true }
            }
            return { success: false, error: "Invalid response from server" }
        } catch (err) {
            const msg = err.response?.data?.message || "Registration failed. Please try again."
            return { success: false, error: msg }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            localStorage.removeItem("token")
            setUser(null)
            return { success: true }
        } catch (err) {
            return { success: false, error: "Logout failed" }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setLoading(false)
            }
        }
        getAndSetUser()
    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}