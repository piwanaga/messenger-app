import React, { useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Avatar } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';
import { SocketContext } from '../../context/socket';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  },
  senderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  avatar: {
    height: 20,
    width: 20,
    marginTop: 5
  }
}));

const Messages = (props) => {
  const classes = useStyles();
  const socket = useContext(SocketContext)

  const { conversationId, messages, otherUser, userId, otherUserLastViewed } = props;

  const [lastMessageRead, setLastMessageRead] = useState(false)

  const messageLoad = (userId, otherUser) => {
    socket.emit("message-load", { userId, otherUser })
  }

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    // If last message sent by logged in user, check if read
    setLastMessageRead(lastMessage.senderId === userId && otherUserLastViewed > lastMessage.createdAt)

    // if last message from other user, update read status
    if (lastMessage.senderId === otherUser.id) {
      messageLoad(userId, otherUser.id)
    }

  }, [otherUserLastViewed, messages, userId, otherUser.id])

  useEffect(() => {
    const updateLastViewed = async () => {
      try {
        // Update lastViewed in db
        await axios.patch('/api/conversations/viewed', {conversationId: conversationId})

      } catch (error) {
        console.error(error)
      }
    }
    updateLastViewed()
    
  }, [messages, conversationId])

  // check if data is returned and if the two users returned are in the active chat
  const checkIfMessageRead = useCallback((data) => {
    if (data.userId && data.userId === otherUser.id && data.otherUser === userId) setLastMessageRead(true)
  }, [userId, otherUser.id])

  useEffect(() => {
    socket.on('message-load', checkIfMessageRead);

    return () => {
      socket.off('message-load', checkIfMessageRead);
    }
  }, [checkIfMessageRead, socket])

  return (
    <Box className={classes.root}>
      {messages.map((message, idx) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          <Box key={message.id} className={classes.senderContainer}>
            <SenderBubble 
              text={message.text} 
              time={time} 
            />
            {idx === messages.length - 1 && lastMessageRead && <Avatar src={otherUser.photoUrl} className={classes.avatar} />}
          </Box>
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
