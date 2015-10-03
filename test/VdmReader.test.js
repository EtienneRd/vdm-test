'use strict';

const fs        = require('fs');
const assert    = require('assert');
const VdmReader = require('../lib/VdmReader');

let vdmHtmlPage = '';

describe('VdmReader', () => {

  before((done) => {
    fs.readFile('test/vdm_page.html', (err, data) => {
      if (err){
        return console.error(err);
      }
      vdmHtmlPage = data;
      done();
    });
  });

  it('should read and store all the vdm in html page', () => {
    let _vdmReader = new VdmReader(vdmHtmlPage);

    assert.equal(_vdmReader.vdms.length, 13);
  });

  describe('getCount', () => {
    it('should count vdm in html page', () => {
      let _vdmReader = new VdmReader(vdmHtmlPage);

      assert.equal(_vdmReader.getCount(), 13);
    });
  });

  describe('getFirst', () => {
    it('should return the first vdm in html page', () => {

      let _expectedResult = {
        'author'  : 'soupir',
        'content' : 'Aujourd\'hui, j\'ai découpé, assemblé deux par deux, puis classé dans l\'ordre décroissant une trentaine de chromosomes pour un devoir d\'SVT. ' +
                    'Après deux heures de travail, je finis enfin et pousse un soupir de soulagement. ' +
                    'Tous mes chromosomes se sont éparpillés. ' +
                    'VDM',
        'date'    : '2015-10-03 15:32:00'
      };

      let _vdmReader = new VdmReader(vdmHtmlPage);

      assert.deepEqual(_vdmReader.getFirst(), _expectedResult);

    });
  });

});



