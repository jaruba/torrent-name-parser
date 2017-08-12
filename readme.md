# torrent-name-parser [![Build Status](https://img.shields.io/travis/jy95/torrent-name-parser.svg)](https://travis-ci.org/jy95/torrent-name-parser)

Parses torrent name of a movie or TV show.

**Possible parts extracted:**

- audio
- codec
- container
- episode
- episodeName
- excess
- extended
- garbage
- group
- hardcoded
- language
- proper
- quality
- region
- repack
- resolution
- season
- title
- website
- year

## Install:
```bash
$ npm install torrent-name-parser 
```

## Usage:
```javascript

var tnp = require('torrent-name-parser');

tnp('Captain Russia The Summer Soldier (2014) 1080p BrRip x264 - YIFY');
/*
{ year: 2014,
  resolution: '1080p',
  quality: 'BrRip',
  codec: 'x264',
  group: 'YIFY',
  title: 'Captain Russia The Summer Soldier' }
*/

tnp('The.Staying.Alive.S05E02.720p.HDTV.x264-KILLERS[rartv]');
/*
{ season: 5,
  episode: 2,
  resolution: '720p',
  quality: 'HDTV',
  codec: 'x264',
  group: 'KILLERS',
  title: 'The Staying Alive' }
*/

/* You can also add custom regex if you want more or different extraction 
The part type is optional. Default is the matching string */

tnp.configure({newPart: /someRegex/, existingPart: /overridingRegex/}, 
{newPart: 'partType');

/* or */

tnp('The.Staying.Alive.S05E02.720p.HDTV.x264-KILLERS[rartv]', 
{isRartv: /rar(tv|bg)/}, {isRartv: 'boolean'});
/*
{ season: 5,
  episode: 2,
  resolution: '720p',
  quality: 'HDTV',
  codec: 'x264',
  group: 'KILLERS',
  isRartv: true,
  title: 'The Staying Alive' }
*/

```

## Test
Simply run
```bash
$ node test.js
```

## Credits
https://github.com/jzjzjzj/parse-torrent-name
