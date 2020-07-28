const status = require('http-status');

const User = require('../models/User/user.model');
const ResponseStatus = require('../constants/ResponseStatus');
const BadRequestError = require('../utils/errors/BadRequestError');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');
const filterReqBody = require('../utils/filterReqBody');

const createTokenAndSendResponse = async (user, statusCode, request, reply) => {
  const tokenPayload = { id: user.id };

  const token = await reply.jwtSign(tokenPayload, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // turn into milis
    ),
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === 'production', // request.headers['x-forwarded-proto'] === 'https', // The second one is ONLY for Heroku
  };

  return reply.status(statusCode).setCookie('token', token, cookieOptions).send({
    status: ResponseStatus.SUCCESS,
    data: { token, user },
  });
};

/**
 * @desc      Signup user
 * @route     POST /api/v1/auth/signup
 * @access    Public
 */
const signup = async (request, reply) => {
  // deconstruct allowed fields
  // prevent user from submiting unwanted values
  // e.g prevent user from specifying role, defaults to user
  const { email, password, passwordConfirm } = request.body;

  const user = await User.create({ email, password, passwordConfirm });

  return createTokenAndSendResponse(user, status.CREATED, request, reply);
};

/**
 * @desc      Login user
 * @route     POST /api/v1/auth/login
 * @access    Public
 */
const login = async (request, reply) => {
  const { email, password } = request.body;

  if (!email || !password) throw new BadRequestError('Please provide email and password!');

  const user = await User.findByEmail(email).select('+password');

  if (!user || !(await user.isCorrectPassword(password, user.password)))
    throw new UnauthorizedError('Invalid credentials');

  return createTokenAndSendResponse(user, status.OK, request, reply);
};

/**
 * @desc      Get Current Logged In user
 * @route     GET /api/v1/auth/me
 * @access    Private
 */
const getMe = async (request, reply) => {
  const user = await User.findById(request.user.id);

  return reply.status(status.OK).send({
    success: ResponseStatus.SUCCESS,
    data: { user },
  });
};

/**
 * @desc     Update info about the currently logged in user
 * @route    PATCH /api/v1/auth/updateMe
 * @access   Private
 * @usage    e.g used to update current logged in user data on a profile page
 *           specify allowed fields to be updated as a 2nd paramm to filterReqBody
 */
const updateMe = async (request, reply) => {
  // Only allow update for specified fields
  const filteredBody = filterReqBody(request.body, 'email');

  const user = await User.findByIdAndUpdate(request.user.id, filteredBody, {
    new: true,
    runValidators: true,
    context: 'query',
  });

  return reply.status(status.OK).send({
    status: ResponseStatus.SUCCESS,
    data: { user },
  });
};

/**
 * @desc      Update Password of currently logged in user
 * @route     PATCH /api/v1/auth/updateMyPassword
 * @access    Private
 * @usage     e.g used to updated current logged in user's password on a profile page
 */
const updateMyPassword = async (request, reply) => {
  // 1) Get user from DB by ID from req.user object set by isAuth middleware
  const user = await User.findById(request.user.id).select('+password');

  // 2a) Check if sent current password is correct
  const { oldPassword, newPassword, passwordConfirm } = request.body;

  if (!user || !(await user.isCorrectPassword(oldPassword, user.password)))
    throw new UnauthorizedError('Invalid password');

  // 2b) Check if new password is not the same as old password
  if (newPassword === oldPassword)
    throw new BadRequestError('New password cannot be the same as old password');

  // 3) if so, update password
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  return createTokenAndSendResponse(user, status.OK, request, reply);
};

/**
 * @desc      "Delete" currently logged in user
 * @route     PATCH /api/v1/auth/deleteMe
 * @access    Private
 * @usage     Deactivate current user's profile
 */
const deleteMe = async (request, reply) => {
  await User.findByIdAndUpdate(
    request.user.id,
    { isActive: false },
    {
      new: true,
      runValidators: true,
      context: 'query',
    }
  );

  return reply.status(status.NO_CONTENT).send({
    success: ResponseStatus.SUCCESS,
    data: null,
  });
};

module.exports = {
  signup,
  login,
  getMe,
  updateMe,
  updateMyPassword,
  deleteMe,
};
