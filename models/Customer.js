import mongoose from "mongoose";
import Joi from "joi";

const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      min: 8,
      max : 16,
    },

    role: {
      type : String,
      enum: ["Admin", "read", "write"],
      default: "read",
    },

    deviceId: {
      type: String,
      required: true,
      min: 10,
      max: 10,
    },
    nickName: {
      type: String,
      min: 3,
    },
    requestStatus: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Customer = new mongoose.model("Customer", customerSchema);

async function validateCustomer(customer) {
  const Schema = Joi.object({
    name: Joi.string().trim().min(3).required().messages({
      "string.empty": "name is required",
      "string.min": `'name' should have a minimum length of 3`,
      "any.required": `'name' is a required field`,
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "email is required",
      "string.email": `"email" must be a valid email`,
      "any.required": `"email" is a required field`,
    }),
    password: Joi.string().min(8).max(16).required().messages({
      "string.empty": "password is required",
      "string.min": `"password" should have a minimum length of 8`,
      "string.max" : `"password" should have a maximum length of 16`,
      "any.required": `"password" is a required field`,
    }),
    role: Joi.string()
      .valid("Admin", "read", "write")
      .default("read")
      .messages({
        "string.empty": "role is required",
        "any.only": `"role" must be one of ['Admin', 'read', 'write']`,
      }),
    deviceId: Joi.string().length(10).required().messages({
      "string.empty": "deviceId is required",
      "string.length": `"deviceId" should be exactly 10 characters`,
      "any.required": `"deviceId" is a required field`,
    }),
    nickName: Joi.string().min(3).optional().messages({
      "string.min": `'nickName' should have a minimum length of 3`,
    }),
  });

  try {
    await Schema.validateAsync(customer, { abortEarly: false });
  } catch (error) {
    return error;
  }
}


export { Customer, validateCustomer };
