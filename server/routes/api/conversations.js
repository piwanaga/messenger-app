const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id", "user1LastViewed", "user2LastViewed"],
      order: [[Message, "createdAt", "DESC"]],
      include: [
        { model: Message, order: ["createdAt", "DESC"] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    const checkUnread = (messages, lastViewed) => {
      let unread = 0

      // If newest message not from self, check timestamps to generate unread count
      if (messages[0].senderId !== userId) {
        for (let i = 0; i < messages.length; i++) {
          const createdAt = messages[i].createdAt
          if (createdAt <= lastViewed || messages[i].senderId === userId) return unread
          unread ++
        }
      }

      return unread
    }

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();
      let unreadCount = 0

      // set a property "otherUser" so that frontend will have easier access, generate unreadCount
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;

        unreadCount = checkUnread(convoJSON.messages, convoJSON.user2LastViewed)

      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;

        unreadCount = checkUnread(convoJSON.messages, convoJSON.user1LastViewed)
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      convoJSON.latestMessageText = convoJSON.messages[0].text;
      convoJSON.unreadCount = unreadCount
      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// fetch lastViewed data for a conversation
router.get("/viewed/:conversationId", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params

    const conversation = await Conversation.findAll({
      where: {
          id: conversationId 
      },
    });

    let otherUserLastViewed

    if (conversation) {
      if (userId === conversation[0].user1Id) {
        otherUserLastViewed = conversation[0].user2LastViewed
      } else if (userId === conversation[0].user2Id) {
        otherUserLastViewed = conversation[0].user1LastViewed
      }
    }

    

    res.json({ otherUserLastViewed })

  } catch (error) {
    next(error)
  }
})

// Update lastViewed property for logged in user
router.patch("/viewed", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.body

    // Make sure conversation exists
    const conversation = await Conversation.findAll({
      where: {
          id: conversationId 
      },
    });

    if (conversation) {
      if (userId === conversation[0].user1Id) {
        await Conversation.update({ user1LastViewed: Sequelize.fn('NOW')}, {
          where: {
            id: conversationId
          }
        })
      
      } else if (userId === conversation[0].user2Id) {
        await Conversation.update({ user2LastViewed: Sequelize.fn('NOW')}, {
          where: {
            id: conversationId
          }
        })
      }
    }

    res.json({ userId })
  } catch (error) {
    next(error)
  }
  
})

module.exports = router;
