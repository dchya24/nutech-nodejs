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
    try{
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

        if(result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    }
    catch(err) {
        console.log("[TransactionRepository.save] Error: ", err);
        return null;
    }
}


const generateInvoiceNumber = async (trx) => {
    try {
        const query = `
            select count(*) from transactions
            where date_trunc('day', created_on) = date_trunc('day', now())
        `;

        const result = await trx.query(query);
        
        let currentSequence = parseInt(result.rows[0].count) + 1;
        currentSequence = currentSequence.toString().padStart(3, '0');
        
        const invPrefix = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;

        return `${invPrefix}-${currentSequence}`;
    }
    catch(err) {
        console.log("[TransactionRepository.generateInvoiceNumber] Error: ", err);
        return null;
    }
}

const getServiceByCode = async (trx, code) => {
    try{
        const query = `
            select * from services where service_code = $1
        `;

        const result = await trx.query(query, [code]);

        return result.rows[0];
    }
    catch(err) {
        console.log("[TransactionRepository.getServiceByCode] Error: ", err);
        return null;
    }
}

const getUserBalanceByEmail = async (trx, email) => {
    try {
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
    catch(err) {
        console.log("[TransactionRepository.getUserBalanceByEmail] Error: ", err);
        throw new Error(err);
    }
}

const getTransactionHistory = async (trx, email, limit = null, offset = null) => {
    try{
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

        if(offset) {
            query += ` offset $3`;
            val.push(offset)
        }

        const result = await trx.query(query, val);

        return result.rows;
    }
    catch(err) {
        console.log("[TransactionRepository.getTransactionHistory] Error: ", err);
        throw new Error(err);
    }
}

export default { 
    Transaction, 
    save, 
    generateInvoiceNumber,
    getServiceByCode,
    getUserBalanceByEmail,
    getTransactionHistory
};