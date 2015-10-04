'use strict';

const fs        = require('fs');
const assert    = require('assert');
const VdmReader = require('../lib/VdmReader');
const database  = require('../lib/database');
const moment    = require('moment');

let _vdmReader = new VdmReader();

describe('database', () => {

  before((done) => {
    fs.readFile('test/vdm_page.html', (err, data) => {
      if (err) {
        return done(err);
      }

      _vdmReader.parseHtml(data);

      database.init('test/test_db.json', done);
    });
  });

  it('should return empty array if there is no data', () => {
    assert.deepEqual(database.search(), {
      posts: [],
      count: 0
    });
  });

  it('should insert vdms in database', () => {
    database.insert(_vdmReader.vdms);

    assert.equal(database.search().count, 13);
  });

  it('should find vdm by author', () => {

    let _expectedResult = {
      posts: [{
        'id': 1,
        'author': 'soupir',
        'content': 'Aujourd\'hui, j\'ai découpé, assemblé deux par deux, puis classé dans l\'ordre décroissant une trentaine de chromosomes pour un devoir d\'SVT. ' +
                    'Après deux heures de travail, je finis enfin et pousse un soupir de soulagement. ' +
                    'Tous mes chromosomes se sont éparpillés. ' +
                    'VDM',
        'date': '2015-10-03 15:32:00'
      }],
      count: 1
    };

    assert.deepEqual(database.search({author:'soupir'}), _expectedResult);
  });

  it('should find vdm by date', () => {

    let _askedDate = moment('2015-10-01', 'YYYY-MM-DD').format('YYYYMMDD');
    var _result = database.search({
      from: '2015-10-01',
      to: '2015-10-01'
    });

    for (var i = 0; i < _result.count; i++) {
      let _vdmDate = moment(_result.posts[i].date, 'YYYY-MM-DD HH:mm:ss').format('YYYYMMDD');

      assert.equal(_vdmDate, _askedDate);
    }
  });

  after((done) => {
    database.clear();
    database.close();
    // Apparently, it is not possible to delete the file...
    fs.writeFile('test/test_db.json', '', done);
  });
});
