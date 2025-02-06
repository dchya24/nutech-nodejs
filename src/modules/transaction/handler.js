import pool from "../../database/connect.js";
import TransactionType from "../../type/transactionType.js";
import userRepo from "../membership/repository.js";
import repo from "./repository.js";

const topup = async (req, res) => {
    const trx = await pool.connect();
    try {
        await trx.query("BEGIN");
        const { top_up_amount } = req.body;
        const userEmail = req.email;

        const user = await userRepo.findByEmail(trx, userEmail);

        const invoiceNumber = await repo.generateInvoiceNumber(trx);

        const transaction = new repo.Transaction(
            null,
            invoiceNumber,
            user.id,
            null,
            TransactionType.TOPUP,
            top_up_amount,
            "Top Up balance"
        );

        console.log("Transaction: ", transaction);

        const result = await repo.save(trx, transaction);

        if (!result) {
            throw new Error("Gagal melakukan transaksi");
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
        
        res.status(500).json({
            status: 999,
            message: "Internal Server Error",
            data: null
        });
    }
}

const getBalance = async (req, res) => {
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
        res.status(400).json({
            status: 400,
            message: err.message,
            data: null
        });
    }
}

const getTransactionHistory = async (req, res) => {
    try {
        const trx = await pool.connect();
        const userEmail = req.email;

        const limit = req.query.limit || null;

        const transactions = await repo.getTransactionHistory(trx, userEmail, limit);

        res.status(200).json({
            status: 0,
            message: "Success",
            data: transactions
        });
    }
    catch (err) {
        console.log("Error: ", err);
        res.status(400).json({
            status: 400,
            message: err.message,
            data: null
        });
    }
}

const createTransaction = async(req, res) => {
    const trx = await pool.connect()
    
    try{
        await trx.query('BEGIN')

        const service_code = req.body.service_code
        const userEmail = req.email

        const user = await userRepo.findByEmail(trx, userEmail)

        const checkService = await repo.getServiceByCode(trx, service_code)

        if(!checkService) {
            res.status(400).json({
                status: 102,
                message: "Service ataus Layanan tidak ditemukan",
                data: null
            })
            return
        }

        const userBalance = await repo.getUserBalanceByEmail(trx, userEmail)

        if(checkService.service_tariff > userBalance){
            res.status(400).json({
                status: 105,
                message: "Balance tidak mencukupi",
                data: null
            })
            return
        }

        const invoiceNumber = await repo.generateInvoiceNumber(trx)

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
            throw new Error()
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

        res.status(500).json({
            status: 999,
            message: "Internal Server Error",
            data: null
        });
    }
}

export default {
    topup,
    getBalance,
    getTransactionHistory,
    createTransaction
}