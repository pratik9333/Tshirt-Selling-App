exports.checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(401)
      .json({ error: "You are not allowded to access this resource" });
  }
  next();
};

exports.checkManager = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res
      .status(401)
      .json({ error: "You are not allowded to access this resource" });
  }
  next();
};
