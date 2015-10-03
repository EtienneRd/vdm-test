'use strict';

const fs        = require('fs');
const assert    = require('assert');
const VDMReader = require('../lib/VdmReader');

let vdmPageHtml = '';

describe('VdmReader', () => {

  before((done) => {
    fs.readFile('test/vdm_page.html', (err, data) => {
      if (err){
        return console.error(err);
      }
      vdmPageHtml = data;
      done();
    });
  });

  describe('getCount', () => {
    it('should count vdm in html page', () => {
      let _vdmReader = new VDMReader(vdmPageHtml);

      assert.equal(_vdmReader.getCount(), 13);
    });
  });
});



