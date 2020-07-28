function findByEmail(email) {
  return this.findOne({ email });
}

// export function findByUsername(this: IUserModel, username: string) {
//   return this.findOne({ username });
// }

module.exports = { findByEmail };
