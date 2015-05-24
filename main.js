var app = require('app');
var path = require('path');
var ipc = require('ipc');

require('crash-reporter').start();

var Menu = require('menu');
var Tray = require('tray');
var BrowserWindow = require('browser-window');

var iconPlain = path.join('./images/', 'github-tray-plain.png');
var iconGreen = path.join('./images/', 'github-tray-green.png');

app.on('ready', function(){
  appIcon = new Tray(iconPlain);

  appIcon.on('clicked', function clicked (e, bounds) {
    if (appIcon.window && appIcon.window.isVisible()) {
      return hideWindow();
    } else {
      showWindow(bounds);
    }
  });

  function showWindow (bounds) {
    var options = {
      x: bounds.x - 200 + (bounds.width / 2),
      y: bounds.y,
      width: 400,
      height: 350,
      index: path.join('./', 'index.html')
    };

    if (appIcon.window) {
      // BrowserWindow exists - Do not Create
      appIcon.window.show();
    } else {
      initWindow(options);
    }
  }

  function initWindow (options) {
    // Create BrowserWindow
    var defaults = {
      width: options.width,
      height: options.height,
      show: true,
      frame: false,
      resizable: false,
      'standard-window': false
    };

    appIcon.window = new BrowserWindow(defaults);
    appIcon.window.setPosition(options.x, options.y);
    appIcon.window.on('blur', hideWindow);
    appIcon.window.loadUrl('file://' + __dirname + '/index.html');
  }

  function hideWindow () {
    if (!appIcon.window) return;
    appIcon.emit('hide');
    appIcon.window.hide();
    appIcon.emit('after-hide');
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
