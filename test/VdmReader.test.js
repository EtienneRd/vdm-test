'use strict';

const fs        = require('fs');
const assert    = require('assert');
const VdmReader = require('../lib/VdmReader');

let   VDM_HTML_PAGE     = '';
const VDM_COUNT_IN_PAGE = 13;

describe('VdmReader', () => {

  before((done) => {
    fs.readFile('test/html_samples/vdm_page.html', (err, data) => {
      if (err) {
        return done(err);
      }
      VDM_HTML_PAGE = data;
      done();
    });
  });

  it('should read and store all the vdm in html page', () => {
    let _vdmReader = new VdmReader().parseHtml(VDM_HTML_PAGE);

    assert.equal(_vdmReader.getCount(), VDM_COUNT_IN_PAGE);
  });

  it('should read several html content and store their vdms', () => {
    let _vdmReader = new VdmReader();

    // parsing html two times
    _vdmReader.parseHtml(VDM_HTML_PAGE);
    _vdmReader.parseHtml(VDM_HTML_PAGE);

    assert.equal(_vdmReader.getCount(), VDM_COUNT_IN_PAGE * 2);
  });

  it('should read author names with spaces', (done) => {
    fs.readFile('test/html_samples/vdm_author_with_space.html', (err, data) => {
      if (err) {
        return done(err);
      }

      let _vdmReader = new VdmReader();

      _vdmReader.parseHtml(data);

      assert.equal(_vdmReader.vdms[0].author, 'le cuisiniste');
      done();
    });
  });

  it('should not generate html entities', (done) => {
    fs.readFile('test/html_samples/vdm_with_html_entities.html', (err, data) => {
      if (err) {
        return done(err);
      }

      let _vdmReader = new VdmReader();

      _vdmReader.parseHtml(data);

      let _vdmContent = 'Aujourd\'hui, en cours d\'art, une élève me présente son dessin. ' +
                        'C\'est monotone, triste, sans couleurs. Je lui demande ce qu\'elle en pense. ' +
                        '"J\'aime bien, c\'est à l\'image de ma vie, sans intérêt." VDM';

      assert.equal(_vdmReader.vdms[0].content, _vdmContent);
      done();
    });
  });

  describe('getFirst', () => {
    it('should return the first vdm in html page', () => {

      let _expectedResult = {
        'author': 'soupir',
        'content': 'Aujourd\'hui, j\'ai découpé, assemblé deux par deux, puis classé dans l\'ordre décroissant ' +
                    'une trentaine de chromosomes pour un devoir d\'SVT. ' +
                    'Après deux heures de travail, je finis enfin et pousse un soupir de soulagement. ' +
                    'Tous mes chromosomes se sont éparpillés. ' +
                    'VDM',
        'date': '2015-10-03 15:32:00'
      };

      let _vdmReader = new VdmReader().parseHtml(VDM_HTML_PAGE);

      assert.deepEqual(_vdmReader.getFirst(), _expectedResult);
    });
  });

});

