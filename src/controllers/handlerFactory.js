const status = require('http-status');
const mongoose = require('mongoose');

const APIFeatures = require('../utils/APIFeatures');
const InternalServerError = require('../utils/errors/InternalServerError');
const NotFoundError = require('../utils/errors/NotFoundError');
const ResponseStatus = require('../constants/ResponseStatus');
const BadRequestError = require('../utils/errors/BadRequestError');

const getAll = (Model) => async (request, reply) => {
  const features = new APIFeatures(Model.find(), request.query)
    .searchAndFilter()
    .sort()
    .limitFields()
    .paginate();

  const documentsPromise = features.query;
  const countPromise = Model.where(features.queryStringCount).countDocuments();

  const [documents, count] = await Promise.all([documentsPromise, countPromise]);

  return reply.status(status.OK).send({
    status: ResponseStatus.SUCCESS,
    count,
    pagination: features.createPaginationLinks(count),
    data: documents,
  });
};

const getOne = (Model, populateOptions) => async (request, reply) => {
  const filter = { ...request.findOneFilter, _id: request.params.id };

  let query = Model.findById(filter);

  if (populateOptions) query = query.populate(populateOptions);

  const document = await query;

  if (!document) throw new NotFoundError('No document found with the specified id');

  return reply.status(status.OK).send({
    status: ResponseStatus.SUCCESS,
    data: document,
  });
};

const createOne = (Model) => async (request, reply) => {
  // eslint-disable-next-line no-unused-vars
  const { _id, ...filteredBody } = request.body;

  const instance = new Model(filteredBody);

  const document = await instance.save();

  if (!document)
    throw new InternalServerError(
      'Error occured while creating a document. Please, try again.'
    );

  return reply.status(status.CREATED).send({
    status: ResponseStatus.SUCCESS,
    data: document,
  });
};

const updateOne = (Model) => async (request, reply) => {
  // eslint-disable-next-line no-unused-vars
  const { _id, ...filteredBody } = request.body;
  const filter = { ...request.findOneFilter, _id: request.params.id };

  const doc = await Model.findOne(filter);

  if (!doc) throw new NotFoundError('No document found with the specified id');

  Object.keys(filteredBody).forEach((key) => {
    doc[key] = filteredBody[key];
  });

  const document = await doc.save({ validateModifiedOnly: true });

  reply.status(status.OK).send({
    status: ResponseStatus.SUCCESS,
    data: document,
  });
};

const deleteOne = (Model) => async (request, reply) => {
  const filter = { ...request.findOneFilter, _id: request.params.id };

  const document = await Model.findOne(filter);

  if (!document) throw new NotFoundError('No document found with the specified id');

  document.remove();

  reply.status(status.NO_CONTENT).send({ status: ResponseStatus.SUCCESS, data: null });
};

const deleteMany = (Model, options) => async (request, reply) => {
  const data = request.body?.data;

  if (!data) throw new BadRequestError(`data field is required`);

  const filter = { ...request.deleteManyFilter, _id: data };

  let count = 0;

  if (!options) {
    const { ok, deletedCount } = await Model.deleteMany(filter);

    if (ok !== 1)
      throw new InternalServerError(`Something went wrong while trying to delete`);

    count = deletedCount;
  } else {
    const session = await mongoose.connection.startSession();

    await mongoose.connection.transaction(async () => {
      const mainResult = await Model.deleteMany(filter, { session });

      options.relationships.forEach(async ({ model, foreignKey }) => {
        const { ok } = await mongoose
          .model(model)
          .deleteMany({ [foreignKey]: data }, { session });

        if (ok !== 1)
          throw new InternalServerError(`Something went wrong while trying to delete`);
      });

      count = mainResult.deletedCount;
    });
  }

  reply.status(status.OK).send({ status: ResponseStatus.SUCCESS, count: count });
};

module.exports = { getAll, getOne, createOne, updateOne, deleteOne, deleteMany };
