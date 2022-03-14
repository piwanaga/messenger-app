const Sequelize = require("sequelize");
const db = require("../db");

const UserConversation = db.define("userConversation", {
  lastViewed: {
    type: Sequelize.DATE,
  },
});

module.exports = UserConversation