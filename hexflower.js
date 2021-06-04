function _random_elem() {
  return arguments[Math.floor(rng.random() * arguments.length)];
}

class Terrain {
  constructor(major, minor) {
    this.major = major;
    this.minor = minor;
  }

  static get Random() {
    return new Terrain(_random_elem(
      'water', 'swamp', 'desert',
      'plains', 'forest', 'hills',
      'mountains',
    ));
  }

  static get None() {
    return new Terrain('none');
  }

  toString() {
    return this.major + (this.minor ? "." + this.minor : "");
  }

  get primary() {
    switch (this.major) {
      case 'forest':
        return rng.random() < 0.33 ?
          new Terrain('forest', 'heavy') :
          new Terrain('forest');

      case 'hills':
        return rng.random() < 0.20 ?
          new Terrain('hills', 'canyon') :
          new Terrain('hills');

      default:
        return new Terrain(this.major);
    }
  }

  get secondary() {
    switch (this.major) {
      case 'water': return new Terrain('plains', 'beach');
      case 'swamp': return new Terrain('plains');
      case 'desert':
        return rng.random() < 0.33 ?
          new Terrain('hills', 'dunes') :
          new Terrain('hills');

      case 'plains': return new Terrain('forest');
      case 'forest': return new Terrain('plains');
      case 'hills':
        return rng.random() < 0.40 ?
          new Terrain('mountains', 'pass') :
          new Terrain('mountains');

      case 'mountains': return new Terrain('hills');

      default: return new Terrain('none');
    }
  }

  get tertiary() {
    switch (this.major) {
      case 'water':
        return rng.random() < 0.66 ?
          new Terrain('forest', 'light') :
          new Terrain('forest');

      case 'swamp': return new Terrain('forest');
      case 'desert': return new Terrain('plains');
      case 'plains': return new Terrain('hills');
      case 'forest':
        return rng.random() < 0.66 ?
          new Terrain('forest', 'hills') :
          new Terrain('hills');

      case 'hills': return new Terrain('plains');
      case 'mountains':
        return rng.random() < 0.33 ?
          new Terrain('forest', 'mountains') :
          new Terrain('forest');

      default: return new Terrain('none');
    }
  }

  get wildcard() {
    switch (this.major) {
      case 'water':
        return new Terrain(_random_elem('swamp', 'desert', 'hills'));

      case 'swamp':
        return new Terrain('water');

      case 'desert':
        return new Terrain(_random_elem('water', 'mountains'));

      case 'plains':
        return new Terrain(_random_elem('water', 'swamp', 'desert'));

      case 'forest':
        return rng.random() < 0.66 ?
          new Terrain(_random_elem('water', 'swamp')) :
          rng.random() < 0.66 ?
            new Terrain('forest', 'mountains') :
            new Terrain('mountains');

      case 'hills':
        return rng.random() < 0.66 ?
          new Terrain(_random_elem('water', 'desert')) :
          rng.random() < 0.33 ?
            new Terrain('forest', 'hills') :
            new Terrain('forest');

      case 'mountains':
        return new Terrain('desert');

      default:
        return new Terrain('none');
    }
  }

  get related() {
    const r = rng.random() * 12;
    if (r < 6) return this.primary;
    if (r < 9) return this.secondary;
    if (r < 11) return this.tertiary;
    return this.wildcard;
  }

  get color() {
    switch (this.major) {
      case 'water':     return '#88f';
      case 'swamp':     return '#848';
      case 'desert':    return '#ff8';
      case 'plains':    return '#af8';
      case 'forest':    return '#0b0';
      case 'hills':     return '#dda';
      case 'mountains': return '#aaa';
      case 'none': return '#000';

      default:
        console.log('Unknown terrain type: ' + this.major);
        return '#333';
    }
  }

  get empty() {
    return this.major == 'none';
  }
}

class Direction {
  constructor(v) {
    this.value = v;
  }

  static get NW() { return new Direction('NW'); }
  static get NE() { return new Direction('NE'); }
  static get E()  { return new Direction('E');  }
  static get SW() { return new Direction('SW'); }
  static get SE() { return new Direction('SE'); }
  static get W()  { return new Direction('W');  }
  static get Random() {
    return new Direction(_random_elem('NW', 'NE', 'E', 'SW', 'SE', 'W'));
  }

  toString() {
    return this.value;
  }

  get opposite() {
    switch (this.value) {
      case 'NW': return 'SE';
      case 'NE': return 'SW';
      case 'E':  return 'W';
      case 'SE': return 'NW';
      case 'SW': return 'NE';
      case 'W':  return 'E';
    }
  }
}

class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  get top() { return this.y; }
  get left() { return this.x; }
  get right() { return this.x + this.width; }
  get bottom() { return this.y + this.height; }

  set top(t) { this.y = t; }
  set left(l) { this.x = l; }
  set right(r) { this.width = r - this.x; }
  set bottom(b) { this.height = b - this.y; }

  get center() {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    }
  }

  expand(other) {
    if (other.top    < this.top   ) this.top    = other.top   ;
    if (other.left   < this.left  ) this.left   = other.left  ;
    if (other.right  > this.right ) this.right  = other.right ;
    if (other.bottom > this.bottom) this.bottom = other.bottom;
  }
}

class MapPoint {
  constructor(q, r) {
    this.q = q;
    this.r = r;
  }

  static cartesian(x, y) {
    const px = x / Map.Scale / 2;
    const py = y / Map.Scale / 2;
    return new MapPoint(Math.round(px / 2 - py / 3), Math.round(py * 2 / 3));
  }

  toString() {
    return "(" + this.q + ", " + this.r + ")";
  }

  get s() {
    return -this.q - this.r;
  }

  apply(dir, amount=1) {
    switch (dir.toString()) {
      case 'NW': return new MapPoint(this.q,          this.r - amount);
      case 'NE': return new MapPoint(this.q + amount, this.r - amount);
      case 'E':  return new MapPoint(this.q + amount, this.r);
      case 'SE': return new MapPoint(this.q,          this.r + amount);
      case 'SW': return new MapPoint(this.q - amount, this.r + amount);
      case 'W':  return new MapPoint(this.q - amount, this.r);
    }
  }

  equals(p) {
    return this.q == p.q && this.r == p.r;
  }

  dist(p) {
    return (
      Math.abs(this.q - p.q) +
      Math.abs(this.r - p.r) +
      Math.abs(this.s - p.s)
    ) / 2;
  }

  add(p) {
    return new GridPoint(this.q + p.q, this.r + p.r);
  }

  subtract(p) {
    return new GridPoint(this.q - p.q, this.r - p.r);
  }

  get center() {
    return {
      x: this.q * 4 * Map.Scale + this.r * 2 * Map.Scale,
      y: this.r * 3 * Map.Scale,
    };
  }

  get bounds() {
    const c = this.center;
    return new Rect(
      c.x - 2 * Map.Scale,
      c.y - 2 * Map.Scale,
      4 * Map.Scale,
      4 * Map.Scale
    );
  }
}

class Map {
  static get Scale() { return 5; }
  static get Origin() { return new MapPoint(0, 0); }

  constructor() {
    this.map = {};
    this.regions = [];

    this.fill_region(Map.Origin, new Terrain('plains'));
  }

  update() {
    if (this.current_region) {
      this.fill_region_step();
    } else if (this.regions.length < 26) {
      this.add_region();
    }
  }

  finish() {
    while (this.regions.length < 26) {
      while (this.current_region) {
        this.fill_region_step();
      }
      this.add_region();
    }

    while (this.current_region) {
      this.fill_region_step();
    }
  }

  add_region() {
    var seed = _random_elem(...this.regions);
    var check = seed.apply(Direction.Random, 5);

    if (check.dist(Map.Origin) < 21 && this.get(check).empty) {
      var n = Math.floor(rng.random() * 12);
      var t = this.get(seed).related;
      this.fill_region(check, t);
    }
  }

  expand(origin, max_dist) {
    var source = origin;
    var dest = source.apply(Direction.Random);

    while (!this.get(dest).empty) {
      source = dest;
      dest = source.apply(Direction.Random);
    }

    if (dest.dist(origin) > max_dist) return 0;

    this.set(dest, this.get(source).related);
    return 1;
  }

  fill_region(p, terrain) {
    this.set(p, terrain);
    this.regions.push(p);

    console.log("Filling region " + p + " (" + terrain + ")");

    this.current_region = p;
    this.count = 1;

    this.edges = [
      new MapPoint(p.q + 1, p.r - 3),
      new MapPoint(p.q + 2, p.r - 3),
      new MapPoint(p.q - 1, p.r - 2),
      new MapPoint(p.q + 3, p.r - 2),
      new MapPoint(p.q - 2, p.r - 1),
      new MapPoint(p.q + 3, p.r - 1),
      new MapPoint(p.q - 3, p.r + 1),
      new MapPoint(p.q + 2, p.r + 1),
      new MapPoint(p.q - 3, p.r + 2),
      new MapPoint(p.q + 1, p.r + 2),
      new MapPoint(p.q - 2, p.r + 3),
      new MapPoint(p.q - 1, p.r + 3),
    ];
  }

  fill_region_step() {
    if (this.count < 19) {
      while (true) {
        var added = this.expand(this.current_region, 2);
        this.count += added;

        if (added) return;
      }
    }

    if (this.edges.length > 0) {
      this.set_adjacent(this.edges.pop());
      return;
    }

    this.current_region = undefined;
  }

  set_adjacent(p) {
    if (!this.get(p).empty) return;

    var adjacent = [
      new MapPoint(p.q,     p.r - 1),
      new MapPoint(p.q + 1, p.r - 1),
      new MapPoint(p.q - 1, p.r),
      new MapPoint(p.q + 1, p.r),
      new MapPoint(p.q - 1, p.r + 1),
      new MapPoint(p.q,     p.r + 1),
    ];

    var terrains = [];
    for (var i = 0; i < adjacent.length; ++i) {
      var t = this.get(adjacent[i]);
      if (!t.empty) terrains.push(t);
    }

    if (terrains.length > 0) {
      var i = Math.floor(rng.random() * terrains.length);
      this.set(p, terrains[i]);
    }
  }

  get(p) {
    return this.map[p.r] && this.map[p.r][p.q] || new Terrain('none');
  }

  set(p, terrain) {
    if (!this.map[p.r]) this.map[p.r] = {};
    this.map[p.r][p.q] = terrain;
  }

  region(p) {
    return new MapPoint(Math.floor(p.q / 5) * 5, Math.floor(p.r / 5) * 5);
  }

  get bounds() {
    var extent = new Rect(0, 0, 0, 0);

    for (var r = -99; r <= 99; ++r) {
      for (var q = -99; q <= 99; ++q) {
        const p = new MapPoint(q, r);
        if (this.get(p) != 'none') extent.expand(p.bounds);
      }
    }

    return extent;
  }

  draw(c) {
    var context = c.getContext('2d');

    for (var r = -99; r <= 99; ++r) {
      for (var q = -99; q <= 99; ++q) {
        this.draw_cell(context, new MapPoint(q, r));
      }
    }

    for (var i = 0; i < this.regions.length; ++i) {
      this.draw_region(context, this.regions[i]);
    }

    var x = this.bounds;
    context.strokeStyle = '#ccc';
    context.strokeRect(x.x + 500, x.y + 500, x.width, x.height);
  }

  draw_cell(context, p) {
    const c = p.center;
    c.x += 500;
    c.y += 500;

    context.lineWidth = 1;
    context.strokeStyle = '#000';
    context.fillStyle = this.get(p).color;

    context.beginPath();
    context.moveTo(c.x, c.y - 2 * Map.Scale);
    context.lineTo(c.x + 2 * Map.Scale, c.y - Map.Scale);
    context.lineTo(c.x + 2 * Map.Scale, c.y + Map.Scale);
    context.lineTo(c.x, c.y + 2 * Map.Scale);
    context.lineTo(c.x - 2 * Map.Scale, c.y + Map.Scale);
    context.lineTo(c.x - 2 * Map.Scale, c.y - Map.Scale);
    context.closePath();

    if (Map.Scale > 2) context.stroke();
    context.fill();
  }

  draw_region(context, p) {
    const cx = p.q * 4 * Map.Scale + p.r * 2 * Map.Scale + 500;
    const cy = p.r * 3 * Map.Scale + 500;

    context.lineWidth = Map.Scale > 2 ? 2 : 1;
    context.strokeStyle = '#000';

    context.beginPath();
    context.moveTo(cx, cy - 10 * Map.Scale);
    context.lineTo(cx + 10 * Map.Scale, cy - 5 * Map.Scale);
    context.lineTo(cx + 10 * Map.Scale, cy + 5 * Map.Scale);
    context.lineTo(cx, cy + 10 * Map.Scale);
    context.lineTo(cx - 10 * Map.Scale, cy + 5 * Map.Scale);
    context.lineTo(cx - 10 * Map.Scale, cy - 5 * Map.Scale);
    context.closePath();
    context.stroke();
  }
}

function getParam(name, def='') {
  var re = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var match = re.exec(location.search);
  return match == null ? def : decodeURIComponent(match[1].replace(/\+/g, ' '));
}

var seed = getParam('seed', 'hexflower');
var rng = new Random(seed);
var map = new Map();
var draw = function() {
  map.finish();
  map.draw(document.getElementById('c'));
  window.requestAnimationFrame(draw);
};
window.requestAnimationFrame(draw);

document.getElementById('s').value = seed;

document.getElementById('c').addEventListener('mousemove', function(e) {
  const px = e.pageX - this.offsetLeft - 500;
  const py = e.pageY - this.offsetTop - 500;

  const p = MapPoint.cartesian(px, py);

  var info = 'Cell:    ' + p + "\n";
  info    += 'Terrain: ' + map.get(p) + "\n";
  info    += 'Region:  ' + map.region(p) + "\n";

  document.getElementById('data').innerText = info;
});
