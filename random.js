class Random {
  static sfc32(a, b, c, d) {
    return function() {
      a >>>= 0;
      b >>>= 0;
      c >>>= 0;
      d >>>= 0;

      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  }

  static xmur3(str) {
    var hash = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; ++i) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = hash << 13 | hash >>> 19;
    }

    return function() {
      hash = Math.imul(hash ^ hash >>> 16, 2246822507);
      hash = Math.imul(hash ^ hash >>> 13, 3266489909);
      return (hash ^= hash >>> 16) >>> 0;
    }
  }

  constructor(text) {
    this.seed(text);
  }

  seed(text) {
    var s = Random.xmur3(text);
    this.rng = Random.sfc32(s(), s(), s(), s());
  }

  random() {
    return this.rng();
  }
}
