import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Avatar } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

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

  const { conversationId, messages, otherUser, userId } = props;
  const [otherUserLastViewed, setOtherUserLastViewed] = useState()

  // Update lastViewed in db
  useEffect(() => {
    const updateLastViewed = async () => {
      try {
        const { data } = await axios.patch('/api/conversations/viewed', {conversationId: conversationId})
        setOtherUserLastViewed(data.otherUserLastViewed)
      } catch (error) {
        console.error(error)
      }
    }
    updateLastViewed()
    
  }, [messages, conversationId])

  return (
    <Box className={classes.root}>
      {messages.map((message, idx) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          <div key={message.id} className={classes.senderContainer}>
            <SenderBubble text={message.text} time={time}/>
            {idx === messages.length - 1 && otherUserLastViewed > message.createdAt && <Avatar src={otherUser.photoUrl} className={classes.avatar} /> }
          </div>
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
