;(function () {
  var DATA = window.PG_SPRITES
  var LEG = DATA.legend
  var SPRITES = DATA.sprites
  var P = {
    ebony: LEG.E, walnut: LEG.W, mahogany: LEG.M, lim: LEG.L, oak: LEG.O, kayaDeep: LEG.k, kaya: LEG.K,
    pine: LEG.P, birch: LEG.B, doPaper: LEG.D, washi: LEG.A, slateDark: LEG.S, slate: LEG.s, clam: LEG.C,
    clamShade: LEG.c, moss: LEG.R, matcha: LEG.T, brick: LEG.X, terracotta: LEG.Z, lantern: LEG.N,
    honey: LEG.H, nightSky: LEG.Y, nightMid: LEG.y, rain: LEG.V, rainLight: LEG.v,
  }
  var FRAME_MS = 83
  var STONE_MS = 120
  var root = document.documentElement
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)')

  SPRITES.icon_play = {
    w: 12, h: 12,
    rows: ['..E.........', '..EE........', '..EEE.......', '..EEEE......', '..EEEEE.....', '..EEEEEE....',
      '..EEEEEE....', '..EEEEE.....', '..EEEE......', '..EEE.......', '..EE........', '..E.........'],
  }
  SPRITES.icon_phone = {
    w: 12, h: 12,
    rows: ['..EEEEEEEE..', '..EEEEEEEE..', '..EAAAAAAE..', '..EAAAAAAE..', '..EAAAAAAE..', '..EAAAAAAE..',
      '..EAAAAAAE..', '..EAAAAAAE..', '..EAAAAAAE..', '..EEEEEEEE..', '..EEEAAEEE..', '..EEEEEEEE..'],
  }
  SPRITES.icon_globe = {
    w: 12, h: 12,
    rows: ['....EEEE....', '..EEVVVVEE..', '.EVVRRVVVVE.', '.EVRRRRVVVE.', 'EVVRRRVVRRVE', 'EVVVRVVRRRVE',
      'EVVVVVVRRRVE', 'EVVVVVVVRVVE', '.EVVRRVVVVE.', '.EVVVRRVVVE.', '..EEVVVVEE..', '....EEEE....'],
  }

  function isNight() {
    return getComputedStyle(root).getPropertyValue('--theme-name').trim() === 'night'
  }
  function cssVar(n) {
    return getComputedStyle(root).getPropertyValue(n).trim()
  }
  function reduced() {
    return reduceMQ.matches
  }
  function rect(ctx, x, y, w, h, c, a) {
    if (a !== undefined) {
      ctx.save()
      ctx.globalAlpha = a
    }
    ctx.fillStyle = c
    ctx.fillRect(x, y, w, h)
    if (a !== undefined) ctx.restore()
  }
  function drawRows(ctx, rows, x, y, s, legend, alpha) {
    var lg = legend || LEG
    ctx.save()
    if (alpha !== undefined) ctx.globalAlpha = alpha
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r]
      for (var c = 0; c < row.length; c++) {
        var col = lg[row[c]]
        if (!col) continue
        ctx.fillStyle = col
        ctx.fillRect(x + c * s, y + r * s, s, s)
      }
    }
    ctx.restore()
  }
  function seeded(seed) {
    var s = seed >>> 0
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 4294967296
    }
  }
  function sprite(cv, id) {
    var sp = SPRITES[id]
    if (!sp) return cv
    if (cv.width !== sp.w) cv.width = sp.w
    if (cv.height !== sp.h) cv.height = sp.h
    var ctx = cv.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, sp.w, sp.h)
    drawRows(ctx, sp.rows, 0, 0, 1)
    return cv
  }

  var blinkers = []
  function blinker(cv) {
    blinkers.push(cv)
    sprite(cv, 'cat_sensei')
  }

  var scene = { cv: null, drops: [], steam: [], blinkUntil: 0, nextBlink: 3000, visible: true }
  ;(function () {
    var rnd = seeded(7)
    for (var i = 0; i < 46; i++) scene.drops.push({ x: 16 + rnd() * 62, y: 12 + rnd() * 36, v: 1 + (rnd() < 0.4 ? 1 : 0) })
    for (var j = 0; j < 5; j++) scene.steam.push({ ph: j / 5 })
  })()

  function drawScene(now, target, nightOverride) {
    var cv = target || scene.cv
    if (!cv) return
    var ctx = cv.getContext('2d')
    ctx.imageSmoothingEnabled = false
    var night = nightOverride === undefined ? isNight() : nightOverride
    var W = 160, H = 90
    rect(ctx, 0, 0, W, H, night ? P.nightMid : P.birch)
    rect(ctx, 0, 0, W, 4, night ? P.ebony : P.walnut)
    rect(ctx, 0, 0, 3, 66, night ? P.ebony : P.lim)
    rect(ctx, 157, 0, 3, 66, night ? P.ebony : P.lim)
    var wx = 14, wy = 10, ww = 62, wh = 40
    rect(ctx, wx - 2, wy - 2, ww + 4, wh + 4, night ? P.ebony : P.walnut)
    rect(ctx, wx, wy, ww, wh, night ? P.nightSky : P.rainLight)
    var hill = night ? P.nightMid : P.rain
    for (var x = 0; x < ww; x++) {
      var h = 6 + Math.round(4 * Math.sin((x + 3) / 9) + 2 * Math.sin(x / 4))
      rect(ctx, wx + x, wy + wh - h, 1, h, hill)
    }
    rect(ctx, wx, wy + wh - 3, ww, 3, night ? P.ebony : P.moss)
    ctx.save()
    ctx.beginPath()
    ctx.rect(wx, wy, ww, wh)
    ctx.clip()
    var dropC = night ? P.rainLight : P.rain
    for (var d = 0; d < scene.drops.length; d++) {
      var dr = scene.drops[d]
      rect(ctx, Math.round(dr.x), Math.round(dr.y), 1, 3, dropC, night ? 0.6 : 0.85)
    }
    ctx.restore()
    var mull = night ? P.ebony : P.walnut
    rect(ctx, wx + 30, wy, 2, wh, mull)
    rect(ctx, wx, wy + 19, ww, 2, mull)
    rect(ctx, wx - 3, wy + wh + 2, ww + 6, 2, night ? P.walnut : P.oak)

    var sx = 98, sy = 9
    rect(ctx, sx - 1, sy, 18, 2, P.walnut)
    rect(ctx, sx, sy + 2, 16, 30, night ? P.doPaper : P.washi)
    rect(ctx, sx + 1, sy + 3, 14, 28, night ? P.birch : P.doPaper)
    for (var yy = 0; yy < 6; yy++)
      for (var xx = 0; xx < 6; xx++) {
        var dx = xx - 2.5, dy = yy - 2.5
        if (dx * dx + dy * dy <= 8) rect(ctx, sx + 5 + xx, sy + 8 + yy, 1, 1, P.slateDark)
      }
    rect(ctx, sx + 7, sy + 18, 2, 1, P.slate)
    rect(ctx, sx + 7, sy + 20, 2, 1, P.slate)
    rect(ctx, sx + 7, sy + 22, 2, 1, P.slate)
    rect(ctx, sx + 11, sy + 26, 2, 2, P.brick)
    rect(ctx, sx - 1, sy + 32, 18, 2, P.walnut)

    rect(ctx, 0, 58, W, 8, night ? P.walnut : P.oak)
    for (var bx = 10; bx < W; bx += 24) rect(ctx, bx, 58, 1, 8, night ? P.ebony : P.lim)
    rect(ctx, 0, 66, W, 24, night ? P.lim : P.pine)
    for (var fy = 70; fy < H; fy += 6) rect(ctx, 0, fy, W, 1, night ? P.walnut : P.kayaDeep)
    for (var fx = 0; fx < W; fx += 40) rect(ctx, fx + ((fx / 40) % 2) * 20, 66, 1, 24, night ? P.walnut : P.kayaDeep)

    var lx = 138, ly = 6
    if (night) {
      var rings = [[26, 0.05], [18, 0.07], [11, 0.1]]
      for (var ri = 0; ri < rings.length; ri++) {
        var r = rings[ri][0], a = rings[ri][1]
        for (var k = 0; k <= r; k++) {
          var w = Math.round(Math.sqrt(r * r - k * k))
          rect(ctx, lx + 6 - w, ly + 6 + k, w * 2, 1, P.honey, a)
          if (k) rect(ctx, lx + 6 - w, ly + 6 - k, w * 2, 1, P.honey, a)
        }
      }
    }
    rect(ctx, lx + 5, 4, 2, 3, P.walnut)
    drawRows(ctx, SPRITES.avatar_lantern.rows, lx, ly, 1)

    if (night) {
      var rr = 34
      for (var q = 0; q < 10; q++) rect(ctx, 96 - rr + q * 2, 66 + (q % 2), (rr - q * 2) * 2, 1, P.honey, 0.06)
    }
    rect(ctx, 84, 63, 56, 4, P.lim)
    rect(ctx, 84, 67, 56, 2, P.walnut)
    rect(ctx, 88, 69, 3, 9, P.walnut)
    rect(ctx, 133, 69, 3, 9, P.walnut)
    rect(ctx, 92, 55, 30, 7, P.kaya)
    rect(ctx, 92, 62, 30, 1, P.kayaDeep)
    for (var gi = 0; gi < 5; gi++) rect(ctx, (94 + gi * 6.5) | 0, 56, 1, 6, P.kayaDeep)
    for (var gj = 0; gj < 3; gj++) rect(ctx, 93, 57 + gj * 2, 28, 1, P.kayaDeep)
    rect(ctx, 100, 57, 2, 2, P.slateDark)
    rect(ctx, 107, 59, 2, 2, P.clam)
    rect(ctx, 113, 57, 2, 2, P.slateDark)
    rect(ctx, 107, 55, 2, 2, P.clam)
    drawRows(ctx, SPRITES.teacup.rows, 125, 52, 1)

    var t = now / 1000
    var still = reduced() || !!target
    for (var si = 0; si < scene.steam.length; si++) {
      var p = scene.steam[si]
      var ph = still ? p.ph : (p.ph + t / 2.4) % 1
      var sty = 50 - Math.round(ph * 16)
      var stx = 130 + Math.round(Math.sin(ph * 6.28 + si) * 1.5) + (si % 2)
      rect(ctx, stx, sty, 1, 1, night ? P.rainLight : P.washi, (1 - ph) * (night ? 0.55 : 0.9))
    }

    var blink = !still && now < scene.blinkUntil
    drawRows(ctx, SPRITES[blink ? 'cat_sensei_blink' : 'cat_sensei'].rows, 66, 57, 1)
    rect(ctx, 66, 73, 15, 1, night ? P.ebony : P.oak)
    drawRows(ctx, SPRITES.tier_2_sprout.rows, 6, 49, 1)
  }
  function stepScene(n) {
    for (var i = 0; i < scene.drops.length; i++) {
      var d = scene.drops[i]
      d.y += d.v * n
      d.x -= 0.35 * n
      if (d.y > 50) {
        d.y = 8 + ((d.y - 50) % 4)
        d.x += 4 + (d.x % 3)
      }
      if (d.x < 12) d.x += 64
    }
  }
  function initScene(cv) {
    scene.cv = cv
    cv.width = 160
    cv.height = 90
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        scene.visible = es[0].isIntersecting
      }).observe(cv)
    }
    drawScene(performance.now())
  }

  var lastT = 0, acc = 0
  function loop(t) {
    requestAnimationFrame(loop)
    if (reduced() || document.hidden) {
      lastT = t
      return
    }
    var dt = t - lastT
    lastT = t
    acc += Math.min(dt, 250)
    if (acc < FRAME_MS) return
    var frames = Math.floor(acc / FRAME_MS)
    acc -= frames * FRAME_MS
    if (t > scene.nextBlink) {
      scene.blinkUntil = t + 160
      scene.nextBlink = t + 4000 + Math.random() * 3000
      blinkers.forEach(function (cv) { sprite(cv, 'cat_sensei_blink') })
    }
    if (scene.blinkUntil && t > scene.blinkUntil) {
      scene.blinkUntil = 0
      blinkers.forEach(function (cv) { sprite(cv, 'cat_sensei') })
    }
    if (scene.cv && scene.visible) {
      stepScene(frames)
      drawScene(t)
    }
  }

  var N = 9, CELL = 16, M = 16, BW = 160
  var LETTERS = 'ABCDEFGHJ'
  var HOSHI = [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]]
  function nb(i) {
    var x = i % N, y = (i / N) | 0, r = []
    if (x > 0) r.push(i - 1)
    if (x < N - 1) r.push(i + 1)
    if (y > 0) r.push(i - N)
    if (y < N - 1) r.push(i + N)
    return r
  }
  function group(b, i) {
    var col = b[i], seen = {}, st = [i], stones = [i], libs = {}, libCount = 0
    seen[i] = true
    while (st.length) {
      var p = st.pop(), ns = nb(p)
      for (var k = 0; k < ns.length; k++) {
        var q = ns[k]
        if (b[q] === 0) {
          if (!libs[q]) {
            libs[q] = true
            libCount++
          }
        } else if (b[q] === col && !seen[q]) {
          seen[q] = true
          st.push(q)
          stones.push(q)
        }
      }
    }
    return { stones: stones, libs: libCount }
  }
  function coordName(i) {
    return LETTERS[i % N] + (N - ((i / N) | 0))
  }

  function initBoard(cv, opts) {
    var t = opts.t
    var ctx = cv.getContext('2d')
    cv.width = BW
    cv.height = BW
    var game
    function fresh() {
      game = { b: new Array(N * N).fill(0), turn: 1, cap: { 1: 0, 2: 0 }, ko: -1, last: -1, hover: -1, cursor: 40, drop: null }
      var setup = [[2, 2, 1], [6, 2, 2], [4, 4, 1], [5, 4, 2], [6, 6, 1]]
      for (var s = 0; s < setup.length; s++) game.b[setup[s][1] * N + setup[s][0]] = setup[s][2]
    }
    function colorName(c) {
      return t(c === 1 ? 'board.black' : 'board.white')
    }
    function say(text) {
      if (opts.onMessage) opts.onMessage(text)
    }
    function status() {
      if (opts.onStatus) opts.onStatus({ turn: game.turn, turnText: t('board.turn', { c: colorName(game.turn) }), cap: game.cap })
    }
    function play(i) {
      if (game.b[i] !== 0) return say(t('board.occupied'))
      if (i === game.ko) return say(t('board.ko'))
      var b = game.b.slice(), me = game.turn, op = 3 - me
      b[i] = me
      var captured = []
      var ns = nb(i)
      for (var k = 0; k < ns.length; k++) {
        var q = ns[k]
        if (b[q] === op) {
          var g = group(b, q)
          if (g.libs === 0) {
            g.stones.forEach(function (s) { b[s] = 0 })
            captured = captured.concat(g.stones)
          }
        }
      }
      var own = group(b, i)
      if (own.libs === 0) return say(t('board.suicide'))
      game.b = b
      game.cap[me] += captured.length
      game.ko = captured.length === 1 && own.stones.length === 1 && own.libs === 1 ? captured[0] : -1
      game.last = i
      game.turn = op
      var vars = { c: colorName(me), p: coordName(i), n: captured.length }
      say(t(captured.length ? 'board.captured' : 'board.placed', vars))
      if (!reduced()) {
        game.drop = { i: i, t: performance.now() }
        var step = function () {
          draw()
          if (game.drop && performance.now() - game.drop.t < STONE_MS) requestAnimationFrame(step)
          else {
            game.drop = null
            draw()
          }
        }
        requestAnimationFrame(step)
      }
      status()
      draw()
    }
    function draw() {
      ctx.imageSmoothingEnabled = false
      var surf = cssVar('--board-surface'), edge = cssVar('--board-edge'), line = cssVar('--board-line'), lastC = cssVar('--last-move')
      rect(ctx, 0, 0, BW, BW, surf)
      var rnd = seeded(11)
      for (var k = 0; k < 14; k++) {
        var y = 12 + Math.floor(rnd() * 136), w = 6 + Math.floor(rnd() * 20), x = 12 + Math.floor(rnd() * (136 - w))
        rect(ctx, x, y, w, 1, edge, 0.55)
      }
      rect(ctx, 0, 0, BW, 1, edge)
      rect(ctx, 0, BW - 1, BW, 1, edge)
      rect(ctx, 0, 0, 1, BW, edge)
      rect(ctx, BW - 1, 0, 1, BW, edge)
      for (var l = 0; l < N; l++) {
        rect(ctx, M, M + l * CELL, CELL * (N - 1) + 1, 1, line)
        rect(ctx, M + l * CELL, M, 1, CELL * (N - 1) + 1, line)
      }
      HOSHI.forEach(function (h) { rect(ctx, M + h[0] * CELL, M + h[1] * CELL, 2, 2, line) })
      var shadowLeg = Object.assign({}, LEG, { E: cssVar('--stone-shadow') })
      var shadowRows = SPRITES.stone_black.rows.map(function (r) { return r.replace(/[^.]/g, 'E') })
      var now = performance.now()
      for (var i = 0; i < N * N; i++) {
        var c = game.b[i]
        if (!c) continue
        var sx = M + (i % N) * CELL, sy = M + ((i / N) | 0) * CELL
        var dy = 0
        if (game.drop && game.drop.i === i) {
          var pr = (now - game.drop.t) / STONE_MS
          dy = pr < 0.5 ? -2 : pr < 1 ? -1 : 0
        }
        drawRows(ctx, shadowRows, sx - 4, sy - 4, 1, shadowLeg)
        drawRows(ctx, SPRITES[c === 1 ? 'stone_black' : 'stone_white'].rows, sx - 5, sy - 5 + dy, 1)
      }
      if (game.last >= 0 && game.b[game.last]) {
        var lx = M + (game.last % N) * CELL, ly = M + ((game.last / N) | 0) * CELL
        drawRows(ctx, SPRITES.marker_last.rows, lx - 1, ly - 1, 1, Object.assign({}, LEG, { N: lastC }))
      }
      var focused = document.activeElement === cv
      var gh = game.hover >= 0 ? game.hover : focused ? game.cursor : -1
      if (gh >= 0 && game.b[gh] === 0) {
        var gx = M + (gh % N) * CELL, gy = M + ((gh / N) | 0) * CELL
        drawRows(ctx, SPRITES[game.turn === 1 ? 'stone_black' : 'stone_white'].rows, gx - 5, gy - 5, 1, null, 0.45)
      }
      if (focused && game.hover < 0) {
        var fx = M + (game.cursor % N) * CELL, fy = M + ((game.cursor / N) | 0) * CELL
        var fc = cssVar('--focus')
        rect(ctx, fx - 7, fy - 7, 4, 1, fc); rect(ctx, fx - 7, fy - 7, 1, 4, fc)
        rect(ctx, fx + 4, fy - 7, 4, 1, fc); rect(ctx, fx + 7, fy - 7, 1, 4, fc)
        rect(ctx, fx - 7, fy + 7, 4, 1, fc); rect(ctx, fx - 7, fy + 4, 1, 4, fc)
        rect(ctx, fx + 4, fy + 7, 4, 1, fc); rect(ctx, fx + 7, fy + 4, 1, 4, fc)
      }
    }
    function pointToIndex(e) {
      var r = cv.getBoundingClientRect()
      var lx = ((e.clientX - r.left) / r.width) * BW, ly = ((e.clientY - r.top) / r.height) * BW
      var x = Math.round((lx - M) / CELL), y = Math.round((ly - M) / CELL)
      if (x < 0 || y < 0 || x >= N || y >= N) return -1
      return y * N + x
    }
    var downAt = null
    cv.addEventListener('pointerdown', function (e) { downAt = { x: e.clientX, y: e.clientY } })
    cv.addEventListener('pointerup', function (e) {
      if (!downAt) return
      var moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y)
      downAt = null
      if (moved >= 8) return
      var i = pointToIndex(e)
      if (i >= 0) {
        game.cursor = i
        play(i)
      }
    })
    cv.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return
      var i = pointToIndex(e)
      if (i !== game.hover) {
        game.hover = i
        draw()
      }
    })
    cv.addEventListener('pointerleave', function () {
      game.hover = -1
      draw()
    })
    cv.addEventListener('focus', draw)
    cv.addEventListener('blur', draw)
    cv.addEventListener('keydown', function (e) {
      var x = game.cursor % N, y = (game.cursor / N) | 0
      var mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
      if (mv) {
        e.preventDefault()
        var nx = Math.min(N - 1, Math.max(0, x + mv[0])), ny = Math.min(N - 1, Math.max(0, y + mv[1]))
        game.cursor = ny * N + nx
        game.hover = -1
        say(t('board.cursor', { p: coordName(game.cursor) }))
        draw()
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        play(game.cursor)
      }
    })
    fresh()
    return {
      redraw: function () {
        draw()
        status()
      },
      reset: function () {
        fresh()
        say('')
        status()
        draw()
      },
      play: play,
    }
  }

  window.PG = {
    sprite: sprite,
    blinker: blinker,
    initScene: initScene,
    drawScene: drawScene,
    redrawScene: function () { drawScene(performance.now()) },
    initBoard: initBoard,
    start: function () { requestAnimationFrame(loop) },
    reduced: reduced,
    reduceMQ: reduceMQ,
  }
})()
