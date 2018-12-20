const db = require("./database");
const crypto = require("crypto");

function generatePassSalt() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16 / 2, (err, buf) => {
      if (err) return reject(err);
      resolve(buf.toString("hex"));
    });
  });
}

function generatePassHash(password, salt) {
  let md5 = crypto.createHash("md5");
  md5.update(
    crypto
      .createHash("md5")
      .update(password)
      .digest("hex")
  );
  md5.update(
    crypto
      .createHash("md5")
      .update(salt)
      .digest("hex")
  );
  return md5.digest("hex");
}

module.exports = {
  // Register a user by inserting to database
  register: (postData, admin = false) => {
    return new Promise((resolve, reject) => {
      let sanitizedObj = {
        first_name: postData.first_name,
        last_name: postData.last_name,
        user_name: postData.user_name,
        is_admin: admin ? 1 : 0
      };

      // Generate password salt
      generatePassSalt()
        .then(salt => {
          sanitizedObj.pass_salt = salt;
          // Generate password hash
          sanitizedObj.pass_hash = generatePassHash(postData.password, salt);
          return db.query("INSERT INTO users SET ?", sanitizedObj);
        })
        .then(result => resolve({...sanitizedObj, user_id: result.insertId}))
        .catch(err => reject(err.code === "ER_DUP_ENTRY" ? "Username already exists" : err));
    });
  },
  // check provided username and password, if match return user info as result
  login: postData => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE user_name=?", postData.user_name || "")
        .then(result => {
          if (!result.length) return reject("Username doesn't exist");
          result = result[0];
          // check password
          let passHash = generatePassHash(postData.password || "", result.pass_salt);
          if (result.pass_hash !== passHash) return reject("Password incorrect");
          resolve(result);
        })
        .catch(err => reject(err));
    });
  }
};
