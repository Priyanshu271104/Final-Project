const MAX_QUERY_LENGTH = 100;

function validateSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    throw new Error(
      'Query parameter "q" is required'
    );
  }

  const trimmed = query.trim();

  if (!trimmed.length) {
    throw new Error(
      'Query cannot be empty'
    );
  }

  if (
    trimmed.length > MAX_QUERY_LENGTH
  ) {
    throw new Error(
      `Query must be ${MAX_QUERY_LENGTH} characters or fewer`
    );
  }

  return trimmed;
}

module.exports = {
  validateSearchQuery,
};