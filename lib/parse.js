'use strict';

var yaml      = require('js-yaml'),
    Url       = require('./url'),
    util      = require('./util'),
    _isEmpty  = require('lodash/lang/isEmpty'),
    _isString = require('lodash/lang/isString');

module.exports = parse;

/**
 * @param {string|Buffer} data
 * @param {Url} url
 * @param {Options} options
 * @returns {string|Buffer|object}
 */
function parse(data, url, options) {
  var parsed;

  try {
    if (options.allow.yaml) {
      util.debug('Parsing YAML file: %s', url);
      parsed = yaml.safeLoad(data.toString());
      util.debug('    Parsed successfully');
    }
    else if (options.allow.json) {
      util.debug('Parsing JSON file: %s', url);
      parsed = JSON.parse(data.toString());
      util.debug('    Parsed successfully');
    }
    else {
      parsed = data;
    }
  }
  catch (e) {
    var ext = url.extname().toLowerCase();
    if (options.allow.unknown && ['.json', '.yaml', '.yml'].indexOf(ext) === -1) {
      // It's not a YAML or JSON file, and unknown formats are allowed,
      // so ignore the parsing error and just return the raw data
      util.debug('    Unknown file format. Not parsed.');
      parsed = data;
    }
    else {
      throw util.newError(SyntaxError, e, 'Error parsing "%s"', url);
    }
  }

  var empty = _isEmpty(parsed) ||                           // empty objects
    parsed.length === 0 ||                                  // empty Buffers
    (_isString(parsed) && (parsed.trim().length === 0));    // empty strings

  if (empty && !options.allow.empty) {
    throw util.newError(SyntaxError, 'Error parsing "%s". \nParsed value is empty', url);
  }

  return parsed;
}