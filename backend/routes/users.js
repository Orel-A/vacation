const express = require("express");
const router = express.Router();
const sessions = require("../modules/sessions");
const users = require("../modules/users");

router.post("/login", (req, res) => {
  let g_user;
  users
    .login(req.body)
    .then(user => {
      g_user = user;
      return sessions.createLoginSession(user.user_id, res);
    })
    .then(() => {
      // Remove sensitive information
      delete g_user.pass_hash;
      delete g_user.pass_salt;
      res.json(g_user);
    })
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

router.get("/checkIfLogged", (req, res) => {
  sessions
    .fetchLoggedUser(req.cookies)
    .then(user => {
      // Remove sensitive information
      delete user.pass_hash;
      delete user.pass_salt;
      res.json(user);
    })
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

router.get("/logOut", (req, res) => {
  res.clearCookie("sessionID");
  res.send("");
});

router.post("/register", (req, res) => {
  if (
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.user_name ||
    !req.body.password
  ) {
    res.send("Incorrect params");
    return;
  }
  let g_user;
  users
    .register(req.body)
    .then(user => {
      g_user = user;
      return sessions.createLoginSession(user.user_id, res);
    })
    .then(() => {
      // Remove sensitive information
      delete g_user.pass_hash;
      delete g_user.pass_salt;
      res.json(g_user);
    })
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

module.exports = router;
