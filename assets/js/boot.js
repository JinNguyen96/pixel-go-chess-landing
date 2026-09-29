(function () {
  var LOCALES = ['vi', 'en', 'ko', 'ja', 'zh-Hans']
  var root = document.documentElement
  function read(key) {
    try {
      return window.localStorage.getItem(key)
    } catch (e) {
      return null
    }
  }
  function match(tag) {
    if (!tag) return null
    var t = String(tag).toLowerCase()
    if (t === 'zh-hans' || t === 'zh-cn' || t === 'zh-sg' || t === 'zh' || t.indexOf('zh-hans') === 0) return 'zh-Hans'
    for (var i = 0; i < LOCALES.length; i++) {
      var l = LOCALES[i].toLowerCase()
      if (t === l || t.indexOf(l + '-') === 0) return LOCALES[i]
    }
    return null
  }
  var fromQuery = null
  try {
    fromQuery = match(new URLSearchParams(window.location.search).get('lang'))
  } catch (e) {}
  var locale = fromQuery || match(read('pixelgo-site-lang'))
  if (!locale) {
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]
    for (var j = 0; j < langs.length && !locale; j++) locale = match(langs[j])
  }
  locale = locale || 'en'
  root.setAttribute('lang', locale)
  root.setAttribute('data-locale', locale)
  var theme = read('pixelgo-site-theme')
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme)
  root.classList.add('js')
})()
