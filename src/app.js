import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + "../../")));
app.use(cookieParser());

//Routes
import { userRouter } from "./routes/user.routes.js";
import { tokenRouter } from "./routes/token.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/token", tokenRouter);