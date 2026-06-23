const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userType || !allowedRoles.includes(req.userType)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export default authorizeRole;
