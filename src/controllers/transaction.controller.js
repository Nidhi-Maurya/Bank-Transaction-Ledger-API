

const TransactionModel = require("../models/transaction.model");
const LedgerModel= require("../models/ledger.model");
const emailService= require("../services/email.service");
const accountModel= require("../models/account.model");
const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
/**
 *  create a new transaction
 * these are 10 steps transfer flow
 * 1- Validates request
 * 2- Validate idempotency key
 * 3-check acccount status
 * 4-Derive sender balance from ledger
 * 5-create transaction (pending)
 * 6-create debit ledger entry
 * 7-create credit ledger entry 
 * 8- mark transaction completed
 * 9- commit mongodb session
 * 10- send email notification
 * 
 */


async function createTransaction(req,res){



/**
 * 1. Validate Request ,
 */


  const {fromAccount,toAccount,amount,idempotencyKey}= req.body;



  if(!fromAccount || !toAccount || !amount || !idempotencyKey){
    return res.status(400).json({   
      success: false,
      message: "FromAccount ,toAcount, amount and idempotencyKey are required",
    });
  }

 if (fromAccount.toString() === toAccount.toString()) {
    return res.status(400).json({
      success: false,
      message: "Cannot transfer funds to the same account",
    });
  }


  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
    // user: req.user._id, 
    
  })

  const toUserAccount= await accountModel.findOne({
    _id: toAccount,
  })

  if(!fromUserAccount || !toUserAccount){
    return res.status(404).json({
      success:false,
      message:"FromAccount or ToAccount not found",
    })  
    
  }  

/**
 * 2 Validate idempotency key
 */


const isTransactionAlreadyExists= await TransactionModel.findOne({
  idempotencyKey:idempotencyKey,
})

if(isTransactionAlreadyExists){
  if(isTransactionAlreadyExists.status==="completed"){
    return res.status(200).json({
      success:true,
      message:"Transaction already processed",
      transaction:isTransactionAlreadyExists,
    })
  }

if(isTransactionAlreadyExists.status==="pending"){    
  res.status(200).json({
    success:true,
    message:"Transaction is still processing",
   
  })


}


if (isTransactionAlreadyExists.status==="failed"){
  return res.status(500).json({
   
    message:"Transaction failed previously, please try again",
  })

  }

if(isTransactionAlreadyExists.status==="reversed"){
  return res.status(500).json({  
    message:"Transaction was reversed previously, please try again",
  })


} 

}


/**
 * 3.Check Account Status
 */


if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){

  return res.status(400).json({
    message: "Both fromAccount and toAccount must be ACTIVE process transaction"
  })

}


/**
 * 4.Derive sender balance from ledger 
 */


const balance = await fromUserAccount.getBalance()

if(balance < amount){
  return res.status(400).json({
    message:`Insufficient balance in fromAccount. Available balance is ${balance}`,
  })
}



/** 
 *5. CREATE TRANSACTION (PENDING)
 * 
 */

let transaction
 try{
   const session = await mongoose.startSession()
 session.startTransaction()

 transaction = new transactionModel({
  fromAccount,
  toAccount,
  amount,
  idempotencyKey,
  status:"PENDING",
 })

const debitLedgerEntry = await LedgerModel.create([{
  account:fromAccount,
  type:"DEBIT",
  amount:amount,
  transaction:transaction._id,  
}] ,{session}) 





const creditLedgerEntry = await LedgerModel.create([{
  account:toAccount,
  type:"CREDIT",
  amount:amount,
  transaction:transaction._id,
 
}],{session})


transaction.status="COMPLETED"
await transaction.save({session})


await session.commitTransaction()
session.endSession()
 }  catch(err){
  
  return res.status(400).json({
    message:"Transaction is pending due to server error , please try after sometimes",
    err:err.message
  })
 }




/**
 * 10 .Send Email Notification
 */



await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, fromAccount, toAccount)

return res.status(201).json({
  success:true,
  message:"Transaction completed successfully",
  transaction:transaction,

})





}




async function createInitialFundsTransaction(req,res){
  const {toAccount,amount,idempotencyKey} = req.body

 if(!toAccount || !amount || !idempotencyKey){
  return res.status(400).json({
    message:"toAccount, amount and idempotencyKey are required"
  })
 }

    const toUserAccount = await accountModel.findOne({
       _id:toAccount,
          })

          if(!toUserAccount){
            return res.status(400).json({
              message:"Invalid toAccount"
            })
          }

        
      const fromUserAccount = await accountModel.findOne({
      
        user:req.user._id
      })

      if(!fromUserAccount){
        return res.status(400).json({
          message: "System User Account not found5"
      } )
    }



    const session = await mongoose.startSession()
    session.startTransaction()


    const transaction = (await transactionModel.create([{
      fromAccount:fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status:"PENDING"
    }],{session}))[0]


    const debitLedgerEntry = await ledgerModel.create([{
      account:fromUserAccount._id,
      amount:amount,
      transaction:transaction._id,
      type:"DEBIT"
    }], {session})

await (()=>{
  return newPromise((resolve)=>setTimeout(resolve,15*1000));
})




     const creditLedgerEntry = await ledgerModel.create([{
      account:toAccount,
      amount:amount,
      transaction:transaction._id,
      type:"CREDIT"
     }],{session})

   


    // await transactionModel.findOneAndUpdate(
    //   {
    //     _id:transaction._id
    //   },
    //   {status:"COMPLETED"},
    //   {session}
    // )

transaction.status = "COMPLETED";
await transaction.save({ session });



     await session.commitTransaction()
     session.endSession()

     return res.status(201).json({
      message: "Intial funds transactions completed successfully",
      transaction:transaction
     })



    
}


module.exports={
  createTransaction,
  createInitialFundsTransaction
}