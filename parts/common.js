'use strict';

var core = require('../core');

/**
 * Pattern should contain either none or two capturing groups.
 * In case of two groups - 1st is raw, 2nd is clean.
 */
var patterns = {
  season: /([Ss]?([0-9]{1,2}))[Eex]|([Ss]([0-9]{1,2}))/,
  episode: /([Eex]([0-9]{2})(?:[^0-9]|$))/,
  year: /([\[\(]?((?:19[0-9]|20[012])[0-9])[\]\)]?)/,
  resolution: /(([0-9]{3,4}(?:p|i)))[^M]/,
  quality: /hdtv|bluray|(?:b[dr]|dvd|hd|tv)rip|web-?(?:dl|rip)|dvd/i,
  codec: /dvix|mpeg[0-9]|divx|xvid|(?:x|h)[-\. ]?26(?:4|5)|avc|hevc/i,
  audio: /MP3|DD5\.?1|Dual[\- ]Audio|LiNE|DTS|AAC(?:\.?2\.0)?|AC3(?:\.5\.1)?/,
  group: /(- ?([^-]+))$/,
  region: /R[0-9]/,
  extended: /EXTENDED/,
  hardcoded: /HC/,
  proper: /PROPER/,
  repack: /REPACK/,
  container: /MKV|AVI|MP4|mkv|avi|mp4/,
  website: /^(\[ ?([^\]]+?) ?\])/,
  language: /(?:TRUE)?FR(?:ENCH)?|EN(?:G(?:LISH)?)?|VOST(?:(F(?:R)?)|A)?|MULTI(?:Lang|Truefrench|\-VF2)?|SUBFRENCH/gi
};
var types = {
  season: 'integer',
  episode: 'integer',
  year: 'integer',
  extended: 'boolean',
  hardcoded: 'boolean',
  proper: 'boolean',
  repack: 'boolean'
};
var currentPatterns;
var currentTypes;
var torrent;

core.on('configure', function(config) {
  for (var key in config.patterns) {
    patterns[key] = config.patterns[key]; // override or create specified keys
  }
  for (var key in config.types) {
    types[key] = config.types[key]; // override or create specified keys
  }
});

core.on('setup', function (data, config) {
  torrent = data;
  currentPatterns = patterns;
  currentTypes = types;
  for (var key in config.patterns) {
    currentPatterns[key] = config.patterns[key]; // temporarily override or create specified keys
  }
  for (var key in config.types) {
    currentTypes[key] = config.types[key]; // temporarily override or create specified keys
  }
});

core.on('start', function() {
  var key, match, index, clean, part;

  for(key in currentPatterns) {
    if(currentPatterns.hasOwnProperty(key)) {
      if(!(match = torrent.name.match(currentPatterns[key]))) {
        continue;
      }

      index = {
        raw:   match[1] ? 1 : 0,
        clean: match[1] ? 2 : 0
      };

      if(currentTypes[key] && currentTypes[key] === 'boolean') {
        clean = true;
      }
      else {
        clean = match[index.clean];

        if(currentTypes[key] && currentTypes[key] === 'integer') {
          clean = parseInt(clean.replace(/[^0-9.]/, ""), 10);
        }
      }

      if(key === 'group') {
        if(clean.match(currentPatterns.codec) || clean.match(currentPatterns.quality)) {
          continue;
        }


        if(clean.match(/[^ ]+ [^ ]+ .+/)) {
          key = 'episodeName';
        }
        clean = clean.replace(/ *\([^)]*\) */, "");
        clean = clean.replace(/ *\[[^)]*\] */, "");
      }

      if(key === 'language') {

        var i = 0;
        while( match = currentPatterns.language.exec(torrent.name) ) {

          var separator = torrent.name.charAt(match.index-1); // separators are usually - + _ . \s
          if(match.index == 0 || !/[-+_.\s]/.test(separator) || separator !== torrent.name.charAt(match.index + match[0].length)) { // & language usually not in first
            continue;
          }

          part = {
            name: 'language' + (++i),
            match: match,
            raw: match[0],
            clean: match[0].toUpperCase()
          };
          part.name = i == 1 ? 'language' : part.name; // ensure sustainability
          core.emit('part', part);
        }

        continue;
      }

      part = {
        name: key,
        match: match,
        raw: match[index.raw],
        clean: clean
      };

      if(key === 'episode') {
        core.emit('map', torrent.name.replace(part.raw, '{episode}'));
      }

      core.emit('part', part);
    }
  }

  core.emit('common');
});

core.on('late', function (part) {
  if(part.name === 'group') {
    core.emit('part', part);
  }
  else if(part.name === 'episodeName') {
    part.clean = part.clean.replace(/[\._]/g, ' ');
    part.clean = part.clean.replace(/_+$/, '').trim();
    core.emit('part', part);
  }
});
