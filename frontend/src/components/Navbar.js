import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {deleteTokens} from './auth';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    background: 'linear-gradient(90deg, #b71c1c 0%, #d32f2f 60%, #e53935 100%)',
    boxShadow: '0 2px 12px rgba(183,28,28,0.35)',
  },
  title: {
    flexGrow: 1,
    fontWeight: 700,
    letterSpacing: 1,
  },
  navBtn: {
    borderColor: 'rgba(255,255,255,0.6)',
    color: '#fff',
    marginLeft: theme.spacing(1),
    '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.12)' },
  },
}));

const logout = (e) => {
   e.preventDefault();
   deleteTokens();
   window.location.replace('/register');
}

const navlink = () => {
  window.location.replace("/login")
}

export default function Navbar() {
      const classes = useStyles();
      return (
        <div className={classes.root}>
          <AppBar position="static" className={classes.appBar}>
            <Toolbar>
              <Typography variant="h6" className={classes.title}>
                🍴 DINE-IN
              </Typography>
              <Button variant="outlined" size="small" className={classes.navBtn} onClick={navlink}>Login</Button>
              <Button variant="outlined" size="small" className={classes.navBtn} onClick={logout}>Logout</Button>
            </Toolbar>
          </AppBar>
        </div>
      );
  }
