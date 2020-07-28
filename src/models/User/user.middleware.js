const bcrypt = require('bcryptjs');

// ******************* DOCUMENT MIDDLEWARE ****************** //
async function hashPassword(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Don't store passwordConfirm field in DB
  this.passwordConfirm = undefined;

  next();
}

function updatePasswordChangedAt(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // Add -1000, because saving to DB is sometimes slower than sending JWT
  this.passwordChangedAt = Date.now() - 1000;

  next();
}

// ******************** QUERY MIDDLEWARE ******************* //

// **************** AGGREGATION MIDDLEWARE **************** //

module.exports = { hashPassword, updatePasswordChangedAt };
