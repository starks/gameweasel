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

function defaultPrefs()
{
  prefs = {
    'elements.quickpost.form': true,
    'elements.quickpost.button': true,
    'elements.quickpost.htmlbuttons': true,
    'elements.quickpost.htmlbuttons.extended': false,
    'elements.quickpost.htmlbuttons.gfcode': false,
    'elements.quickpost.htmlbuttons.spoilcode': false,
    'elements.quickpost.htmlbuttons.breaktags': true,
    'elements.quickpost.otherbuttons': true,
    'elements.quickpost.link': true,
    'elements.quickpost.link.title': 'QuickPost',
    'elements.quickpost.aftertopic': 0,
    'elements.quickpost.aftermessage': 0,
    'elements.quickpost.resetconfirm': true,
    'elements.quickpost.resetnewsig': false,
	'elements.quickpost.postwithoutpreviewbutton': false,
	'elements.quickpost.removenativebuttons': false,
    'elements.titlechange': true,
    'elements.titleprefix': false,
    'elements.msgnum': true,
    'elements.msgnum.style': 0,
    'elements.tracked.boardlink': true,
    'elements.charcounts': true,
    'elements.charmap': true,
    'elements.topics.lastpostlink': 1,
    'elements.marktc': true,
    'elements.marktc.marker': '(tc)',
    'elements.favorites': true,
    'elements.clock': false,
    'elements.aml.marknewposts': true,
    'elements.aml.pagejumper': true,
    'elements.editlink': true,
    'elements.deletelink': true,
    'elements.filterlink': true,
    'elements.quotelink': true,
    'elements.boardnav': true,
    'elements.sigspans': true,
    'elements.postidQuoteLinks': true,
    'elements.stylenative': true,

    'pm.highlight': true,
    'pm.color': '#FF0000',

    'elements.tti': false,
    'elements.tti.x': '200',
    'elements.tti.y': '200',
    'elements.tti.hoverx': '350',
    'elements.tti.hovery': '350',
    'elements.tti.max': 300,
    'elements.tti.nosigs': false,

    'msgsPerPage': 50,

    'quote.header.italic': false,
    'quote.header.bold': true,
    'quote.header.date': false,
    'quote.header.username': true,
    'quote.header.messagenum': true,
    'quote.message.italic': true,
    'quote.message.bold': false,
    'quote.removesignature': true,
    'quote.style': 0,
    'quote.controlwhitespace': true,
    'quote.focusQuickPost':  true,

    'sigs': [{accounts:'', boards:'', body:''}],
    'signature.applyeverywhere': false,
    'signature.newline': false,
    'signature.selectMostSpecific': true,

    'theme.disablegamefaqscss': false,
    'theme.extras': true,
    'styles': [
      'gfcode.css',
      'gamefox-essentials.css',
      'gamefox-ads.css',
      'gamefox-character-map.css',
      'gamefox-quickpost.css',
      'gamefox-quickwhois.css'
    ],
    'usercss': [],

    'userlist.topics.showgroupnames': false,
    'userlist.messages.showgroupnames': true,
    'userlists': [],

    'favorites': [],
    'favorites.enabled': true,

    'accounts': [],
    'accounts.current': '',

    'lastVisit': 0,
    'date.enableFormat': false,
    'date.topicPreset': 0,
    'date.topicCustom': '',
    'date.messagePreset': 0,
    'date.messageCustom': '',
    'date.clockPreset': 0,
    'date.clockCustom': '',

    'topic.dblclick': 0,
    'message.dblclick': false,
    'message.header.dblclick': 0,
    'myposts.dblclick': 0,

    'paging.auto': true,
    'paging.location': 2,
    'paging.prefix': '[Pages: ',
    'paging.separator': ', ',
    'paging.suffix': ']',

    'toolbar.userlinks': true,
    'toolbar.favorites': true,
    'toolbar.search': true,
    'toolbar.gotoboard': true,
    'toolbar.login': true,
    'toolbar.accounts': true,
    'toolbar.tracked': true,
    'toolbar.tracked.current': false,
    'toolbar.tti': true,
    'toolbar.classic': false,

    'context.breaktags': true,
    'context.delete': true,
    'context.filter': true,
    'context.pagelist': true,
    'context.quote': true,
    'context.usergroups': true,

    'version': '0.7.6.3'
  };
  setPref();
}

function setPref(pref, value)
{
  if (pref) prefs[pref] = value;
  localStorage.prefs = JSON.stringify(prefs);
}

function updateTo(ver)
{
  var cur = prefs.version.split('.'),
      cmp = ver.split('.');

  for (var i = 0; i < Math.max(cur.length, cmp.length); i ++)
  {
    if (cur[i] == undefined)
      return true;
    else if (cmp[i] == undefined)
      return false;
    else if (parseInt(cur[i]) < parseInt(cmp[i]))
      return true;
    else if (parseInt(cur[i]) > parseInt(cmp[i]))
      return false;
  }
  return false;
}

if ('prefs' in localStorage)
  prefs = JSON.parse(localStorage.prefs);
else
  defaultPrefs();

if (updateTo('0.6'))
  alert('You are updating from an unsupported version of GameWeasel. ' +
    'You may experience problems. If you do, please reset your preferences.'); 

if (updateTo('0.6.2'))
{
  if (prefs['elements.marknewposts'])
    prefs.styles.push('new-post-icons.css');

  delete prefs['elements.marknewposts'];
  delete prefs['elements.statusspans'];
}

if (updateTo('0.7.1'))
  delete prefs['signature.addition'];

if (updateTo('0.7.2'))
  prefs['elements.editlink'] = true;

if (updateTo('0.7.3'))
{
  prefs['signature.newline'] = false;
  delete prefs['elements.quickpost.blankPostWarning'];
}

if (updateTo('0.7.4.3'))
  prefs['elements.quickpost.resetnewsig'] = false;

if (updateTo('0.7.5'))
{
  var favArray = [];
  for (var bid in prefs.favorites)
    favArray.push([bid, prefs.favorites[bid]]);
  prefs.favorites = favArray;
}

if (updateTo('0.7.5.3'))
{
  prefs['elements.stylenative'] = true;
  prefs['pm.highlight'] = true;
  prefs['pm.color'] = '#FF0000';
}

if (updateTo('0.7.5.5'))
{
  prefs['theme.extras'] = false;
  [
    ['retroclassic.css', 'RetroClassic'],
    ['ninestalgia-chrome.css', 'Ninestalgia'],
    ['spotfaqs-extras.css', null]
  ].forEach(
    function(theme) {
      var i = prefs.styles.indexOf(theme[0]);
      if (i != -1)
      {
        if (theme[1]) // Omit message for spotfaqs extras
          alert('GameWeasel: ' + theme[1] + ' is now a built-in GameFAQs theme. ' +
            'Please modify your "site display style" setting to continue using it.');

        prefs.styles.splice(i, 1);
        prefs['theme.extras'] = true;
      }
    });
}

if (updateTo('0.7.5.10'))
  prefs['elements.tti.max'] = 300;

if (updateTo('0.7.5.21'))
  prefs['elements.quickpost.htmlbuttons.spoilcode'] = false;

if (updateTo('0.7.5.22'))
  setPref('version', '0.7.5.22');
  
if (updateTo('0.7.6')){
  setPref('version', '0.7.6');
  prefs['elements.quickpost.removenativebuttons'] = false;
  prefs['elements.quickpost.postwithoutpreviewbutton'] = false;
}

if (updateTo('0.7.6.1')){
  setPref('version', '0.7.6.1');
}

if (updateTo('0.7.6.3')){
  setPref('version', '0.7.6.3');
}

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request == 'prefs')
      sendResponse(prefs);
    else if (request instanceof Array)
      setPref(request[0], request[1]);
  });

function buildContextMenu()
{
  var board = [gamefox_utils.domain + gamefox_utils.path + '*'],
      topic = [gamefox_utils.domain + gamefox_utils.path + '*/*'],
      post  = [gamefox_utils.domain + gamefox_utils.path + '*/*/*'],
      user  = [gamefox_utils.domain + "/users/*"];

  if (prefs['context.breaktags'])
    chrome.contextMenus.create({
      title: 'Break HTML',
      contexts: ['editable'],
      documentUrlPatterns: board,
      onclick: function(info, tab) {
        chrome.tabs.sendRequest(tab.id, 'breaktags');
      }
    });

  if (prefs['context.quote'])
    chrome.contextMenus.create({
      title: 'Quote Message',
      contexts: ['link'],
      documentUrlPatterns: topic,
      targetUrlPatterns: post,
      onclick: function(info, tab) {
        chrome.tabs.sendRequest(tab.id, {quote: info.linkUrl});
      }
    });

  if (prefs['context.filter'])
    chrome.contextMenus.create({
      title: 'Filter by User',
      contexts: ['link'],
      documentUrlPatterns: topic,
      targetUrlPatterns: user,
      onclick: function(info, tab) {
        chrome.tabs.sendRequest(tab.id, {filter: info.linkUrl});
      }
    });

  if (prefs['context.usergroups'] && prefs.userlists.length)
  {
    var groupMenu = chrome.contextMenus.create({
      title: 'Highlighting Groups',
      contexts: ['link'],
      documentUrlPatterns: topic,
      targetUrlPatterns: user
    });

    function userlistClosure(i)
    {
      return function(info, tab) {
        chrome.tabs.sendRequest(tab.id, {userlist: info.linkUrl}, function(username) {
          var list = prefs.userlists[i].users.trim();
              list = list.length ? list.split(/\s*,\s*/) : [];
          var index = list.indexOf(username);

          if (index == -1)
            list.push(username);
          else
            list.splice(index, 1);

          prefs.userlists[i].users = list.join(', ');
          setPref();
          chrome.tabs.sendRequest(tab.id, 'reload');
        });
      };
    }

    for (var i = 0; i < prefs.userlists.length; i ++)
      if (prefs.userlists[i].type == 0)
        chrome.contextMenus.create({
          title: prefs.userlists[i].name || 'Group ' + (i + 1),
          contexts: ['link'],
          parentId: groupMenu,
          onclick: userlistClosure(i)
        });
  }
}
buildContextMenu();
