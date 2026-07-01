const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const { sendOtpEmail } = require("../services/email.service")

async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    // Restrict registration to @gmail.com emails only
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    if (!gmailRegex.test(email)) {
        return res.status(400).json({
            message: "Only @gmail.com email addresses are allowed."
        })
    }

    // Check if user exists and is verified
    let user = await userModel.findOne({ email })
    if (user && user.isVerified) {
        return res.status(400).json({
            message: "Account already exists with this email address"
        })
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

    if (user && !user.isVerified) {
        // Update password and username for the unverified user retry
        user.username = username
        user.password = await bcrypt.hash(password, 10)
        user.otpCode = otp
        user.otpExpires = otpExpires
        await user.save()
    } else {
        // Also check if username is taken by a verified user
        const isUsernameTaken = await userModel.findOne({ username, isVerified: true })
        if (isUsernameTaken) {
            return res.status(400).json({
                message: "Username is already taken"
            })
        }

        const hash = await bcrypt.hash(password, 10)
        user = await userModel.create({
            username,
            email,
            password: hash,
            otpCode: otp,
            otpExpires,
            isVerified: false
        })
    }

    try {
        await sendOtpEmail(email, otp)
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to send verification email"
        })
    }

    res.status(201).json({
        message: "Verification OTP sent to your Gmail address.",
        requiresVerification: true,
        email: user.email
    })
}

async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    // Check if email is verified
    if (!user.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        user.otpCode = otp
        user.otpExpires = Date.now() + 10 * 60 * 1000
        await user.save()

        try {
            await sendOtpEmail(email, otp)
        } catch (err) {}

        return res.status(400).json({
            message: "Please verify your email address. A verification OTP has been sent to your Gmail.",
            requiresVerification: true,
            email: user.email
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)

    res.status(200).json({
        message: "User loggedIn successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


async function logoutUserController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function verifyOtpController(req, res) {
    const { email, otp } = req.body

    if (!email || !otp) {
        return res.status(400).json({
            message: "Please provide email and OTP"
        })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    if (user.isVerified) {
        return res.status(400).json({
            message: "Email is already verified"
        })
    }

    if (user.otpCode !== otp || user.otpExpires < Date.now()) {
        return res.status(400).json({
            message: "Invalid or expired OTP"
        })
    }

    user.isVerified = true
    user.otpCode = undefined
    user.otpExpires = undefined
    await user.save()

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)

    res.status(200).json({
        message: "Email verified and logged in successfully",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

async function resendOtpController(req, res) {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({
            message: "Please provide email"
        })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    if (user.isVerified) {
        return res.status(400).json({
            message: "Email is already verified"
        })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    user.otpCode = otp
    user.otpExpires = Date.now() + 10 * 60 * 1000
    await user.save()

    try {
        await sendOtpEmail(email, otp)
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to resend verification email"
        })
    }

    res.status(200).json({
        message: "Verification OTP resent successfully to your Gmail address."
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    verifyOtpController,
    resendOtpController
}