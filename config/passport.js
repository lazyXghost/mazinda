const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

module.exports = function (passport) {
  passport.use(
    "user-local",
    new localStrategy(
      { usernameField: "phoneNumber", passwordField: "password" },
      async function (phoneNumber, password, done) {
        const userTable = require("../models/user");
        const user = await userTable.findOne({ phoneNumber: phoneNumber });
        if (user && (await bcrypt.compare(password, user.password))) {
          return done(null, user);
        }
        return done(null, false);
      }
    )
  );
  passport.use(
    "store-local",
    new localStrategy(
      { usernameField: "input", passwordField: "password" },
      async function (input, password, done) {
        const storeTable = require("../models/store");
        let store;
        if (input.search("@") != -1)
          store = await storeTable.findOne({ email: input });
        else
          store = (await storeTable.findOne({ phoneNumber: input })) || (await storeTable.findOne({ whatsappNumber: input }));

        console.log(input);
        console.log(store);
        if (store && (await bcrypt.compare(password, store.password))) {
          return done(null, store);
        }
        return done(null, false);
      }
    )
  );
  passport.use(
    "admin-local",
    new localStrategy(
      { usernameField: "username", passwordField: "password" },
      async function (username, password, done) {
        const adminTable = require("../models/admin");
        const admin = await adminTable.findOne({ userName: username });
        if (admin && (await bcrypt.compare(password, admin.password))) {
          return done(null, admin);
        }
        return done(null, false);
      }
    )
  );
  passport.serializeUser((userObj, done) => {
    done(null, userObj);
  });
  passport.deserializeUser((userObj, done) => {
    done(null, userObj);
  });
};
