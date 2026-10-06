

const {Router} = require("express");


const transactionRoutes= Router();
const authMiddleware = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");
const authSystemUserMiddleware = require("../middleware/auth.middleware")


/**
 * - POST/api/transactions
 * - create a new transaction
 * - protected api
 */


transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);


/** 
 * - POST/api/transactions /system/initial-funds
 * - Create initial funds transaction from system user
 */


transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction)







module.exports= transactionRoutes;