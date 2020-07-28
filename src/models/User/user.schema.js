const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Role = require('../../constants/Role');
const { hashPassword, updatePasswordChangedAt } = require('./user.middleware');
const {
  isCorrectPassword,
  isPasswordChangedAfter,
  createPasswordResetToken,
} = require('./user.methods');
const { findByEmail } = require('./user.statics');
const sanitizeMongooseFields = require('../../utils/mongoose/sanitizeMongooseFields');
const sanitizeSpecifiedFields = require('../../utils/mongoose/sanitizeSpecifiedFields');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, '{PATH} field is required'],
      unique: true,
      uniqueCaseInsensitive: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    // username: {
    //   type: String,
    //   required: [true, 'This field is required'],
    //   unique: true,
    //   uniqueCaseInsensitive: true,
    //   trim: true,
    //   lowercase: true,
    //   minlength: [2, 'Username must contain at least 2 characters'],
    //   maxlength: [30, 'Username must not contain more than 30 characters'],
    //   match: [
    //     /^[a-zA-Z0-9]+(?:[_-]?[a-zA-Z0-9])*$/,
    //     'Username can only contain letters, numbers, underscores and dashes',
    //   ],
    // },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
      required: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must contain at least 8 characters'],
      maxlength: [50, 'Password must not contain more than 50 characters'],
      match: [
        /^[a-zA-Z0-9]+(?:[_-]?[a-zA-Z0-9])*$/,
        'Password can only contain letters, numbers, underscores and dashes',
      ],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please provide a password confirmation'],
      minlength: [8, 'Password must contain at least 8 characters'],
      maxlength: [50, 'Password must not contain more than 50 characters'],
      match: [
        /^[a-zA-Z0-9]+(?:[_-]?[a-zA-Z0-9])*$/,
        'Password can only contain letters, numbers, underscores and dashes',
      ],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

// // ************************ VIRTUALS ************************ //

// // ******************* DOCUMENT MIDDLEWARE ****************** //
UserSchema.pre('save', hashPassword);
UserSchema.pre('save', updatePasswordChangedAt);

// // ******************** QUERY MIDDLEWARE ******************* //

// // **************** AGGREGATION MIDDLEWARE **************** //

// // ******************* INSTANCE METHONDS ******************* //
UserSchema.methods.isCorrectPassword = isCorrectPassword;
UserSchema.methods.isPasswordChangedAfter = isPasswordChangedAfter;
UserSchema.methods.createPasswordResetToken = createPasswordResetToken;

// // ******************** STATIC METHODS ******************** //
UserSchema.statics.findByEmail = findByEmail;

// // ************************ PLUGINS *********************** //

UserSchema.plugin(uniqueValidator, { type: 'mongoose-unique-validator' });
UserSchema.plugin(sanitizeMongooseFields);
UserSchema.plugin(sanitizeSpecifiedFields, [
  'password',
  'passwordConfirm',
  'passwordChangedAt',
  'passwordResetToken',
  'passwordResetExpires',
  'isActive',
]);

module.exports = UserSchema;
