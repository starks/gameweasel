/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2010, 2011 Jesse Lentz
 *
 * This file is part of GameWeasel.
 *
 * GameWeasel is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * GameWeasel is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GameWeasel.  If not, see <http://www.gnu.org/licenses/>.
 */

var bg = chrome.extension.getBackgroundPage();

if (!bg.prefs['toolbar.classic'])
  document.head.removeChild(document.getElementsByTagName('link')[1]);

function toggle(that)
{
  var tog = that.parentNode.nextSibling;
  var span = that.childNodes[1];

  if (localStorage[that.id] == 'h')
  {
    tog.style.display = 'block';
    span.innerHTML = 'v';
    delete localStorage[that.id];
  }
  else
  {
    tog.style.display = 'none';
    span.innerHTML = '^';
    localStorage[that.id] = 'h';
  }
}

function init()
{
  var loggedIn = !!bg.prefs['accounts.current']; // This double negative is there to convert it to a boolean

  if (!loggedIn || !bg.prefs['toolbar.userlinks'])
    document.getElementById('userlinks').style.display = 'none';

  if (bg.prefs['toolbar.favorites'])
    bg.prefs.favorites.forEach(
      function(fav) {
        var tr = document.createElement('tr');
        document.getElementById('favorites-list').appendChild(tr);

        var td = document.createElement('td');
        tr.appendChild(td);

        var link = document.createElement('a');
        link.href = bg.gamefox_utils.createBoardLink(fav[0], fav[1]);
        link.textContent = fav[1];
        td.appendChild(link);
      });
  else
    document.getElementById('favorites').style.display = 'none';

  if (!bg.prefs['toolbar.search'])
    document.getElementById('search').style.display = 'none';

  if (!bg.prefs['toolbar.gotoboard'])
    document.getElementById('gotoboard').style.display = 'none';

  if (!bg.prefs['toolbar.login'] || loggedIn)
    document.getElementById('login').style.display = 'none';

  if (!bg.prefs['toolbar.login'] || !loggedIn)
    document.getElementById('logout').style.display = 'none';

  if (bg.prefs['toolbar.accounts'])
    for (var i in bg.prefs.accounts)
    {
      var tr = document.createElement('tr');
      document.getElementById('accounts-list').appendChild(tr);

      var td = document.createElement('td');
      tr.appendChild(td);

      var link = document.createElement('a');
      td.appendChild(link);

      link.href = '#';
      link.onclick = switch_account;
      link.innerHTML = bg.prefs.accounts[i].name;

      if (bg.prefs['accounts.current'] == bg.prefs.accounts[i].name)
        link.style.setProperty('color', (bg.prefs['toolbar.classic'] ? '#ff0' : 'red'), 'important');
    }
  else
    document.getElementById('accounts').style.display = 'none';

  /*if (bg.prefs['toolbar.tracked'])
    for (var topic in bg.prefs.tracked)
    {
      if (bg.prefs['toolbar.tracked.current'] &&
        bg.prefs.tracked[board].topics[topic].accounts.indexOf(bg.prefs['accounts.current']) == -1)
        continue;

      var tr = document.createElement('tr');
      document.getElementById('tracked-list').appendChild(tr);

      var td = document.createElement('td');
      tr.appendChild(td);

      var link = document.createElement('a');
      td.appendChild(link);

      link.href = 'http://www.gamefaqs.com' + bg.prefs.tracked[topic].link;
      link.innerHTML = bg.prefs.tracked[topic].title;
    }
  else
    document.getElementById('tracked').style.display = 'none';*/

  var links = document.getElementsByTagName('a');
  for (var i = 0; i < links.length; i ++)
    if (links[i].href.indexOf('#') == -1)
    {
      links[i].onmousedown = open_link;
      links[i].onclick = function(event) {
        event.preventDefault();
      };
    }

  if (bg.prefs['toolbar.tti'])
  {
    var strip = document.getElementById('tti');
    strip.appendChild(document.createTextNode(' / '));

    var link = document.createElement('a');
    link.href = '#';
    link.onclick = function(event) {
      event.preventDefault();
      bg.setPref('elements.tti', !bg.prefs['elements.tti']);
      event.target.innerHTML = 'TTI: ' + (bg.prefs['elements.tti'] ? 'On' : 'Off');

      var views = chrome.extension.getViews();
      for (var i in views)
        if (views[i].document.location.href.indexOf(chrome.extension.getURL('options/options.html')) == 0)
        {
          var ttiOpt = views[i].document.getElementById('elements.tti');
          if (ttiOpt)
          {
            ttiOpt.checked = bg.prefs['elements.tti'];
            ttiOpt.nextSibling.nextSibling.style.display = (ttiOpt.checked ? 'block' : 'none');
          }
        }

      chrome.tabs.getSelected(null, function (tab) {
        if (tab.url.search(/www\.gamefaqs\.com\/boards\/[a-z0-9-]+\/\d+/) != -1)
          chrome.tabs.sendRequest(tab.id, 'reload');
      });
    };
    link.innerHTML = 'TTI: ' + (bg.prefs['elements.tti'] ? 'On' : 'Off');
    strip.appendChild(link);
  }
  
  // this code needs to be here and not in onclick events due to chrome's security
  document.getElementById('search-button').addEventListener('click', open_link);
  document.getElementById('goto-button').addEventListener('click', open_link);
  document.getElementById('accounts-head').addEventListener('click', toggle_accounts_handler);
  document.getElementById('accounts-head').onclick = toggle_accounts_handler;
  document.getElementById('gamefaqs-login-submit').addEventListener('click', log_out_handler);
  document.getElementById('logout_button').addEventListener('click',  log_out); // no arguments, no handler
  document.getElementById('favorites-head').addEventListener('click', toggle_favorites_handler);
  /*document.getElementById('tracked-head').addEventListener('click', toggle_tracked_handler);
  document.getElementById('tracked-update').addEventListener('click', update_tracked);*/

  ['favorites', 'accounts'/*, 'tracked'*/].forEach(function(i) {
    if (localStorage[i + '-head'] == 'h')
    {
      delete localStorage[i + '-head'];
      toggle(document.getElementById(i + '-head'));
    }
  });
}

function open_link(event)
{
  var url;
  switch (event.target.id)
  {
    case 'search-button':
              url = 'http://www.gamefaqs.com/search/index.html?platform=0&game=' + document.getElementById('search_game').value;
      break;
    case 'goto-button':
      url = 'http://www.gamefaqs.com/boards/' + document.getElementById('lookup_board').value + '-board';
      break;
    default:
      url = event.target.href;
      break;
  }

  switch (event.button)
  {
    case 0:
      chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.update(tab.id, {url: url});
      });
    break;
    case 1:
      chrome.tabs.create({url: url, selected: event.shiftKey});
    break;
  }
}

function reload()
{
  document.getElementById('favorites-list').innerHTML = '';
  document.getElementById('accounts-list').innerHTML = '';
  /*document.getElementById('tracked-list').innerHTML = '';*/
  document.getElementById('tti').innerHTML = '';

  document.getElementById('userlinks').style.display = 'block';
  document.getElementById('login').style.display = 'block';
  document.getElementById('logout').style.display = 'block';

  init();
}

/*function update_tracked()
{
  if (!bg.prefs['accounts.current'])
  {
    alert('Could not update your tracked topics because you aren\'t logged in.');
    return;
  }

  var that = document.getElementById('tracked-update');
  that.disabled = true;
  bg.gamefox_tracked.updateList(function() {
    that.disabled = false;
    reload();
  });
}*/

function reload_tabs()
{
  chrome.tabs.getAllInWindow(null, function(tabs) {
    for (var i in tabs)
      if (tabs[i].url.indexOf('http://www.gamefaqs.com') == 0)
        chrome.tabs.sendRequest(tabs[i].id, 'reload');
  });
}

function switch_account(event)
{
  event.preventDefault();

  for (var i in bg.prefs.accounts)
    if (bg.prefs.accounts[i].name == event.target.textContent)
    {
      var account = bg.prefs.accounts[i];
      break;
    }

  if (typeof account == 'undefined')
  {
    alert('Error: Username and password not retrieved');
    return;
  }

  var ticker = document.createTextNode(' ');
  event.target.parentNode.appendChild(ticker);

  var updateTicker = setInterval((function(node) {
    return function() {
      if (node.textContent.length == 8)
        node.textContent = ' ';
      else
        node.textContent += '.';
    };
  })(ticker), 200);

  log_out(null, (function(account, updateTicker) {
    return function(key) {
      log_in(account.name, account.pass, key, updateTicker);
    }
  })(account, updateTicker));
}

function login_form(key)
{
  log_in(document.getElementById('login_email').value,
         document.getElementById('login_passwd').value, key);
}

function log_out(event, callback)
{
  if (event)
    event.preventDefault();

  var logout = new XMLHttpRequest();
  logout.open('GET', 'http://www.gamefaqs.com/user/logout.html');
  logout.onreadystatechange = function()
  {
    if (logout.readyState == 4)
    {
      bg.setPref('accounts.current', '');

      if (typeof callback == 'function')
      {
        var key = /<input class="hidden" type="hidden" name="key" value="(\w+)">/
          .exec(logout.responseText)[1];
        callback(key);
      }
      else
      {
        reload();
        reload_tabs();
      }
    }
  }
  logout.send(null);
}

function log_in(name, pass, key, ticker)
{
  var login = new XMLHttpRequest();
  login.open('POST', 'http://www.gamefaqs.com/user/login.html');
  login.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  login.onreadystatechange = function()
  {
    if (login.readyState == 4)
    {
      if (typeof ticker != 'undefined')
        clearInterval(ticker);

      if (login.responseText.indexOf('<title>Login Error - GameFAQs</title>') != -1)
      {
        alert('Login error! Maybe your password was incorrect? Try it again.');
        reload();
        reload_tabs();
      }
      else
      {
        bg.setPref('accounts.current', name);
        /*update_tracked();*/
        reload_tabs();
      }
    }
  }
  login.send(
    'key=' + bg.gamefox_utils.URLEncode(key) +
    '&EMAILADDR=' + bg.gamefox_utils.URLEncode(name) +
    '&PASSWORD=' + bg.gamefox_utils.URLEncode(pass)
  );
}

function log_out_handler(){
  log_out(null, login_form);
}
function toggle_accounts_handler(){
  toggle(document.getElementById('accounts-head'));
}
function toggle_favorites_handler(){
  toggle(document.getElementById('favorites-head'));
}
/*function toggle_tracked_handler(){
  toggle(document.getElementById('tracked-head'));
}*/

// This is done to remove the onload event from menu.html, reasons are outlined in the link below
// http://developer.chrome.com/trunk/extensions/contentSecurityPolicy.html
onload = init;