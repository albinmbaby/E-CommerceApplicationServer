import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.js";

export const userSignup = async (req, res, next) => {
    try {
        console.log("Signup endpoint hit");

        const { name, email, password, mobile, profilePic } = req.body;

        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const isUserExist = await User.findOne({ email });

        if (isUserExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, mobile, profilePic });

        await newUser.save();

        // Prepare user data without password
        const userData = {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            mobile: newUser.mobile,
            profilePic: newUser.profilePic,
            role: newUser.role
        };

        return res.status(201).json({ data: userData, message: "User account created successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "User does not exist" });
        }

        const passwordMatch = await bcrypt.compare(password, userExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = generateToken(userExist._id);

        // Set HTTP-only Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: "Strict",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Prepare user data without password
        const userData = {
            _id: userExist._id,
            name: userExist.name,
            email: userExist.email,
            mobile: userExist.mobile,
            profilePic: userExist.profilePic,
            role: userExist.role
        };

        return res.json({ data: userData, message: "User login successful" });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const userProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userData = await User.findById(userId).select("-password");

        return res.json({ data: userData, message: "User profile fetched successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        return res.json({ message: "User logout successful" });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};
