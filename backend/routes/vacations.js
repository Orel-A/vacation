const express = require("express");
const router = express.Router();
const sessions = require("../modules/sessions");
const db = require("../modules/database");
const ws = require('../modules/websockets');

router.put("/vacationFollow", (req, res) => {
  if (!req.body.hasOwnProperty("follow") || !req.body.vacation_id) {
    res.send("Incorrect params");
    return;
  }
  sessions
    .fetchLoggedUser(req.cookies)
    .then(user =>
      req.body.follow
        ? db.query("INSERT INTO vacation_followers SET ?", {
            user_id: user.user_id,
            vacation_id: req.body.vacation_id
          })
        : db.query(
            "DELETE FROM vacation_followers WHERE user_id=? AND vacation_id=?",
            [user.user_id, req.body.vacation_id]
          )
    )
    .then(() => res.send("success"))
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

router.delete("/vacations", (req, res) => {
  if (!req.body.vacation_id) {
    res.send("Incorrect params");
    return;
  }
  sessions
    .fetchLoggedUser(req.cookies)
    .then(user => {
      if (!user.is_admin) throw "Not an admin";
      // delete followers first before deleting the vacation
      return db.query(
        "DELETE FROM vacation_followers WHERE vacation_id=?",
        req.body.vacation_id
      );
    })
    .then(() =>
      db.query(
        "DELETE FROM vacations WHERE vacation_id=?",
        req.body.vacation_id
      )
    )
    .then(() => res.send("success"))
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

router.put("/vacations", (req, res) => {
  if (!req.body.vacation_id || Object.keys(req.body).length < 2) {
    res.send("Incorrect params");
    return;
  }

  sessions
    .fetchLoggedUser(req.cookies)
    .then(user => {
      if (!user.is_admin) throw "Not an admin";
      let updateObj = Object.assign({}, req.body);
      delete updateObj.vacation_id;

      return db.query("UPDATE vacations SET ? WHERE vacation_id=?", [
        updateObj,
        req.body.vacation_id
      ]);
    })
    .then(() => {
      ws.io.emit("vacationUpdate", req.body);
      res.json(req.body);
    })
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

router.post("/vacations", (req, res) => {
  sessions
    .fetchLoggedUser(req.cookies)
    .then(user => {
      if (!user.is_admin) throw "Not an admin";
      return db.query("INSERT INTO vacations SET ?", req.body);
    })
    .then(result => res.json({ ...req.body, vacation_id: result.insertId }))
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

router.get("/vacationsStats", (req, res) => {
  sessions
    .fetchLoggedUser(req.cookies)
    .then(user => {
      if (!user.is_admin) throw "Not an admin";
      return db.query(
        `SELECT COUNT(vf.vacation_id) AS followers, vf.vacation_id, v.destination
        FROM vacation_followers vf JOIN vacations v ON v.vacation_id=vf.vacation_id
        GROUP BY vf.vacation_id`
      );
    })
    .then(result => res.json(result))
    .catch(err => {
      if (err instanceof Error) {
        console.log(err);
        res.status(500);
        res.send("Internal Server Error");
      } else res.send(err);
    });
});

router.get("/vacations", (req, res) => {
  sessions
    .fetchLoggedUser(req.cookies)
    .then(user =>
      db.query(
        `SELECT v.*, NOT ISNULL(vf.user_id) AS follows
        FROM vacations v LEFT JOIN vacation_followers vf ON v.vacation_id=vf.vacation_id AND vf.user_id=?`,
        user.user_id
      )
    )
    .then(result => {
      result.forEach(e => {
        e.start_date = e.start_date.toISOString().slice(0, 10);
        e.end_date = e.end_date.toISOString().slice(0, 10);
      });
      res.json(result);
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
