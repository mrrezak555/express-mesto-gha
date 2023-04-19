const ERROR_CODE = 400;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERROR_CODE;
  }
}

module.exports = ValidationError;
