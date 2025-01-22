import { User } from "../models/User.js";
import bcrypt from "bcrypt";


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

        const hashedPassword = bcrypt.hashSync(password, 10);
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
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
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

        const passwordMatch = bcrypt.compareSync(password, userExist.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

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
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
};

export const userProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userData = await User.findById(userId).select("-password");

        return res.json({ data: userData, message: "User profile fetched successfully" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
};

export const userLogout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        return res.json({ message: "User logout successful" });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message || "Internal Server Error" });
    }
};
