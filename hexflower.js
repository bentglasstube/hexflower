function _random_elem() {
  return arguments[Math.floor(Math.random(arguments.length))];
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

  get primary() {
    switch (this.major) {
      case 'forest':
        return Math.random() < 0.33 ?
          new Terrain('forest', 'heavy') :
          new Terrain('forest');

      case 'hills':
        return Math.random() < 0.20 ?
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
        return Math.random() < 0.33 ?
          new Terrain('hills', 'dunes') :
          new Terrain('hills');

      case 'plains': return new Terrain('forest');
      case 'forest': return new Terrain('plains');
      case 'hills':
        return Math.random() < 0.40 ?
          new Terrain('mountains', 'pass') :
          new Terrain('mountains');

      case 'mountains': return new Terrain('hills');

      default: return new Terrain('none');
    }
  }

  get tertiary() {
    switch (this.major) {
      case 'water':
        return Math.random() < 0.66 ?
          new Terrain('forest', 'light') :
          new Terrain('forest');

      case 'swamp': return new Terrain('forest');
      case 'desert': return new Terrain('plains');
      case 'plains': return new Terrain('hills');
      case 'forest':
        return Math.random() < 0.66 ?
          new Terrain('forest', 'hills') :
          new Terrain('hills');

      case 'hills': return new Terrain('plains');
      case 'mountains':
        return Math.random() < 0.33 ?
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
        return Math.random() < 0.66 ?
          new Terrain(_random_elem('water', 'swamp')) :
          Math.random() < 0.66 ?
            new Terrain('forest', 'mountains') :
            new Terrain('mountains');

      case 'hills':
        return Math.random() < 0.66 ?
          new Terrain(_random_elem('water', 'desert')) :
          Math.random() < 0.33 ?
            new Terrain('forest', 'hills') :
            new Terrain('forest');

      case 'mountains':
        return new Terrain('desert');

      default:
        return new Terrain('none');
    }
  }

  get color() {
    switch (this.major) {
      case 'water':     return '#88f';
      case 'swamp':     return '#448';
      case 'desert':    return '#ff8';
      case 'plains':    return '#af8';
      case 'forest':    return '#0b0';
      case 'hills':     return '#dda';
      case 'mountains': return '#ccc';
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

class Map {
  static get kTileSize() { return 6; }

  constructor() {
    this.map = {};
    this.regions = [];

    this.set(0, 0, new Terrain('plains'));
    this.fill_region(0, 0);

    for (var i = 0; i < 4; ++i) {
      this.add_ring(i);
    }
  }

  add_ring(n) {
    const radius = 5 * n;
    var q = radius;
    var r = 0;

    var dir = [-5, 5];

    while (true) {
      if (!this.get(q, r).empty) return;

      if (n < 3 || Math.random() < 1 / n) {
        this.set_random(q, r);
        this.fill_region(q, r);
      }

      q += dir[0];
      r += dir[1];

      if (q == 0 && r == radius) dir = [-5, 0];
      if (q == -radius && r == radius) dir = [0, -5];
      if (q == -radius && r == 0) dir = [5, -5];
      if (q == 0 && r == -radius) dir = [5, 0];
      if (q == radius && r == -radius) dir = [0, 5];
      if (q == radius && r == 0) break;
    }
  }

  set_random(q, r) {
    const n = Math.floor(Math.random() * 12);
    const terrain = new Terrain('plains');

    if (n < 6) return this.set(q, r, terrain.primary);
    if (n < 9) return this.set(q, r, terrain.secondary);
    if (n < 11) return this.set(q, r, terrain.tertiary);
    this.set(q, r, Terrain.Random);
  }

  fill_region(q, r) {
    const terrain = this.get(q, r);

    this.regions.push([q, r]);

    var full = [
      [q + 0, r - 2], [q + 1, r - 2], [q + 2, r - 2],
      [q - 1, r - 1], [q + 0, r - 1], [q + 1, r - 1], [q + 2, r - 1],
      [q - 2, r + 0], [q - 1, r + 0], [q + 1, r + 0], [q + 2, r + 0],
      [q - 2, r + 1], [q - 1, r + 1], [q + 0, r + 1], [q + 1, r + 1],
      [q - 2, r + 2], [q - 1, r + 2], [q + 0, r + 2]
    ];

    var ci = full.length;
    while (ci != 0) {
      var ri = Math.floor(Math.random() * ci);
      --ci;

      var t = full[ci];
      full[ci] = full[ri];
      full[ri] = t;
    }

    for (var i = 0; i < full.length; ++i) {
      if (i < 9) {
        this.set(full[i][0], full[i][1], terrain.primary);
      } else if (i < 15) {
        this.set(full[i][0], full[i][1], terrain.secondary);
      } else {
        this.set(full[i][0], full[i][1], terrain.tertiary);
      }
    }

    var edges = [
      [q + 1, r - 3], [q + 2, r - 3],
      [q - 1, r - 2], [q + 3, r - 2],
      [q - 2, r - 1], [q + 3, r - 1],
      [q - 3, r + 1], [q + 2, r + 1],
      [q - 3, r + 2], [q + 1, r + 2],
      [q - 2, r + 3], [q - 1, r + 3],
    ];

    for (var i = 0; i < edges.length; ++i) {
      this.set_adjacent(edges[i][0], edges[i][1]);
    }
  }

  set_adjacent(q, r) {
    if (!this.get(q, r).empty) return;

    var adjacent = [
      [q, r - 1],
      [q + 1, r - 1],
      [q - 1, r],
      [q + 1, r],
      [q - 1, r + 1],
      [q, r + 1],
    ];

    var terrains = [];
    for (var i = 0; i < adjacent.length; ++i) {
      var t = this.get(adjacent[i][0], adjacent[i][1]);
      if (!t.empty) terrains.push(t);
    }

    if (terrains.length > 0) {
      var i = Math.floor(Math.random() * terrains.length);
      this.set(q, r, terrains[i]);
    }
  }

  get(q, r) {
    return this.map[r] && this.map[r][q] || new Terrain('none');
  }

  set(q, r, terrain) {
    if (!this.map[r]) this.map[r] = {};
    this.map[r][q] = terrain;
  }

  draw(c) {
    var context = c.getContext('2d');

    for (var r = -99; r <= 99; ++r) {
      for (var q = -99; q <= 99; ++q) {
        this.draw_cell(context, q, r);
      }
    }

    for (var i = 0; i < this.regions.length; ++i) {
      var re = this.regions[i];
      this.draw_region(context, re[0], re[1]);
    }
  }

  draw_cell(context, q, r) {
    const cx = q * 4 * Map.kTileSize + r * 2 * Map.kTileSize + 500;
    const cy = r * 3 * Map.kTileSize + 500;

    context.lineWidth = 1;
    context.strokeStyle = '#000';
    context.fillStyle = this.get(q, r).color;

    context.beginPath();
    context.moveTo(cx, cy - 2 * Map.kTileSize);
    context.lineTo(cx + 2 * Map.kTileSize, cy - Map.kTileSize);
    context.lineTo(cx + 2 * Map.kTileSize, cy + Map.kTileSize);
    context.lineTo(cx, cy + 2 * Map.kTileSize);
    context.lineTo(cx - 2 * Map.kTileSize, cy + Map.kTileSize);
    context.lineTo(cx - 2 * Map.kTileSize, cy - Map.kTileSize);
    context.closePath();

    if (Map.kTileSize > 2) context.stroke();
    context.fill();
  }

  draw_region(context, q, r) {
    const cx = q * 4 * Map.kTileSize + r * 2 * Map.kTileSize + 500;
    const cy = r * 3 * Map.kTileSize + 500;

    context.lineWidth = Map.kTileSize > 2 ? 3 : 1;
    context.strokeStyle = '#000';
    context.fillStyle = 'transparent';

    context.beginPath();
    context.moveTo(cx, cy - 10 * Map.kTileSize);
    context.lineTo(cx + 10 * Map.kTileSize, cy - 5 * Map.kTileSize);
    context.lineTo(cx + 10 * Map.kTileSize, cy + 5 * Map.kTileSize);
    context.lineTo(cx, cy + 10 * Map.kTileSize);
    context.lineTo(cx - 10 * Map.kTileSize, cy + 5 * Map.kTileSize);
    context.lineTo(cx - 10 * Map.kTileSize, cy - 5 * Map.kTileSize);
    context.closePath();
    context.stroke();
  }
}

var map = new Map();
map.draw(document.getElementById('c'));
