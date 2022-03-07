import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { Input, Header, Messages } from './index';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexGrow: 8,
    flexDirection: 'column',
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
}));

const ActiveChat = ({
  user,
  conversations,
  activeConversation,
  postMessage
}) => {
  const classes = useStyles();

  const [otherUserLastViewed, setOtherUserLastViewed] = useState(null)

  const conversation = conversations
    ? conversations.find(
        (conversation) => conversation.otherUser.username === activeConversation
      )
    : {};  

  const isConversation = (obj) => {
    return obj !== {} && obj !== undefined;
  };

  const fetchOtherUserLastViewed = async () => {
    try {
      if (conversation) {
        const { data } = await axios.get(`/api/conversations/viewed/${conversation.id}`)
        setOtherUserLastViewed(data.otherUserLastViewed)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchOtherUserLastViewed()
  }, [activeConversation])

  return (
    <Box className={classes.root}>
      {isConversation(conversation) && conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            {user && (
              <>
                <Messages
                  conversationId={conversation.id}
                  messages={conversation.messages}
                  otherUser={conversation.otherUser}
                  userId={user.id}
                  otherUserLastViewed={otherUserLastViewed}
                />
                <Input
                  otherUser={conversation.otherUser}
                  conversationId={conversation.id || null}
                  user={user}
                  postMessage={postMessage}
                />
              </>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ActiveChat;
