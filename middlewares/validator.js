const Joi = require('joi');
const signupSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email().min(5).required(),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  address: Joi.string().required(),

  // 👇 prevent role injection
  role: Joi.forbidden(),
  isActive: Joi.forbidden()
});



module.exports = { signupSchema };
