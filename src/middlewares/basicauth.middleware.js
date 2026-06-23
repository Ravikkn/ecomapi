import UserModel from "../features/user/user.model.js";
const basicAuthorizer = (req, res, next)=>{
    //1.check if authorizer header is empty.
    const authHeader = req.headers["authorization"];
    if(!authHeader){
        return res.status(401).send("No authorization details found")
    }
    console.log(authHeader);
    //2.Extract the credentials.  ['Basic qrtwewrrtdtrdtf6f556cfcghg']
    const bash64Credentials = authHeader.replace('Basic ','');
    console.log(bash64Credentials);

    //3. decode credentials
    const decodedCreds = Buffer.from(bash64Credentials, 'base64').toString('utf8')
      console.log(decodedCreds); //[usernam:password]
    const creds = decodedCreds.split(':')
    const user = UserModel.getAll().find(u=> u.email===creds[0] && u.password===creds[1]);
    if(user){
        next();
    }else{
        return res.status(401).send("Incorrect Credentials")
    }
};

export default basicAuthorizer;