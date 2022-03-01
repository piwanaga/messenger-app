import React from 'react'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
      borderRadius: '16px',
      padding: '4px 10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontWeight: 'bold',
      backgroundColor: '#3A8DFF'
    },
    hidden: {
        visibility: 'hidden'
    }
  }));

const BadgeUnreadCount = ({ unreadCount }) => {
    const classes = useStyles();

    return (
        <div className={unreadCount > 0 ? classes.root : classes.hidden}>{unreadCount}</div>
    )
}

export default BadgeUnreadCount