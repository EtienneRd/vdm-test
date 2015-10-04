'use strict';

const loki = require('lokijs');
const moment = require('moment');

var database = (function() {

  let db = null;
  let vdms = null;

  function init(database, f) {
    db = new loki(database);
    db.loadDatabase({}, (err) => {
      if (err) {
        return f(err);
      }

      vdms = db.getCollection('vdms') !== null ? db.getCollection('vdms') : db.addCollection('vdms', {indices: ['author', 'date']});
      f();
    });
  }

  function insert(array) {
    if (vdms === null) {
      return false;
    }

    vdms.insert(array);
    db.save();
  }

  function data() {
    // This will automatically map $loki as the id of the vdm
    return vdms.chain()
            .sort(sortDescFunction)
            .mapReduce(mapFunction, reduceFunction);
  }

  function clear() {
    vdms.removeDataOnly();
    db.save();
  }

  function close() {
    return db.close();
  }

  function getLast() {
    return data().posts[0];
  }

  function findFromTo(dateFrom, dateTo) {
    let _dateFrom = moment(dateFrom, 'YYYY-MM-DD');
    // dateTo is midnight of given day, we need to add 1 day to answer correctly
    // Ex: dateTo = 2015-10-04, we need to search vdm where date < 2015-10-05 00:00:00
    let _dateTo   = moment(dateTo, 'YYYY-MM-DD').add(1, 'day');

    return vdms.chain()
            .where((obj) => {
              let _date = moment(obj.date, 'YYYY-MM-DD HH:mm:ss');
              return _date > _dateFrom && _date < _dateTo;
            })
            .sort(sortDescFunction)
            .mapReduce(mapFunction, reduceFunction);
  }

  function findAuthor(author) {
    return vdms.chain()
            .where((vdm) => {
              return vdm.author.includes(author);
            })
            .sort(sortDescFunction)
            .mapReduce(mapFunction, reduceFunction);
  }

  /**
   * mapFunction: will map $loki as the vdm id
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
   * @param  {Array[Object]} vdmArray array of vdm object constructed from mapFunction
   * @return {Object}                 {posts: <vdmArray>, count: <vdmArray.length>}
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
   * @param  {Object} vdm1 {content, author, date}
   * @param  {Object} vdm2 {content, author, date}
   * @return {Integer}     basic sort function result 1, -1 or 0
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
    data: data,
    insert: insert,
    clear: clear,
    close: close,
    getLast: getLast,
    findFromTo: findFromTo,
    findAuthor: findAuthor
  };
}());

module.exports = database;
