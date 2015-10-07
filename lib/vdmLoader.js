'use strict';

const request = require('request');
const VDM_URL = 'http://www.viedemerde.fr';
const VdmReader = require('./VdmReader');
const database  = require('./database');

/**
 * loadHtmlPage: using request, this function calls the given url and returns the HTML
 *
 * @param  {String}   url url of the page
 * @param  {Function} f   callback(err, html)
 */
function loadHtmlPage(url, f) {
  console.log('-- Calling ' + url);
  request(url, (err, response, body) => {
    if (err) {
      return f(err);
    }

    if (response.statusCode === 200) {
      return f(null, body);
    }
  });
}

/**
 * getUrl: small function generating url with page number
 *
 * @param  {Integer} page page number
 * @return {String}       full url
 */
function getUrl(page) {
  return VDM_URL + (page === 0 ? '' : '?page=' + page);
}

// In this first version, the number of VDM to load is 200
const VDM_LIMIT = 200;
let   vdmReader = new VdmReader();

/**
 * loadVDM: recursive function loading VDMs into a VdmReader
 *
 * @param  {Integer}  page page number
 * @param  {Function} f    callback(err)
 */
function loadVDM(page, f) {

  loadHtmlPage(getUrl(page), (err, html) => {
    if (err) {
      return f(err);
    }

    console.log('-- Parsing VDMs...');
    vdmReader.parseHtml(html);

    if (vdmReader.getCount() > VDM_LIMIT) {
      return f(null);
    }

    loadVDM(page + 1, f);
  });
}

var time = process.hrtime();
loadVDM(0, (err) => {
  if (err) {
    return console.error(err);
  }

  var diff = process.hrtime(time);

  console.log('-- Finished loading VDMs');
  console.log('-- Loaded %d VDM in %d s.', vdmReader.getCount(), (diff[0] * 1e9 + diff[1]) / 1e9);

  database.init('db.json', () => {
    database.clear();
    database.insert(vdmReader.vdms);
  });
});

