class ApiError extends Error {
constructor(message, status = 500, code = 'ERROR') {
super(message);
this.status = status;
this.code = code;
}
}


class BadRequestError extends ApiError { constructor(msg){ super(msg || 'Bad Request', 400, 'BAD_REQUEST'); } }
class NotFoundError extends ApiError { constructor(msg){ super(msg || 'Not Found', 404, 'NOT_FOUND'); } }
class UnprocessableError extends ApiError { constructor(msg){ super(msg || 'Unprocessable', 422, 'UNPROCESSABLE'); } }


function apiErrorHandler(err, req, res, next) {
if (res.headersSent) return next(err);
if (err instanceof ApiError) {
return res.status(err.status).json({ error: { message: err.message, code: err.code } });
}
console.error(err);
res.status(500).json({ error: { message: 'Internal Server Error', code: 'INTERNAL' } });
}


module.exports = { ApiError, BadRequestError, NotFoundError, UnprocessableError, apiErrorHandler };