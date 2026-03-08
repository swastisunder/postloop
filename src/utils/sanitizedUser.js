exports.sanitizedUser = (user) => {
  const { password, isActive, isDeleted, deletedBy, createdAt, ...safeUser } =
    user;
  return safeUser;
};
