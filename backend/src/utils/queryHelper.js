function getPaginationParams(query, defaultLimit = 10) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
}

function getPaginationMetadata(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}

function parseSortParam(sortStr, defaultField = "createdAt", defaultOrder = "desc") {
  if (!sortStr) {
    return { [defaultField]: defaultOrder === "asc" ? 1 : -1 };
  }

  const isDesc = sortStr.startsWith("-");
  const fieldName = isDesc ? sortStr.substring(1) : sortStr;
  return { [fieldName]: isDesc ? -1 : 1 };
}

function parseFilterParams(query, allowedFields = []) {
  const filters = {};
  allowedFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== "") {
      filters[field] = query[field];
    }
  });
  return filters;
}

module.exports = {
  getPaginationParams,
  getPaginationMetadata,
  parseSortParam,
  parseFilterParams
};
