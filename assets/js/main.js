;(function () {
  var root = document.documentElement
  var CONFIG = globalThis.SITE_CONFIG || {}
  var DICT = globalThis.I18N || {}
  var LOCALES = ['vi', 'en', 'ko', 'ja', 'zh-Hans']
  var page = document.body.getAttribute('data-page') || 'home'
  var locale = LOCALES.indexOf(root.getAttribute('data-locale')) >= 0 ? root.getAttribute('data-locale') : 'en'
  var board = null

  function store(k, v) {
    try {
      window.localStorage.setItem(k, v)
    } catch (e) {}
  }
  function read(k) {
    try {
      return window.localStorage.getItem(k)
    } catch (e) {
      return null
    }
  }
  function t(key, vars) {
    var table = DICT[locale] || {}
    var s = table[key] !== undefined ? table[key] : (DICT.en || {})[key]
    if (s === undefined) return key
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return vars[k] !== undefined ? String(vars[k]) : m
      })
    }
    return s
  }
  function el(tag, attrs, children) {
    var n = document.createElement(tag)
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'text') n.textContent = attrs[k]
        else if (k === 'className') n.className = attrs[k]
        else n.setAttribute(k, attrs[k])
      })
    }
    ;(children || []).forEach(function (c) {
      if (c) n.appendChild(c)
    })
    return n
  }
  function spriteCanvas(id, cls) {
    var cv = el('canvas', { 'aria-hidden': 'true', 'data-sprite': id })
    if (cls) cv.className = cls
    window.PG.sprite(cv, id)
    return cv
  }
  function iosUrl() {
    var ios = CONFIG.ios || {}
    if (ios.url) return ios.url
    if (ios.appId) return 'https://apps.apple.com/app/id' + String(ios.appId).replace(/^id/, '')
    return ''
  }

  function applyText() {
    document.querySelectorAll('[data-i18n]').forEach(function (n) {
      n.textContent = t(n.getAttribute('data-i18n'))
    })
    document.querySelectorAll('[data-i18n-attr]').forEach(function (n) {
      n.getAttribute('data-i18n-attr')
        .split(';')
        .forEach(function (pair) {
          var parts = pair.split(':')
          if (parts.length === 2) n.setAttribute(parts[0].trim(), t(parts[1].trim()))
        })
    })
    document.querySelectorAll('[data-shot]').forEach(function (img) {
      img.setAttribute('alt', t('shots.alt', { name: t('shots.' + img.getAttribute('data-shot')) }))
    })
    var title =
      page === 'privacy' ? t('pp.title') + ' · Pixel Go Chess' : page === '404' ? t('nf.title') + ' · Pixel Go Chess' : t('meta.title')
    document.title = title
    var desc = document.querySelector('meta[name="description"]')
    if (desc && page === 'home') desc.setAttribute('content', t('meta.description'))
    var year = String(new Date().getFullYear())
    document.querySelectorAll('[data-rights]').forEach(function (n) {
      n.textContent = t('footer.rights', { year: year, owner: CONFIG.owner || 'Pixel Go Chess' })
    })
    document.querySelectorAll('[data-email]').forEach(function (n) {
      if (!CONFIG.contactEmail) return
      n.setAttribute('href', 'mailto:' + CONFIG.contactEmail)
      if (n.hasAttribute('data-email-text')) n.textContent = CONFIG.contactEmail
    })
    if (page === 'privacy') {
      var showVi = locale === 'vi'
      document.querySelectorAll('[data-policy]').forEach(function (a) {
        a.hidden = a.getAttribute('data-policy') !== (showVi ? 'vi' : 'en')
      })
      var note = document.querySelector('[data-policy-note]')
      if (note) note.hidden = locale === 'en' || locale === 'vi'
    }
  }

  function renderStore(id, cfg, url, labelKey, icon, storeName, qrFile) {
    var box = document.getElementById(id)
    if (!box) return
    var btnSlot = box.querySelector('[data-store-btn]')
    var qrSlot = box.querySelector('[data-store-qr]')
    btnSlot.textContent = ''
    qrSlot.textContent = ''
    var live = !!(cfg && cfg.available && url)
    box.setAttribute('data-state', live ? 'live' : 'soon')
    if (live) {
      btnSlot.appendChild(
        el('a', { className: 'btn store-btn', href: url, rel: 'noopener' }, [spriteCanvas(icon), el('span', { text: t(labelKey) })]),
      )
      qrSlot.appendChild(
        el('img', {
          src: qrFile,
          width: '164',
          height: '164',
          alt: t('store.qrAlt', { store: storeName }),
          decoding: 'async',
        }),
      )
      qrSlot.appendChild(el('p', { className: 'qr-caption', text: t('store.qr') }))
    } else {
      btnSlot.appendChild(
        el('p', { className: 'btn store-btn is-soon', 'aria-disabled': 'true' }, [
          spriteCanvas(icon),
          el('span', { text: t(labelKey) }),
        ]),
      )
      var cat = el('canvas', { 'aria-hidden': 'true' })
      window.PG.sprite(cat, 'cat_sensei')
      qrSlot.appendChild(
        el('div', { className: 'qr-soon' }, [
          cat,
          el('span', { className: 'soon-tag', text: t('store.soon') }),
          el('p', { text: t('store.soonNote') }),
        ]),
      )
    }
  }

  function renderStores() {
    renderStore('store-android', CONFIG.android, (CONFIG.android || {}).url, 'store.google', 'icon_play', 'Google Play', 'assets/qr-android.svg')
    renderStore('store-ios', CONFIG.ios, iosUrl(), 'store.apple', 'icon_phone', 'App Store', 'assets/qr-ios.svg')
    var web = CONFIG.web || {}
    var live = !!(web.available && web.url)
    var link = document.querySelector('[data-web-play]')
    var title = document.querySelector('[data-web-title]')
    if (title) title.textContent = t(live ? 'web.play' : 'web.title')
    if (link) {
      link.hidden = !live
      if (live) link.setAttribute('href', web.url)
    }
  }

  function renderLangSelect() {
    var sel = document.getElementById('lang-select')
    if (!sel) return
    if (!sel.options.length) {
      LOCALES.forEach(function (l) {
        sel.appendChild(el('option', { value: l, lang: l, text: (DICT[l] || {})['lang.name'] || l }))
      })
      sel.addEventListener('change', function () {
        setLocale(sel.value)
      })
    }
    sel.value = locale
  }

  function setLocale(l) {
    if (LOCALES.indexOf(l) < 0) return
    locale = l
    root.setAttribute('lang', l)
    root.setAttribute('data-locale', l)
    store('pixelgo-site-lang', l)
    try {
      var u = new URL(window.location.href)
      if (u.searchParams.has('lang')) {
        u.searchParams.set('lang', l)
        history.replaceState(null, '', u.toString())
      }
    } catch (e) {}
    renderAll()
  }

  var themeBtns = document.querySelectorAll('[data-theme-btn]')
  function applyTheme(mode, save) {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode)
    else root.removeAttribute('data-theme')
    themeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-btn') === mode))
    })
    if (save) store('pixelgo-site-theme', mode)
    redraw()
  }
  themeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      applyTheme(b.getAttribute('data-theme-btn'), true)
    })
  })

  function redraw() {
    if (window.PG) {
      window.PG.redrawScene()
      if (board) board.redraw()
    }
  }

  function initBoard() {
    var cv = document.getElementById('board')
    if (!cv) return
    var msg = document.getElementById('board-msg')
    var turnStone = document.getElementById('turn-stone')
    var turnText = document.getElementById('turn-text')
    var capB = document.getElementById('cap-b')
    var capW = document.getElementById('cap-w')
    board = window.PG.initBoard(cv, {
      t: t,
      onMessage: function (s) {
        msg.textContent = s
      },
      onStatus: function (st) {
        window.PG.sprite(turnStone, st.turn === 1 ? 'stone_black' : 'stone_white')
        turnText.textContent = st.turnText
        capB.textContent = String(st.cap[1])
        capW.textContent = String(st.cap[2])
      },
    })
    var reset = document.getElementById('board-reset')
    if (reset) reset.addEventListener('click', board.reset)
  }

  function renderAll() {
    applyText()
    renderLangSelect()
    renderStores()
    if (board) board.redraw()
  }

  document.querySelectorAll('canvas[data-sprite]').forEach(function (cv) {
    window.PG.sprite(cv, cv.getAttribute('data-sprite'))
  })
  document.querySelectorAll('canvas[data-blink]').forEach(function (cv) {
    window.PG.blinker(cv)
  })
  var sceneCv = document.getElementById('scene')
  if (sceneCv) window.PG.initScene(sceneCv)
  initBoard()
  var savedTheme = read('pixelgo-site-theme')
  applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'auto', false)
  renderAll()
  window.PG.start()
  var darkMQ = window.matchMedia('(prefers-color-scheme: dark)')
  if (darkMQ.addEventListener) darkMQ.addEventListener('change', redraw)
  if (window.PG.reduceMQ.addEventListener) window.PG.reduceMQ.addEventListener('change', redraw)
})()
