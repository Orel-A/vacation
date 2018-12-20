const crypto = require("crypto");
const db = require("./database");
const CronJob = require("cron").CronJob;
const moment = require("moment");
const secretKey = "Curiosity killed the cat";

// A cron job that will run every hour to clean old sessions
const cleanerJob = new CronJob("0 * * * *", () => {
  console.log("cleanerJob: " + moment().format("HH:mm"));
  db.query("DELETE FROM sessions WHERE expires < NOW()");
});
cleanerJob.start();

// Generates a random string of 64 characters using a secret key
function generateSessionID() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(256, (err, buf) => {
      if (err) return reject(err);
      let sha = crypto.createHash("sha256");
      sha.update(buf);
      sha.update(secretKey);
      resolve(sha.digest("hex"));
    });
  });
}

module.exports = {
  // check for a cookie called 'sessionID' and if it exists in database assume user is logged
  fetchLoggedUser: cookies => {
    return new Promise((resolve, reject) => {
      if (!cookies.sessionID) return reject("Not logged");
      db.query(
        "SELECT u.* FROM sessions s JOIN users u ON s.user_id=u.user_id WHERE s.session_id=?",
        cookies.sessionID
      )
        .then(result => {
          if (!result.length) return reject("Not logged");
          result = result[0];
          resolve(result);
        })
        .catch(err => reject(err));
    });
  },
  // create a new login session entry in database and send the cookie to the browser
  createLoginSession: (userId, res) => {
    return new Promise((resolve, reject) => {
      let g_sessionId;
      db.query("DELETE FROM sessions WHERE user_id=?", userId)// delete previous if any
        .then(generateSessionID)
        .then(sessionId => {
          g_sessionId = sessionId;
          return db.query("INSERT INTO sessions SET ?", {
            session_id: sessionId,
            user_id: userId,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24) //TODO: change duration
          });
        })
        .then(result => {
          res.cookie("sessionID", g_sessionId, { httpOnly: true });
          resolve(result);
        })
        .catch(err => reject(err));
    });
  }
};
