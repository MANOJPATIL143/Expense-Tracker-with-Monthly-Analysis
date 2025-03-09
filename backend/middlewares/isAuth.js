const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  // console.log("req.headers.authorization", req.headers.authorization);
  
  //! Get the token from the header
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  //! Verify the token
  jwt.verify(token, "masynctechKey", (err, decoded) => {
    console.log("error", err);
    
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded.id; // Ensure the token contains the user ID
    next();
  });
};

module.exports = isAuthenticated;
