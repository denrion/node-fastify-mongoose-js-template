const mongoose = require('mongoose');

const sanitizeSpecifiedFields = (schema, fieldsToExclude = []) => {
  const toJSON = schema.methods.toJSON || mongoose.Document.prototype.toJSON;

  schema.set('toJSON', {
    virtuals: true,
  });

  schema.methods.toJSON = function (...args) {
    const json = toJSON.apply(this, args);

    fieldsToExclude.forEach((el) => delete json[el]);

    return json;
  };
};

module.exports = sanitizeSpecifiedFields;
