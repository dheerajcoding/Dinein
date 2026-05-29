import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 20,
    padding: '8px 4px',
  },
  card: {
    background: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 4px 18px rgba(183,28,28,0.10)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 30px rgba(183,28,28,0.18)',
    },
  },
  cardHeader: {
    background: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)',
    padding: '18px 18px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  foodEmoji: {
    fontSize: '2rem',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '50%',
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardName: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.05rem',
    margin: 0,
    lineHeight: 1.2,
  },
  cardId: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '0.7rem',
    marginTop: 3,
  },
  cardBody: {
    padding: '14px 18px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  description: {
    color: '#7b5e57',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontWeight: 800,
    fontSize: '1.25rem',
    color: '#d32f2f',
    letterSpacing: '-0.5px',
  },
  vegBadge: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#e8f5e9',
    color: '#2e7d32',
    border: '1px solid #a5d6a7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBtn: {
    background: 'linear-gradient(90deg, #d32f2f, #e53935)',
    color: '#fff',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: '0.875rem',
    padding: '10px 0',
    width: 'calc(100% - 36px)',
    margin: '0 18px 18px',
    boxShadow: '0 4px 12px rgba(211,47,47,0.35)',
    '&:hover': {
      background: 'linear-gradient(90deg, #b71c1c, #d32f2f)',
      boxShadow: '0 6px 16px rgba(183,28,28,0.45)',
    },
  },
});

const FOOD_EMOJIS = ['🍛', '🍜', '🍕', '🥘', '🍗', '🥗', '🍲', '🧆', '🥩', '🍱'];

function getEmoji(id) {
  return FOOD_EMOJIS[Number(id) % FOOD_EMOJIS.length];
}

export default function SimpleCard(props) {
  const classes = useStyles();
  const additem = props.additem;

  return (
    <div className={classes.grid}>
      {props.data.map((x, i) => (
        <div className={classes.card} key={`${x.id}-${i}`}>
          <div className={classes.cardHeader}>
            <div className={classes.foodEmoji}>{getEmoji(x.id)}</div>
            <div>
              <p className={classes.cardName}>{x.name}</p>
              <span className={classes.cardId}>Item #{x.id}</span>
            </div>
          </div>

          <div className={classes.cardBody}>
            <p className={classes.description}>{x.description || 'Freshly prepared with premium ingredients.'}</p>
            <div className={classes.priceRow}>
              <span className={classes.price}>Rs. {x.amount}</span>
              <span className={classes.vegBadge}>🌿 Available</span>
            </div>
          </div>

          <Button className={classes.addBtn} onClick={() => additem(x, i)}>
            + Add to Cart
          </Button>
        </div>
      ))}
    </div>
  );
}
