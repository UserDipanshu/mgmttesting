import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 15,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      min: 8,
      max : 16,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/, // Basic email validation
    },
    contactNumber: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/, // Ensure exactly 10 digits
    },
    registeredDevices: {
      type: [
        {
          deviceId: {
            type: String,
            length: 10,
          },
        },
      ],
      default: [], // Set default to an empty array
    },
    // this role defines who the login user is : MRM , MIDDLEMAN , OR ANY OTHER CUSTOMER
    role: {
      type: String,
      enum: ["super-admin", "admin", "customer"],
      default: "customer",
    },
    totalDevices: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function (user) {
  const accessTokenKey = process.env.ACCESS_TOKEN_JWT_SECRET_KEY;
  const refreshTokenKey = process.env.REFRESH_TOKEN_JWT_SECRET_KEY;
  try {
    const accessToken = jwt.sign(
      {
        _id: this._id,
        email: user.email,
        role: this.role,
      },
      accessTokenKey,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      {
        _id: this._id,
        email: user.email,
        role: this.role,
      },
      refreshTokenKey,
      {
        expiresIn: "72h",
      }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const User = mongoose.model("User", userSchema);

const userValidationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(15).required().messages({
    "string.base": "Name should be a type of text.",
    "string.empty": "Name cannot be empty.",
    "string.min": "Name should have a minimum length of 3 characters.",
    "string.max": "Name should have a maximum length of 15 characters.",
    "any.required": "Name is required.",
  }),

  password: Joi.string().trim().min(8).max(16).required().messages({
    "string.base": "Password should be a type of text.",
    "string.empty": "Password cannot be empty.",
    "string.min": "Password should have a minimum length of 8 characters.",
    "string.max": "Password should have a maximum length of 16 characters.",
    "any.required": "Password is required.",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email must be a valid email.",
      "any.required": "Email is required.",
    }),

  contactNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Contact number must be a valid 10-digit Indian number starting with 6-9.",
      "any.required": "Contact number is required.",
    }),

  registeredDevices: Joi.array().items(
    Joi.object({
      deviceId: Joi.string().length(10).required().messages({
        "string.length": "Device ID must be exactly 10 characters long.",
        "any.required": "Device ID is required.",
      }),
    })
  ),

  role: Joi.string()
    .valid("super-admin", "admin", "customer")
    .default("customer")
    .messages({
      "any.only": 'Role must be one of "super-admin", "admin", or "customer".',
    }),

  totalDevices: Joi.number().default(0).messages({
    "number.base": "Total devices should be a number.",
  }),
});

// Function to validate user data
const validateUser = async (user) => {
  try {
    await userValidationSchema.validateAsync(user, { abortEarly: false });
  } catch (error) {
    return error;
  }
};

export { User, validateUser };
