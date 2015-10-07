'use strict';

const express = require('express');
const app = express();
const database = require('./lib/database');
const moment    = require('moment');

database.init('db.json', () => {
  console.log('Database ready!');
});

app.get('/api/posts', function(req, res) {
  validateQuerySearch(req, (err) => {
    if (err) {
      return res.status(400).json({error: err.message});
    }

    res.status(200).json(database.search({
      author: req.query.author,
      from: req.query.from,
      to: req.query.to
    }));
  });
});

app.get('*', function(req, res) {
  res.status(404).json({error: 'Only route available is /api/posts'});
});

app.listen(3000);
console.log('Server listening to %d', 3000);

/**
 * validateQuerySearch:
 *
 * @param  {Object}   req   request object
 * @param  {Function} f     f(err)
 */
function validateQuerySearch(req, f) {
  if (isValidDate(req.query.from) || isValidDate(req.query.to)) {
    return f(null);
  }

  return f(new Error('Invalid date format in query argument (YYYY-MM-DD)'));
}

/**
 * isValidDate: simple check with moment of given date
 *
 * @param  {String} date  date query arg
 * @return {Boolean}      whether or not given date is a valid date
 */
function isValidDate(date) {
  if (date !== undefined) {
    return moment(date, 'YYYY-MM-DD').format('L') !== 'Invalid date';
  }

  return true;
}

