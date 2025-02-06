import pool from "../../database/connect.js";

class Transaction {
    constructor(
        id = null, 
        invoiceNumber,
        userId, 
        serviceId = null,
        transactionType,
        totalAmount,
        description,
    ) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.userId = userId;
        this.serviceId = serviceId;
        this.transactionType = transactionType;
        this.totalAmount = totalAmount;
        this.description = description;
    }
}

const save = (trx, transaction) => {
    const query  = `
        insert into transactions (user_id, service_id, invoice_number, transaction_type, total_amount, description) values
        ($1, $2, $3, $4, $5, $6) returning *
    `

    const result = trx.query(query, [
        transaction.userId, 
        transaction.serviceId, 
        transaction.invoiceNumber,
        transaction.transactionType,
        transaction.totalAmount,
        transaction.description
    ]);

    return result;
}


const generateInvoiceNumber = async (trx) => {
    const query = `
        select count(*) from transactions
        where date_trunc('day', created_on) = date_trunc('day', now())
    `;

    const result = await trx.query(query);
    
    const currentSequence = result.rows[0].count + 1;
    const invPrefix = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

    return `${invPrefix}-${currentSequence}`;
}

const getServiceByCode = async (trx, code) => {
    const query = `
        select * from services where service_code = $1
    `;

    const result = await trx.query(query, [code]);

    return result.rows[0];
}

const getUserBalanceByEmail = async (trx, email) => {
    const query = `
        select
            t.user_id,
            sum(case when t.transaction_type = 'TOPUP' then t.total_amount else 0 end) as income,
            sum(case when t.transaction_type = 'PAYMENT' then t.total_amount else 0 end) as outcome
        from transactions t
            JOIN users u on t.user_id = u.id 
        where u.email = $1 group by user_id
    `;

    const result = await trx.query(query, [email]);

    if(result.rows.length === 0) {
        return 0;
    }

    const totalBalance = result.rows[0].income - result.rows[0].outcome;

    return totalBalance;
}

const getTransactionHistory = async (trx, email, limit = null) => {
    const query = `
        select 
            t.invoice_number,
            t.transaction_type,
            t.total_amount,
            t.description,
            t.created_on
        from transactions t
            JOIN users u on t.user_id = u.id
        where u.email = $1
        order by t.created_on desc
    `;

    const val = [email];

    if(limit) {
        query += ` limit $2`;
        val.push(limit)
    }

    const result = await trx.query(query, val);

    return result.rows;
}

export default { 
    Transaction, 
    save, 
    generateInvoiceNumber,
    getServiceByCode,
    getUserBalanceByEmail,
    getTransactionHistory
};