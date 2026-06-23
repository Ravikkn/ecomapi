import jwt from "jsonwebtoken";
const jwtAuth = (req, res, next) => {
  // 1. read header
  const authHeader = req.headers["authorization"];

  // 2. check if exists
  if (!authHeader) {
    return res.status(401).send("Unauthorized");
  }

  try {
    // ✅ handle both formats
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    // ✅ 4. verify token
    const payload = jwt.verify(
      token,
      "uGVKPUGVZMnCyjtcfMBnCvnbGw+M8APYON43Sa6nPNw",
    );

    // ✅ 5. attach userID
    req.userID = payload.userID;
    req.userEmail = payload.email;
    req.userType = payload.type;
    req.userName = payload.name;

    console.log("DECODED:", payload);

    next();

    // //1. read the token
    // const token = req.headers['authorization'];

    // //2.if no token return the error
    // if (!token){
    //     return res.status(401).send("Unauthorized");
    // }

    // //3.check if token is valid
    // try{
    //   const payload = jwt.verify(token,'uGVKPUGVZMnCyjtcfMBnCvnbGw+M8APYON43Sa6nPNw');
    //   req.userID = payload.userID;
    //   console.log(payload);
    // }
    // catch(err){
    //      //4. return error
    //      return res.status(401).send("Unauthorized");
    // }

    // //5.call next middleware
    // next();
  } catch (err) {
    //4. return error
    return res.status(401).send("error : " + err.message);
  }
};

export default jwtAuth;
