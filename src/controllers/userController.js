const handlerFactory = require('./handlerFactory');
const User = require('../models/User/user.model');

/**
 * @desc      Get All Users
 * @route     GET /api/v1/users
 * @access    Private
 */
const getAllUsers = handlerFactory.getAll(User);

/**
 * @desc      Get User By Id
 * @route     GET /api/v1/users/:userId
 * @access    Private
 */
const getUserById = handlerFactory.getOne(User);

/**
 * @desc      Create New User
 * @route     POST /api/v1/users
 * @access    Private
 */
const createUser = handlerFactory.createOne(User);

/**
 * @desc      Update user
 * @route     PATHS /api/v1/users/:userId
 * @access    Private
 */
const updateUser = handlerFactory.updateOne(User);

/**
 * @desc      Delete User
 * @route     DELETE /api/v1/users/:userId
 * @access    Private
 */
const deleteUser = handlerFactory.deleteOne(User);

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
