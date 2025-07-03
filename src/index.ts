import dotenv from "dotenv";
import app from "./app";
import connectDB from "./db";



dotenv.config({
  path: "./env",
});


connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log("Server is started successfully on port: ", process.env.PORT);
    });
  })
  .catch((err) => {
    // logger.error(`Error starting server`, err);
  });
