import Joi from "joi";
import mongoose from "mongoose";

const { Schema } = mongoose;

const mgmtDeviceSchema = new Schema(
  {
    deviceId: {
      type: String,
      required: true,
      length: 10,
      unique: true,
      trim: true,
    },

    authorizedUsers: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
          required: true,
          match: /^\S+@\S+\.\S+$/, // Basic email validation
        },
        name: {
          type: String,
          required: true,
          trim: true,
          minlength: 3,
          maxlength: 15,
        },
        role: {
          type: String,
          enum: ["super-admin", "admin", "customer"],
          default: "customer",
        },
      },
    ],

    requestedUsers: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        email: {
          type: String,
          required: true,
          match: /^\S+@\S+\.\S+$/, // Basic email validation
        },
        name: {
          type: String,
          required: true,
          trim: true,
          minlength: 3,
          maxlength: 15,
        },
        role: {
          type: String,
          enum: ["super-admin", "admin", "customer"],
          default: "customer",
        },
      },
    ],

    authorizedCustomer: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Customer",
        },
        email: {
          type: String,
          required: true,
          match: /^\S+@\S+\.\S+$/, // Basic email validation
        },
        name: {
          type: String,
          required: true,
          trim: true,
          minlength: 3,
          maxlength: 15,
        },
        role: {
          type: String,
          enum: ["admin", "write", "read"],
          default: "read",
        },
      },
    ],

    requestedCustomer: [
      {
        email: {
          type: String,
          required: true,
          match: /^\S+@\S+\.\S+$/, // Basic email validation
        },
        name: {
          type: String,
          required: true,
          trim: true,
          minlength: 3,
          maxlength: 15,
        },
        role: {
          type: String,
          enum: ["admin", "write", "read"],
          default: "read",
        },
      },
    ],

    registerationDetail: [
      {
        registeredBy: {
          _id: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
          name: {
            type: String,
            required: true,
          },
        },
        registeredOn: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const MgmtDevice = mongoose.model("MgmtDevice", mgmtDeviceSchema);

const mgmtSchema = Joi.object({
  deviceId: Joi.string().length(10).trim().required().messages({
    "string.base": "Device ID must be a string.",
    "string.length": "Device ID must be exactly 10 characters long.",
    "string.empty": "Device ID is required.",
    "any.required": "Device ID is required.",
  }),

  authorizedUsers: Joi.array().items(
    Joi.object({
      _id: Joi.string().required().messages({
        "string.base": "User ID must be a string.",
        "string.empty": "User ID is required.",
        "any.required": "User ID is required.",
      }),
      email: Joi.string().email().required().messages({
        "string.base": "Email must be a string.",
        "string.email": "Email must be a valid email address.",
        "string.empty": "Email is required.",
        "any.required": "Email is required.",
      }),
      name: Joi.string().trim().min(3).max(15).required().messages({
        "string.base": "Name must be a string.",
        "string.empty": "Name is required.",
        "string.min": "Name must be at least 3 characters long.",
        "string.max": "Name must be at most 15 characters long.",
        "any.required": "Name is required.",
      }),
      role: Joi.string()
        .valid("super-admin", "admin", "customer")
        .default("customer")
        .messages({
          "string.base": "Role must be a string.",
          "any.only": "Role must be one of [super-admin, admin, customer].",
          "any.required": "Role is required.",
        }),
    })
  ),

  requestedUsers: Joi.array().items(
    Joi.object({
      _id: Joi.string().required().messages({
        "string.base": "User ID must be a string.",
        "string.empty": "User ID is required.",
        "any.required": "User ID is required.",
      }),
      email: Joi.string().email().required().messages({
        "string.base": "Email must be a string.",
        "string.email": "Email must be a valid email address.",
        "string.empty": "Email is required.",
        "any.required": "Email is required.",
      }),
      name: Joi.string().trim().min(3).max(15).required().messages({
        "string.base": "Name must be a string.",
        "string.empty": "Name is required.",
        "string.min": "Name must be at least 3 characters long.",
        "string.max": "Name must be at most 15 characters long.",
        "any.required": "Name is required.",
      }),
      role: Joi.string()
        .valid("super-admin", "admin", "customer")
        .default("customer")
        .messages({
          "string.base": "Role must be a string.",
          "any.only": "Role must be one of [super-admin, admin, customer].",
          "any.required": "Role is required.",
        }),
    })
  ),

  registerationDetail: Joi.array().items(
    Joi.object({
      registeredBy: Joi.object({
        _id: Joi.string().required().messages({
          "string.base": "RegisteredBy ID must be a string.",
          "string.empty": "RegisteredBy ID is required.",
          "any.required": "RegisteredBy ID is required.",
        }),
        name: Joi.string().required().messages({
          "string.base": "RegisteredBy Name must be a string.",
          "string.empty": "RegisteredBy Name is required.",
          "any.required": "RegisteredBy Name is required.",
        }),
      })
        .required()
        .messages({
          "object.base": "RegisteredBy must be an object.",
          "any.required": "RegisteredBy is required.",
        }),
      // registeredOn: Joi.date().required().messages({
      //   "date.base": "RegisteredOn must be a valid date.",
      //   "any.required": "RegisteredOn is required.",
      // }),
    })
  ),
}).messages({
  "any.required": "Field is required.",
  "object.base": "Field must be an object.",
  "array.base": "Field must be an array.",
});

const validateMgmtDevice = async (mgmtDeviceData) => {
  try {
    await mgmtSchema.validateAsync(mgmtDeviceData, { abortEarly: false });
  } catch (error) {
    return error;
  }
};

export { MgmtDevice, validateMgmtDevice };
