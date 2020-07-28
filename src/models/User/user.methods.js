const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const isCorrectPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword);

// Check if password was changed after the JWT token was sent
function isPasswordChangedAfter(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = +this.passwordChangedAt.getTime() / 1000;
    return JWTTimestamp < new Date(changedTimestamp);
  }

  return false;
}

function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
}

module.exports = {
  // signToken,
  isCorrectPassword,
  isPasswordChangedAfter,
  createPasswordResetToken,
};
