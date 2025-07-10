const Joi = require('joi');

const signupSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email().min(5).required(),
  phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  address: Joi.string().required(),

  // ✅ Allow only specific roles
  role: Joi.string().valid('user', 'admin').required(),

  // Optional: validate isActive if you're allowing it from frontend
  isActive: Joi.boolean().optional()
});




module.exports = { signupSchema };
