import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Receipt from '@material-ui/icons/Receipt';
import MenuBook from '@material-ui/icons/MenuBook';
import AddCircleOutline from '@material-ui/icons/AddCircleOutline';
import ListAlt from '@material-ui/icons/ListAlt';
import Payment from '@material-ui/icons/Payment';
import ExitToApp from '@material-ui/icons/ExitToApp';
import { deleteTokens } from './auth';
import './admin.css';

const drawerWidth = 248;

const useStyles = makeStyles((theme) => ({
  root: { display: 'flex' },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    background: 'linear-gradient(90deg, #b71c1c 0%, #d32f2f 60%, #e53935 100%)',
    boxShadow: '0 2px 12px rgba(183,28,28,0.35)',
  },
  drawer: { width: drawerWidth, flexShrink: 0 },
  drawerPaper: {
    width: drawerWidth,
    background: '#1a0a07',
    color: '#f5ebe0',
    borderRight: 'none',
    boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    background: 'linear-gradient(160deg, #fff8f0 0%, #fdf0e8 100%)',
    minHeight: '100vh',
  },
  toolbar: theme.mixins.toolbar,
  title: { flexGrow: 1, fontWeight: 700, letterSpacing: 1, fontSize: '1.25rem' },
  nested: { paddingLeft: theme.spacing(5) },
  navItem: {
    borderRadius: '0 24px 24px 0',
    marginRight: 12,
    marginBottom: 2,
    color: '#e0c8c0',
    transition: 'background 0.2s',
    '&:hover': {
      background: 'rgba(211,47,47,0.18)',
      color: '#fff',
    },
  },
  activeItem: {
    background: 'linear-gradient(90deg, rgba(211,47,47,0.35), rgba(211,47,47,0.15))',
    borderLeft: '3px solid #ff7043',
    color: '#fff',
  },
  navIcon: { color: '#ff8a65', minWidth: 36 },
  activeIcon: { color: '#ffab91' },
  sectionHeader: {
    padding: '20px 16px 4px',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: 1.5,
    color: '#a1665a',
    textTransform: 'uppercase',
  },
  brandBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  brandEmoji: { fontSize: '2.2rem', lineHeight: 1 },
  brandName: { fontWeight: 800, fontSize: '1.15rem', color: '#fff', letterSpacing: 1, marginTop: 6 },
  brandTagline: { fontSize: '0.7rem', color: '#a1665a', marginTop: 2, letterSpacing: 0.5 },
  logoutBtn: {
    color: '#fff',
    borderColor: 'rgba(255,255,255,0.6)',
    '&:hover': { borderColor: '#fff', background: 'rgba(255,255,255,0.12)' },
  },
}));

export default function AdminLayout({ title, children }) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(true);

  const go = (path) => history.push(path);

  const logout = (e) => {
    e.preventDefault();
    deleteTokens();
    history.push('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            🍴 {title || 'Restaurant Admin'}
          </Typography>
          <Button variant="outlined" size="small" className={classes.logoutBtn} startIcon={<ExitToApp />} onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{ paper: classes.drawerPaper }}
      >
        <div className={classes.toolbar} />

        {/* Brand */}
        <div className={classes.brandBox}>
          <span className={classes.brandEmoji}>🍽️</span>
          <span className={classes.brandName}>DINE-IN</span>
          <span className={classes.brandTagline}>Restaurant Management</span>
        </div>

        <List style={{ paddingTop: 12 }}>
          <div className={classes.sectionHeader}>Operations</div>

          <ListItem
            button
            className={`${classes.navItem} ${isActive('/main') ? classes.activeItem : ''}`}
            onClick={() => go('/main')}
          >
            <ListItemIcon className={`${classes.navIcon} ${isActive('/main') ? classes.activeIcon : ''}`}>
              <Receipt />
            </ListItemIcon>
            <ListItemText primary="Live Orders" primaryTypographyProps={{ style: { fontWeight: isActive('/main') ? 700 : 400 } }} />
          </ListItem>

          <div className={classes.sectionHeader}>Menu</div>

          <ListItem button className={classes.navItem} onClick={() => setMenuOpen(!menuOpen)}>
            <ListItemIcon className={classes.navIcon}><MenuBook /></ListItemIcon>
            <ListItemText primary="Menu" />
            {menuOpen ? <ExpandLess style={{ color: '#ff8a65' }} /> : <ExpandMore style={{ color: '#ff8a65' }} />}
          </ListItem>

          <Collapse in={menuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                className={`${classes.navItem} ${classes.nested} ${isActive('/menu') ? classes.activeItem : ''}`}
                onClick={() => go('/menu')}
              >
                <ListItemIcon className={`${classes.navIcon} ${isActive('/menu') ? classes.activeIcon : ''}`}>
                  <ListAlt />
                </ListItemIcon>
                <ListItemText primary="Menu List" primaryTypographyProps={{ style: { fontWeight: isActive('/menu') ? 700 : 400 } }} />
              </ListItem>
              <ListItem
                button
                className={`${classes.navItem} ${classes.nested} ${isActive('/add') ? classes.activeItem : ''}`}
                onClick={() => go('/add')}
              >
                <ListItemIcon className={`${classes.navIcon} ${isActive('/add') ? classes.activeIcon : ''}`}>
                  <AddCircleOutline />
                </ListItemIcon>
                <ListItemText primary="Add Item" primaryTypographyProps={{ style: { fontWeight: isActive('/add') ? 700 : 400 } }} />
              </ListItem>
            </List>
          </Collapse>

          <div className={classes.sectionHeader}>Finance</div>

          <ListItem
            button
            className={`${classes.navItem} ${isActive('/payments') ? classes.activeItem : ''}`}
            onClick={() => go('/payments')}
          >
            <ListItemIcon className={`${classes.navIcon} ${isActive('/payments') ? classes.activeIcon : ''}`}>
              <Payment />
            </ListItemIcon>
            <ListItemText primary="Payments" primaryTypographyProps={{ style: { fontWeight: isActive('/payments') ? 700 : 400 } }} />
          </ListItem>
        </List>
      </Drawer>

      <main className={classes.content}>
        <div className={classes.toolbar} />
        {children}
      </main>
    </div>
  );
}

