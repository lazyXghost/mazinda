const storeTable = require("./models/store");
const locationTable = require("./models/location");
const categoryTable = require("./models/category");
const productTable = require("./models/product");
const userTable = require("./models/user");
const addressTable = require("./models/address");
const walletTable = require("./models/wallet");
const bcrypt = require("bcryptjs");
const req = require("express/lib/request");
const passport = require("passport");
const url = require("url");
var shortid = require("shortid");
const {getLocations,getCategories,addAddress} = require("../utils"); 

module.exports = {
  userRegister: async function (req) {
    console.log(req.body);
    const { phoneNumber, name, email, password, referralCode } = req.body;
    if (password.length < 8) {
      const message = "Password is too Short";
      console.log(message);
      return message;
    }
    const oldUser = await userTable.findOne({ phoneNumber });

    if (oldUser) {
      const message = "user already Exists";
      console.log(message);
      return message;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    if (referralCode) {
      console.log("this is ", referralCode);
      const wallet = await walletTable.findOne({ referralCode: referralCode });
      if (wallet) {
        const currentDate = new Date();
        if ((currentDate - wallet.createdOn) / 86400000 <= 10) {
          wallet.update({ coins: wallet.coins + 10 });
        }
      } else {
        const message = "Invalid Referral Code";
        console.log(message);
        return message;
      }
    }

    const user = await userTable.create({
      name: name,
      email: email,
      password: encryptedPassword,
      phoneNumber: phoneNumber,
    });

    await walletTable.create({
      user_id: user._id,
      createdOn: new Date(),
      coins: 0,
      referralCode: shortid.generate(),
    });

    const message = "user Created Successfully";
    console.log(message);
    return message;
  },
};
