const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const userConversation = require("./userConversation");

// associations
Conversation.belongsToMany(User, { through: userConversation})
User.belongsToMany(Conversation, { through: userConversation})
Message.belongsTo(User)
User.hasMany(Message)
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

module.exports = {
  User,
  Conversation,
  Message
};
