const express = require('express');


/**
 * Routes required for the application
 */
const authRouter= require("./routes/auth.routes");
const accountsRouter = require("./routes/accounts.routes")
const transactionRoutes = require('./routes/transaction.routes');


const cookieParser = require("cookie-parser");






const app= express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



/**
 *  USER routes
 */


app.use("/api/auth", authRouter);
app.use("/api/accounts",accountsRouter);
app.use("/api/transactions",transactionRoutes)



module.exports=app