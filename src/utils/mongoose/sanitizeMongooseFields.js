const mongoose = require('mongoose');

const sanitizeMongooseFields = (schema) => {
  const toJSON = schema.methods.toJSON || mongoose.Document.prototype.toJSON;

  schema.set('toJSON', {
    virtuals: true,
  });

  schema.methods.toJSON = function (...args) {
    const json = toJSON.apply(this, args);

    delete json._id;
    delete json.__v;
    delete json.updatedAt;
    delete json.createdAt;

    return json;
  };
};

module.exports = sanitizeMongooseFields;
