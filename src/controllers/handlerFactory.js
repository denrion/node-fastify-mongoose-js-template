const status = require('http-status');
const APIFeatures = require('../utils/APIFeatures');
const InternalServerError = require('../utils/errors/InternalServerError');
const NotFoundError = require('../utils/errors/NotFoundError');
const lowercaseFirstLetter = require('../utils/helpers/lowercaseFirstLetter');
const setCorrectPluralSuffix = require('../utils/helpers/setCorrectPluralSuffix');
const ResponseStatus = require('../constants/ResponseStatus');

const getAll = (Model) => async (request, reply) => {
  const filter = request.dbFilter ?? {};

  const features = new APIFeatures(Model.find(filter), request.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const documents = await features.query;
  const totalResults = await Model.countDocuments();

  return reply.status(status.OK).send({
    status: ResponseStatus.SUCCESS,
    returnedResults: documents.length,
    totalResults,
    pagination: features.createPaginationLinks(totalResults),
    data: {
      [setCorrectPluralSuffix(lowercaseFirstLetter(Model.modelName))]: documents,
    },
  });
};

const getOne = (Model, populateOptions) => async (request, reply) => {
  let query = Model.findById(request.params.id);

  if (populateOptions) query = query.populate(populateOptions);

  const document = await query;

  if (!document) throw new NotFoundError('No document found with the specified id');

  return reply.status(status.OK).send({
    status: ResponseStatus.SUCCESS,
    data: {
      [setCorrectPluralSuffix(lowercaseFirstLetter(Model.modelName))]: document,
    },
  });
};

const createOne = (Model) => async (request, reply) => {
  const document = await Model.create(request.body);

  if (!document)
    throw new InternalServerError('Error occured while creating a document. Please, try again.');

  return reply.status(status.CREATED).send({
    status: ResponseStatus.SUCCESS,
    data: {
      [setCorrectPluralSuffix(lowercaseFirstLetter(Model.modelName))]: document,
    },
  });
};

const updateOne = (Model) => async (request, reply) => {
  const document = await Model.findByIdAndUpdate(request.params.id, request.body, {
    new: true,
    runValidators: true,
  });

  if (!document) throw new NotFoundError('No document found with the specified id');

  reply.status(status.OK).send({
    status: ResponseStatus.SUCCESS,
    data: {
      [setCorrectPluralSuffix(lowercaseFirstLetter(Model.modelName))]: document,
    },
  });
};

const deleteOne = (Model) => async (request, reply) => {
  const document = await Model.findByIdAndDelete(request.params.id);

  if (!document) throw new NotFoundError('No document found with the specified id');

  reply.status(status.NO_CONTENT).send({ status: ResponseStatus.SUCCESS, data: null });
};

module.exports = { getAll, getOne, createOne, updateOne, deleteOne };
