import mongoose from "mongoose";
import bcrypt from "bcrypt";
import 'dotenv/config';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        index: true,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String,
        default: ""
    },
    lastOnline: {
        type: Date,
        default: Date.now()
    },
    userType: {
        type: String,
        default: "user"
    }
}, { timestamps: true });

userSchema.methods.isPasswordCorrect = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
    }
    next();
});

export const User = mongoose.model("User", userSchema);