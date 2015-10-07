VDM test
========

This program allows to load the last 200 VDM from www.viedemerde.fr and provides an API to look at them.

<p align="center">
<img src="./docs/but-why.gif" width="50%" />
</p>

Because... reasons!

# Installation

/!\ Please make sure you are using node 4.x /!\

```
$ npm install
```
After installation, 200 VDMs will be loaded automatically

No database to init? Nothing more to configure? Nope, I wanted the installation to be fast and simple.

# Tests
```
$ npm test
```

# Usage

```
$ npm start
```
This will start a server listening on port 3000.
You will be able to:
- See the last 200 VDMs via `/api/posts`
- See one VDM from its id via `/api/posts/:id`
- Search VDMs by author (`?author=ironMan`)
- Search VDMs by date from (`?from=YYYY-MM-DD`)
- Search VDMs by date to (`?to=YYYY-MM-DD`)

## Refresh database
```
$ node lib/vdmLoader.js
```

# Regrets

<p align="center">
<img src="./docs/rain-sad.gif" width="50%" />
</p>

- Not enough tests
- SoC should be clearer
- VDMs loading could and should be faster, by parallelizing pages lookups
- Database should not be cleared at each refresh

# License

Copyright (c) 2015, Etienne Rouillard

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
