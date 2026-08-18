const IdempotencyKey = require('../models/IdempotencyKey');

const verifyIdempotency = async (req, res, next) => {
  const idempKey = req.headers['x-idempotency-key'];
  if (!idempKey) return next();

  try {
    const cached = await IdempotencyKey.findOne({ key: idempKey, userId: req.user.id });
    if (cached) {
      return res.status(cached.responseStatus).json(cached.responseData);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        IdempotencyKey.create({
          key: idempKey,
          userId: req.user.id,
          responseStatus: res.statusCode,
          responseData: data
        }).catch(console.error);
      }
      return originalJson(data);
    };

    next();
  } catch (err) {
    next(err);
  }
};
module.exports = { verifyIdempotency };