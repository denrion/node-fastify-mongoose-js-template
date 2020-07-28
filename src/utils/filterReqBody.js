const filterReqBody = (reqBody, ...allowedFields) => {
  const filteredBody = {};

  Object.keys(reqBody).forEach((el) => {
    if (allowedFields.includes(el)) filteredBody[el] = reqBody[el];
  });

  return filteredBody;
};

module.exports = filterReqBody;
