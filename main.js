var app = require('app');
var path = require('path');
var ipc = require('ipc');

require('crash-reporter').start();

var Menu = require('menu');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

var iconPlain = path.join(__dirname, 'images', 'github-tray-plain.png');
var iconGreen = path.join(__dirname, 'images', 'github-tray-green.png');

app.on('ready', function(){
  appIcon = new Tray(iconPlain);
  initWindow();

  appIcon.on('clicked', function clicked (e, bounds) {
    if (appIcon.window && appIcon.window.isVisible()) {
      return hideWindow();
    } else {
      showWindow(bounds);
    }
  });

  function initWindow () {
    var defaults = {
      width: 400,
      height: 350,
      show: false,
      frame: false,
      resizable: false,
      'standard-window': false
    };

    appIcon.window = new BrowserWindow(defaults);
    appIcon.window.loadUrl('file://' + __dirname + '/index.html');
    appIcon.window.on('blur', hideWindow);
  }

  function showWindow (bounds) {
    var options = {
      x: bounds.x - 200 + (bounds.width / 2),
      y: bounds.y,
      index: path.join('./', 'index.html')
    };

    appIcon.window.setPosition(options.x, options.y);
    appIcon.window.show();
  }

  function hideWindow () {
    if (!appIcon.window) return;
    appIcon.window.hide();
  }

  ipc.on('reopen-window', function(event) {
    appIcon.window.show();
  });

  ipc.on('update-icon', function(event, arg) {
    var icon;
    if (arg == "IconGreen") {
      appIcon.setImage(iconGreen);
    } else {
      appIcon.setImage(iconPlain);
    }
  });

  app.dock.hide();
  appIcon.setToolTip('Github Notifications on your menu bar.');
});
