'use strict';

const loki = require('lokijs');
const moment = require('moment');

var database = (function() {

  let db = null;
  let vdms = null;

  /**
   * init: initialize database
   *
   * @param  {String}   database datebase name
   * @param  {Function} f        f(err)
   */
  function init(database, f) {
    db = new loki(database);
    db.loadDatabase({}, (err) => {
      if (err) {
        return f(err);
      }

      vdms = db.getCollection('vdms') !== null ?
              db.getCollection('vdms') :
              db.addCollection('vdms', {indices: ['author', 'date']});
      f();
    });
  }

  /**
   * insert: inserts given array of vdms into database
   *
   * @param  {Array} array  array of vdms {content, author, date}
   */
  function insert(array) {
    if (vdms === null) {
      return false;
    }

    vdms.insert(array);
    db.save();
  }

  /**
   * clear: remove all data from database
   */
  function clear() {
    vdms.removeDataOnly();
    db.save();
  }

  /**
   * search: returns vdms corresponding to options parameters
   *
   * @param  {Object} options filter parameters
   * @return {Object}         {posts: [vdms], count} vdms corresponding to search parameters
   */
  function search(options) {
    if (options === undefined) {
      options = {};
    }

    let _result = vdms.chain();
    if (options.from !== undefined) {
      let _dateFrom = moment(options.from, 'YYYY-MM-DD');
      _result = _result.where((vdm) => {
        let _date = moment(vdm.date, 'YYYY-MM-DD HH:mm:ss');
        return _date > _dateFrom;
      });
    }

    if (options.to !== undefined) {
      let _dateTo = moment(options.to, 'YYYY-MM-DD').add(1, 'day');
      _result = _result.where((vdm) => {
        let _date = moment(vdm.date, 'YYYY-MM-DD HH:mm:ss');
        return _date < _dateTo;
      });
    }

    if (options.author !== undefined) {
      _result = _result.where((vdm) => {
        return vdm.author.includes(options.author);
      });
    }

    return _result.sort(sortDescFunction).mapReduce(mapFunction, reduceFunction);
  }

  /**
   * mapFunction: will map $loki as the vdm id
   *
   * @param  {Object} vdm {$loki, content, author, date}
   * @return {Object}     {id, content, author, date}
   */
  function mapFunction(vdm) {
    return {
      id: vdm.$loki,
      content: vdm.content,
      author: vdm.author,
      date: vdm.date
    };
  }

  /**
   * reduceFunction: will construct the object for the API response
   *
   * This shouldn't be here, since the database should not format data for a specific use outside of database
   * But this is a small project, that will not live long!
   *
   * @param  {Array}  vdmArray  array of vdm object constructed from mapFunction
   * @return {Object}           {posts: <vdmArray>, count: <vdmArray.length>}
   */
  function reduceFunction(vdmArray) {
    return {
      posts: vdmArray,
      count: vdmArray.length
    };
  }

  /**
   * sortDescFunction: will sort vdm by date DESC
   *
   * @param  {Object} vdm1  {content, author, date}
   * @param  {Object} vdm2  {content, author, date}
   * @return {Number}       basic sort function result 1, -1 or 0
   */
  function sortDescFunction(vdm1, vdm2) {
    let date1 = moment(vdm1.date, 'YYYY-MM-DD HH:mm:ss');
    let date2 = moment(vdm2.date, 'YYYY-MM-DD HH:mm:ss');
    if (date1 < date2) { return 1; }
    if (date1 > date2) { return -1; }
    return 0;
  }

  return {
    init: init,
    insert: insert,
    clear: clear,
    search: search
  };
}());

module.exports = database;
