import React, { useState, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { BadgeAvatar, ChatContent, BadgeUnreadCount } from '../Sidebar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: '0 2px 10px 0 rgba(88,133,196,0.05)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'grab',
    },
  },
}));

const Chat = ({ conversation, setActiveChat, unread }) => {
  const classes = useStyles();
  const { otherUser } = conversation;
  const [unreadCount, setUnreadCount] = useState(unread)

  useEffect(() => {
    setUnreadCount(unread)
  }, [unread])

  const handleClick = async (conversation) => {
    await setActiveChat(conversation.otherUser.username);
    setUnreadCount(0)
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} unreadCount={unreadCount}/>
      <BadgeUnreadCount unreadCount={unreadCount}/>
    </Box>
  );
};

export default Chat;
