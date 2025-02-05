const validator = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error) {
      res.status(400).json({
        status: 102,
        message: error.message,
        data: null
      });
    }
  };
}

export default validator;