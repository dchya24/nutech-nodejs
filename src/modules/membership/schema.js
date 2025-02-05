import joi from 'joi';

const loginRequestSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required()
}).messages({
    'string.email': 'Parameter Email tidak sesuai dengan format',
    'string.min': 'Password harus minimal 8 karakter',
    'any.required': 'Email dan Password tidak boleh kosong!'
});

const registerRequestSchema = joi.object({
    email: joi.string().email().required(),
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    password: joi.string().min(8).required()
}).messages({
    'string.email': 'Parameter Email tidak sesuai dengan format',
    'string.min': 'Password harus minimal 8 karakter',
    'any.required': 'Email, First Name, Last Name dan Password tidak boleh kosong!'
})

export default { loginRequestSchema, registerRequestSchema };
