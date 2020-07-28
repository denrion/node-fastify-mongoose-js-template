const BadRequestError = require('./errors/BadRequestError');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line no-unused-vars
    const { page, sort, limit, fields, ...queryObj } = this.queryString;

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(
      /\b(eq|gt|gte|in|lt|lte|ne|nin)\b/g,
      (matched) => `$${matched}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(/,/g, ' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    if (page <= 0)
      throw new BadRequestError('Not allowed to request negative pages');

    this.query = this.query.skip(skip).limit(limit);
    this.paginationLinks = { page, limit };

    return this;
  }

  createPaginationLinks(total) {
    if (!this.paginationLinks)
      throw new BadRequestError('No pagination information provided');

    const { page, limit } = this.paginationLinks;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    return pagination;
  }
}

module.exports = APIFeatures;
