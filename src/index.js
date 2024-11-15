import { connectDatabase } from "./db/db.config.js";
import 'dotenv/config';
import { app } from "./app.js"
connectDatabase().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running at Port ${process.env.PORT}`);
    })
}).catch((err) => {
    console.log(err);
});