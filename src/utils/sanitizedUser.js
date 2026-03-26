exports.sanitizedUser = (user) => {
  const obj = user.toObject ? user.toObject() : user;
  const { password, __v, _id, ...safeUser } = obj;
  return { userId: _id, ...safeUser };
};
