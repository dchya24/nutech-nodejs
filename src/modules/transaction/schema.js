import Joi from 'joi';

const topupSchema = Joi.object({
    top_up_amount: Joi.number().min(0).required()
}).messages({
    'number.base': 'Paramter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
    'number.min': 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
    'any.required': 'Parameter amount tidak boleh kosong'
});

const createTransactionSchema = Joi.object({
    service_code: Joi.string().required()
}).messages({
    'any.required': "Service Code tidak boleh kosong"
})

export default {
    topupSchema,
    createTransactionSchema
}