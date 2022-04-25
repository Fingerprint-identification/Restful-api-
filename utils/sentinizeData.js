exports.sanitizeUser = function (user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
  };
};
