const EMAIL_ERROR = 409;

class EmailError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = EMAIL_ERROR;
  }
}

module.exports = EmailError;
