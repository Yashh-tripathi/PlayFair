import dotenv from 'dotenv'
import connectDB from "./db/db.connect.js";
import { app } from './app.js';

dotenv.config({
    path: "./env"
});

const PORT = process.env.PORT || 8000

connectDB()
.then(() => {
    app.listen(PORT, (req,res) => {
        console.log(`App running on the port ${PORT}`)
    });
    app.on("error", (error) => {
        res.send("Error: ",error)
    });

})
.catch((error) => {
    console.log("Post connection promise object error : ", error);
})