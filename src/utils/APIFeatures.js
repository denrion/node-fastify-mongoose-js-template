const BadRequestError = require('./errors/BadRequestError');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.queryStringCount = queryString;
  }

  searchAndFilter() {
    // eslint-disable-next-line no-unused-vars
    const { page, sort, limit, fields, ...queryObj } = this.queryString;

    const parsedQueryParams = Object.keys(queryObj).map((key) => {
      if (!key.includes('[') || !key.includes(']'))
        return {
          [key]: queryObj[key],
        };

      if (key.includes('search')) {
        const searchFilter = this.createSearchRegexFilter(queryObj);

        delete queryObj[key];

        return searchFilter;
      }

      const field = key.substring(0, key.indexOf('['));
      const operator = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
      let value = queryObj[key];

      if (value.includes(',')) {
        value = value.split(',');
      }

      return {
        [field]: { [`$${operator}`]: value },
      };
    });

    const query =
      parsedQueryParams.length === 0
        ? queryObj
        : parsedQueryParams.length > 1
        ? { $and: parsedQueryParams }
        : parsedQueryParams[0];

    this.queryStringCount = query;
    this.query = this.query.find(query);

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
    const page = +this.queryString.page ?? 1;
    const limit = +this.queryString.limit ?? 100;
    const skip = (page - 1) * limit;

    if (page <= 0) throw new BadRequestError('Not allowed to request negative pages');

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

  createSearchRegexFilter(queryObj) {
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/search|[[\]']+/g, '');

    const searchObj = JSON.parse(queryStr);
    const objKey = Object.keys(searchObj)[0];
    const searchValue = searchObj[objKey];

    const searchFilter = objKey.split(',').map((field) => {
      return { [field]: { $regex: searchValue, $options: 'i' } };
    });

    return { $or: searchFilter };
  }
}

module.exports = APIFeatures;
