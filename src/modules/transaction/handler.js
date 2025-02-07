import pool from "../../database/connect.js";
import error from "../../type/error.js";
import TransactionType from "../../type/transactionType.js";
import userRepo from "../membership/repository.js";
import repo from "./repository.js";

const topup = async (req, res, next) => {
    const trx = await pool.connect();
    try {
        await trx.query("BEGIN");
        const { top_up_amount } = req.body;
        const userEmail = req.email;

        const user = await userRepo.findByEmail(trx, userEmail);

        // generate invoice number
        const invoiceNumber = await repo.generateInvoiceNumber(trx);

        if(invoiceNumber === null) {
            throw new Error(error.FAILED_TO_CREATE_INV_CODE);
        }

        // create transaction
        const transaction = new repo.Transaction(
            null,
            invoiceNumber,
            user.id,
            null,
            TransactionType.TOPUP,
            top_up_amount,
            "Top Up balance"
        );
        const result = await repo.save(trx, transaction);

        if (!result) {
            throw new Error(error.TRANSACTION_FAILED);
        }

        const currentBalance = await repo.getUserBalanceByEmail(trx, user.email);

        await trx.query("COMMIT");

        res.status(200).json({
            status: 0,
            message: "Success",
            data: {
                balance: currentBalance
            }
        });
    }
    catch (err) {
        await trx.query("ROLLBACK");

        console.log("Error: ", err);

        if(err.message === error.FAILED_TO_CREATE_INV_CODE || err.message === error.TRANSACTION_FAILED) {
            res.status(500).json({
                status: 999,
                message: err.message,
                data: null
            });
            return;
        }
        
        
        next(err)
    }
}

const getBalance = async (req, res, next) => {
    try {
        const trx = await pool.connect();
        const userEmail = req.email;

        const balance = await repo.getUserBalanceByEmail(trx, userEmail);

        res.status(200).json({
            status: 0,
            message: "Success",
            data: {
                balance: balance
            }
        });
    }
    catch (err) {
        console.log("Error: ", err);

        next(err)
    }
}

const getTransactionHistory = async (req, res, next) => {
    try {
        const trx = await pool.connect();
        const userEmail = req.email;

        // get limit and offset from query
        const limit = req.query.limit || null;
        const offset = req.query.offset || null;

        const transactions = await repo.getTransactionHistory(trx, userEmail, limit, offset);

        res.status(200).json({
            status: 0,
            message: "Success",
            data: {
                offset: offset || 0,
                limit: limit || 0,
                records: transactions
            }
        });
    }
    catch (err) {
        console.log("Error: ", err);

        next(err)
    }
}

const createTransaction = async(req, res, next) => {
    const trx = await pool.connect()
    
    try{
        await trx.query('BEGIN')

        const service_code = req.body.service_code
        const userEmail = req.email

        const user = await userRepo.findByEmail(trx, userEmail)

        // check service code
        const checkService = await repo.getServiceByCode(trx, service_code)
        if(!checkService) {
            throw new Error(error.SERVICE_NOT_FOUND)
        }

        // check user balance enough or not
        const userBalance = await repo.getUserBalanceByEmail(trx, userEmail)
        if(checkService.service_tariff > userBalance){
            throw new Error(error.NOT_ENOUGH_BALANCE)
        }

        // generate invoice number
        const invoiceNumber = await repo.generateInvoiceNumber(trx)

        // create transaction
        const transaction = new repo.Transaction(
            null,
            invoiceNumber,
            user.id,
            checkService.id,
            TransactionType.PAYMENT,
            checkService.service_tariff,
            checkService.service_name
        )

        const newTransaction = repo.save(trx, transaction)

        if(!newTransaction){
            throw new Error(error.FAILED_TO_INSERT)
        }

        await trx.query('COMMIT')

        res.status(200).json({
            status: 0,
            message: 'Transaksi berhasil',
            data: {
                invoice_number: newTransaction.invoiceNumber,
                service_Code: checkService.service_code,
                service_name: checkService.service_name,
                transaction_type: newTransaction.transaction_type,
                total_amount: newTransaction.total_amount,
                created_on: newTransaction.created_on
            }
        })

    }
    catch(err){
        await trx.query('ROLLBACK')
        console.log(err)

        if(err.message === error.NOT_ENOUGH_BALANCE || err.message === error.SERVICE_NOT_FOUND){
            res.status(400).json({
                status: 102,
                message: err.message,
                data: null
            })
            return
        }
        else if (err.message == error.FAILED_TO_INSERT){
            res.status(500).json({
                status: 999,
                message: err.message,
                data: null
            })
            return
        }

        next(err)
    }
}

export default {
    topup,
    getBalance,
    getTransactionHistory,
    createTransaction
}