/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2011 Jesse Lentz
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

var prefPanels = {
  'All Pages': function() {
    panel.newChild('ul').add(
      submenu(
        _('elements.titlechange', 'Custom window titles'),
        _('elements.titleprefix', 'Window title page prefixes')),
      submenu(
        _('pm.highlight', 'Highlight PM inbox link if there are new messages'),
        _('pm.color', 'Color')),
      _('elements.favorites', 'Add favorites menu'),
      _('elements.clock', 'Add clock'),
      submenu(
        _('date.enableFormat', 'Custom date formats'),
        dateTable()));

    var clr = document.getElementById('pm.color');
    colorInit(clr, clr.parentNode);
  },
  'Topic Lists': function() {
    panel.newChild('ul').add(
      submenu(
        _('paging.auto', 'Links to topic pages'),
        document.createElement('ul').add(
          _('paging.location', 'Show links',
            ['In a new row below the topic title', 'Right of the topic title', 'Below the topic title']),
          [
            _('paging.prefix', 'Prefix'),
            _('paging.separator', 'Delimiter'),
            _('paging.suffix', 'Suffix')])),
      _('elements.aml.marknewposts', 'Mark new posts on active message list'),
      _('elements.aml.pagejumper', 'Page jumper on active message list'),
      _('elements.tracked.boardlink', 'Link to boards on tracked topic list'),
      _('elements.topics.lastpostlink', 'Linkify last post time', ['Disable', 'Last post', 'First unread post']));
  },
  'Message Lists': function() {
    panel.newChild('ul').add(
      _('msgsPerPage', 'Messages per page', ['10', '20', '30', '40', '50'], [10, 20, 30, 40, 50]),
      'Message header links',
      document.createElement('ul').add(
        _('elements.editlink', 'Edit'),
        _('elements.deletelink', 'Delete/Close'),
        _('elements.filterlink', 'Filter'),
        _('elements.quotelink', 'Quote')),
      submenu(
        _('elements.marktc', 'Label topic creator'),
        _('elements.marktc.marker', 'Label')),
      submenu(
        _('elements.msgnum', 'Number messages'),
        _('elements.msgnum.style', 'Format', [
          'message detail (link), #001',
          '#001, message detail (link)',
          '#001 (link)',
          'message #001 (link)'])),
      submenu(
        _('elements.tti', 'Convert image URLs to thumbnails'),
        document.createElement('ul').add(
          table(
            ['Thumbnail dimensions: ',
              [_('elements.tti.x'), ' x ', _('elements.tti.y')]],
            ['Dimensions on hover: ',
              [_('elements.tti.hoverx'), ' x ', _('elements.tti.hovery')]],
            [
              newElement('label', {
                htmlFor: 'elements.tti.max',
                textContent: 'Maximum conversions: '
              }),
              [newElement('input', {
                id: 'elements.tti.max',
                type: 'text',
                value: (bg.prefs['elements.tti.max'] == Infinity ? '' : bg.prefs['elements.tti.max']),
                onchange: function() {
                  bg.prefs['elements.tti.max'] = parseInt(this.value);
                  if (isNaN(bg.prefs['elements.tti.max']))
                    bg.prefs['elements.tti.max'] = Infinity;
                  bg.setPref();
                }
              }),
              ' (leave blank to omit limit)']]),
          'Set dimensions to 0x0 for the original size.'.span('small'),
          _('elements.tti.nosigs', 'Ignore signature images'))),
      _('elements.postidQuoteLinks', 'Link post numbers in quotes'),
      _('elements.stylenative', 'Emulate GFCode formatting for native quotes'),
      _('elements.boardnav', 'Navigation links at bottom of page'));
  },
  'Posting': function() {
    panel.newChild('ul').add(
      _('elements.quickpost.button', 'Post Message button'),
	  _('elements.quickpost.postwithoutpreviewbutton', 'Post without Preview (Must be level 30+)'),
      _('elements.charcounts', 'Character counters'),
      _('elements.charmap', 'Character map'),
	  _('elements.quickpost.removenativebuttons', 'Remove native GameFAQs tag buttons'),
      'HTML tag buttons',
      document.createElement('ul').add(
        _('elements.quickpost.htmlbuttons', 'Standard'),
        _('elements.quickpost.htmlbuttons.extended', 'Extended'),
        _('elements.quickpost.htmlbuttons.gfcode', 'GameFAQs quotes'),
		_('elements.quickpost.htmlbuttons.spoilcode', 'Spoilers and Code'),
		_('elements.quickpost.htmlbuttons.breaktags', 'Break HTML')));
  },
  'QuickPost': function() {
    panel.newChild('ul').add(
      submenu(
        _('elements.quickpost.link', 'Topic QuickPost'),
        _('elements.quickpost.link.title', 'Link label')),
      _('elements.quickpost.form', 'Message QuickPost'),
      _('elements.quickpost.otherbuttons', 'Preview and reset buttons'),
      _('elements.quickpost.resetconfirm', 'Confirm resetting post'),
      _('elements.quickpost.aftertopic', 'After QuickPosting a topic',
        ['Go to topic', 'Go to board']),
      _('elements.quickpost.aftermessage', 'After QuickPosting a message',
        ['Go to last post', 'Go back to same page', 'Go to first page', 'Go to board']));
  },
  'Quoting': function() {
    panel.newChild('ul').add(
      'Quote Header',
      document.createElement('ul').add(
        _('quote.header.username', 'Include Username'),
        _('quote.header.date', 'Include Date'),
        _('quote.header.messagenum', 'Include Post Number')),
      'Quote Style',
      document.createElement('ul').add(
        _('quote.header.bold', 'Bold header'),
        _('quote.header.italic', 'Italicize header'),
        _('quote.message.bold', 'Bold message'),
        _('quote.message.italic', 'Italicize message')),
      _('quote.removesignature', 'Remove signature'),
      _('quote.focusQuickPost', 'Automatically scroll to QuickPost after quoting'),
      _('quote.style', 'Format quote with',
        ['GameFAQs quotes', 'Classic tags (<b> and <i>)']));
  },
  'Mouse Actions': function() {
    panel.newChild('ul').add(
      table(
        _('topic.dblclick', 'Double click on topic list',
          ['Do nothing', 'Show links to topic pages', 'Go to last post', 'Go to last page'],
          [0, 1, 2, 4]),
        _('myposts.dblclick', 'Double click on active message list',
          ['Do nothing', 'Show links to topic pages', 'Go to last post', 'Go to last page'],
          [0, 1, 2, 4]),
      _('message.header.dblclick', 'Double click on message header',
        ['Do nothing', 'Show QuickWhois', 'Quote message', 'Filter messages'])),
      _('message.dblclick', 'Double click message body to quote message'));
  },
  'Stylesheets': function() {
    panel.newChild('ul', {className: 'loner'}).add(
      _('theme.disablegamefaqscss', 'Disable main GameFAQs stylesheets'),
      _('theme.extras', 'Load extras for RetroClassic, Ninestalgia, GameFAX, and SpotFAQs themes'));

    panel.newChild('ul', {className: 'panel'}).add(
      'Themes',
      css('ricapar.css', 'Classic',
        'Emulates the 2001-2004 style of GameFAQs. Disable main GameFAQs stylesheets to use.<br />'+
        'Use with the following <a href="http://www.gamefaqs.com/boards/settings.php">Board Display Settings</a>:<br />'+
        '&nbsp; &nbsp; Topic List Display: Ad in topic list<br />'+
        '&nbsp; &nbsp; Message List Display: Ad in message list',
          'Ricapar et al.'),
      css('gfpastel-2010.css', 'GFPastel 2010',
        'A modern stylesheet in pastel blues and purples. Disable main GameFAQs stylesheets to use.', 'spynae'),
      css('progfaqs.css', 'ProgFAQs',
        'A progressive, low contrast theme for GameFAQs. Disable main GameFAQs stylesheets to use.', 'spynae'),
      css('wide-layout.css', 'Wide default',
        'Increases the width of the page to fill the whole window. Works with the default GameFAQs skin.'));

    panel.newChild('ul', {className: 'panel'}).add(
      'Tweaks',
      css('gamefox-ads.css', 'Ad blocking', 'Hides ads and ad-related page elements. Best used with an ad blocking extension.'),
      css('ascii-art-font.css', 'ASCII art font', 'Increases the font size of messages to make ASCII art look better.'),
      css('FAQ-frames.css', 'FAQ frames', 'Styles the FAQ headers to look more like GameFAQs.', 'selmiak'),
      css('hide-signatures.css', 'Hide signatures', 'Hides signatures in posts and shows them again when hovered over.'),
      css('remove-signatures.css', 'Remove signatures', 'Removes signatures in posts.'),
	  css('remove-populartopics.css', 'Remove popular topics', 'Removes the popular topics from the main page.'),
      css('capitalized-message-links.css', 'Capitalized message links', 'Capitalizes the links in message headers.'),
      css('message-link-icons.css', 'Message link icons',
        'Converts links in the message header (message detail, edit, delete, filter, quote) to icons.<br />'+
        'Icons courtesy of <a href="http://www.pinvoke.com/">Yusuke Kamiyamane</a>.', 'Poo Poo Butter'),
      css('new-post-icons.css', 'New post icons',
        'Use icons to distinguish between topics with and without unread posts.<br />'+
        'Icons courtesy of <a href="http://www.pinvoke.com/">Yusuke Kamiyamane</a>.'),
      css('status-default.css', 'Status icons (normal)',
        'Show topic status icons for closed/sticky topics.'),
      css('status-classic.css', 'Status icons (classic)',
        'Show topic status icons for closed/sticky topics - emulates the pre-2006 style of icons.'));

    panel.newChild('ul', {className: 'panel'}).add(
      'GameWeasel Features',
      css('gamefox-essentials.css', 'Essentials', 'Styles GameWeasel features, should always be enabled.'),
      css('gfcode.css', 'GFCode', 'Adds quote and code elements to posts.', 'Ant P.'),
      css('gamefox-character-map.css', 'Character map', 'Makes the character map look pretty.'),
      css('gamefox-quickpost.css', 'QuickPost', 'Makes QuickPost look pretty.'),
      css('gamefox-quickwhois.css', 'QuickWhois', 'Makes QuickWhois look pretty.'));

    var custom = panel.newChild('ul', {className: 'panel'});
    custom.add('Custom');
    for (var i = 0; i < bg.prefs.usercss.length; i ++)
      custom.add([
        _('usercss.' + i + '.1', bg.prefs.usercss[i][0]),
        ' ', panelLink('Delete', rm('usercss', i))]);

    custom.add([
      newElement('label', {
        htmlFor: 'importcss',
        textContent: 'Import stylesheet: '
      }),
      newElement('input', {
        id: 'importcss',
        type: 'file',
        onchange: function() {
          var name = this.files[0].name,
              reader = new FileReader();

          reader.onload = function() {
            bg.prefs.usercss.push([name, true, this.result]);
            bg.setPref();
            panelReload();
          };
          reader.onerror = function() {
            alert('Error: File could not be read.');
          };
          reader.readAsText(this.files[0], 'UTF-8');
        }
      })]);
  },
  'Highlighting': function() {
    for (var i = 0; i < bg.prefs.userlists.length; i ++)
    {
      var container = panel.newChild('div', {className: 'panel'});
      container.newChild('span').mergeChild([bg.prefs.userlists[i].name ||
          'Group ' + (i + 1), panelLink('Delete', rm('userlists', i))]);
      container.appendChild(
        table(
          _('userlists.' + i + '.name', 'Group Name'),
          _('userlists.' + i + '.color', 'Color'),
          [
            _('userlists.' + i + '.type', null, ['Username is: ', 'Title contains: ', 'Post contains: ']),
            _('userlists.' + i + '.users', 'AREA')],
          [
            'Include: ',
            [
              _('userlists.' + i + '.include.admins', 'Administrators'), ' ',
              _('userlists.' + i + '.include.mods', 'Moderators'), ' ',
              _('userlists.' + i + '.include.vips', 'VIPs'), ' ',
              _('userlists.' + i + '.include.tc', 'Topic creator')]],
          _('userlists.' + i + '.topics', 'Topic action', ['Highlight', 'Remove', 'None']),
          _('userlists.' + i + '.messages', 'Message action', ['Highlight', 'Remove', 'Collapse', 'None'])));

      colorInit(document.getElementById('userlists.' + i + '.color'), container);
      document.getElementById('userlists.' + i + '.name').addEventListener('change',
        function() {
          panelReload();
          chrome.contextMenus.removeAll(bg.buildContextMenu);
        }, false);
    }

    panel.newChild('ul').add(
      button('Add Group', function() {
        bg.prefs.userlists.push({
          'name': '',
          'color': '#CCFFFF',
          'type': 0,
          'users': '',
          'include': [],
          'topics': 0,
          'messages': 0
        });
        bg.setPref();
        chrome.contextMenus.removeAll(bg.buildContextMenu);
      }),
      _('userlist.topics.showgroupnames', 'Show group names on topic lists'),
      _('userlist.messages.showgroupnames', 'Show group names on message lists'));
  },
  'Signatures': function() {
    var siglist = newElement('div');
    panel.newChild('ul').add(
      submenu(
        _('signature.applyeverywhere', 'Replace standard GameFAQs signature'),
        siglist));

    for (var i = 0; i < bg.prefs.sigs.length; i ++)
    {
      var container = siglist.newChild('div', {className: 'panel'}),
          sublist = document.createElement('ul');

      if (i > 0)
      {
        container.mergeChild(['Signature ' + i, panelLink('Delete', rm('sigs', i))]);
        container.appendChild(sublist.add(
          _('sigs.' + i + '.boards', 'Boards'),
          'Comma-separated list of board names and ids; if left blank, this sig is used for all boards.'.span('small'),
          _('sigs.' + i + '.accounts', 'Accounts'),
          'Comma-separated list of universal account names; if left blank, this sig is used for all accounts.'.span('small')));
      }
      else
      {
        container.newChild('span', {textContent: 'Default Signature'});
        container.appendChild(sublist);
      }

      var area = _('sigs.' + i + '.body', 'AREA');
      area.onkeyup = function() {
        var sigLength = bg.gamefox_utils.specialCharsEncode(this.value).length;
        var sigChars = document.getElementById(this.id.replace('body', 'chars'));

        sigChars.textContent = sigLength + '/160';
        if (sigLength > 160)
        {
          sigChars.textContent += ' (!!)';
          sigChars.style.setProperty('font-weight', 'bold', null);
        }
        else
          sigChars.style.setProperty('font-weight', '', null);
      };

      var sigChars = document.createElement('span');
      sigChars.id = 'sigs.' + i + '.chars';

      sublist.add(
        area,
        [button('Grab from GameFAQs', importSig), button('Save to GameFAQs', exportSig), sigChars]);

      area.onkeyup();
    }

    siglist.newChild('ul').add(
      button('Add Signature', function() {
        bg.prefs.sigs.push({accounts: '', boards: '', body: ''});
        bg.setPref();
      }),
      _('signature.selectMostSpecific', 'Select signatures with the most specific account and board settings'),
      _('elements.quickpost.resetnewsig', 'Choose a new signature when resetting post'));
  },
  'Accounts': function() {
    for (var i = 0; i < bg.prefs.accounts.length; i ++)
    {
      var container = panel.newChild('div', {className: 'panel'});
      container.newChild('span').mergeChild([bg.prefs.accounts[i].name ||
          'New Account', panelLink('Delete', rm('accounts', i))]);
      container.appendChild(
        table(
          _('accounts.' + i + '.name', 'Universal username'),
          _('accounts.' + i + '.pass', 'Password')));

      document.getElementById('accounts.' + i + '.name').addEventListener('change', panelReload, false);
    }

    panel.appendChild(
      button('Add Account', function() {
        bg.prefs.accounts.push({
          name: '',
          pass: ''
        });
        bg.setPref();
      }));
    panel.appendChild(' Warning: Passwords are not internally encrypted.'.span('warn'));
  },
  'Favorites': function() {
    function mvClosure(i)
    {
      return function() {
        var swap;
        var cpy = bg.prefs.favorites[i].slice();

        if (this.textContent == '^' && i != 0)
          swap = i - 1;
        else if (this.textContent == 'v' && i != bg.prefs.favorites.length)
          swap = i + 1;
        else
          return;

        bg.prefs.favorites[i] = bg.prefs.favorites[swap];
        bg.prefs.favorites[swap] = cpy;
        bg.setPref();
      };
    }

    var favTable = document.createElement('table');
    favTable.style.marginLeft = '25px';
    favTable.style.marginTop = '5px';

    bg.prefs.favorites.forEach(
      function(fav, i) {
        favTable.makeRow(
          [
            panelLink('^', mvClosure(i)),
            ' ',
            panelLink('v', mvClosure(i)),
            ' ',
            panelLink('Delete', rm('favorites', i))],
          newElement('a', {
            href: bg.gamefox_utils.createBoardLink(fav[0], fav[1]),
            textContent: fav[1]
          }));
      });

    panel.newChild('ul').add(
      [
        _('favorites.enabled', 'Automatically synchronize with GameFAQs board index'),
        'Synchronization will wipe out any changes you make here.'.span('notice')],
      favTable,
      table(
        [
          newElement('label', {htmlFor: 'bname', textContent: 'Name: '}),
          newElement('input', {type: 'text', id: 'bname'})],
        [
          newElement('label', {htmlFor: 'bid', textContent: 'ID: '}),
          [
            newElement('input', {type: 'text', id: 'bid'}),
            button('Add', function() {
              var id = document.getElementById('bid').value,
                  name = document.getElementById('bname').value;

              if (id.length && name.length)
              {
                bg.prefs.favorites.push([id, name]);
                bg.setPref();
              }
            })
          ]])
      );
    document.getElementsByTagName('table')[1].className = 'panel';
  },
  'Menus': function() {
    panel.newChild('ul', {className: 'panel menu'}).add(
      'Toolbar Menu',
      _('toolbar.userlinks', 'User links'),
      _('toolbar.accounts', 'Account switcher'),
      _('toolbar.login', 'Login form'),
      _('toolbar.search', 'Game search'),
      _('toolbar.gotoboard', 'Go to board ID'),
      _('toolbar.favorites', 'Favorite boards list'),
      _('toolbar.tti', 'TTI Switch'),
      _('toolbar.classic', 'Classic GameFAQs style'));

    panel.newChild('ul', {className: 'panel menu'}).add(
      'Context Menu',
    /*_('context.pagelist', 'Topic Pages'),*/
      _('context.quote', 'Quote'),
      _('context.filter', 'Filter'),
    /*_('context.delete', 'Delete/Close'),*/
      _('context.usergroups', 'Highlighting Groups'),
      _('context.breaktags', 'Break HTML'));

    var items = document.querySelectorAll('input[id^="context"]');
    for (var i = 0; i < items.length; i ++)
      items[i].addEventListener('change', function() {
        chrome.contextMenus.removeAll(bg.buildContextMenu);
      }, false);
  },
  'Manage Settings': function() {
    panel.newChild('div', {className: 'loner'}).mergeChild([
      newElement('label', {
        htmlFor: 'import',
        textContent: 'Import preferences: '
      }),
      newElement('input', {
        id: 'import',
        type: 'file',
        onchange: function() {
          var reader = new FileReader();
          reader.onload = importPrefs;
          reader.onerror = function() {
            alert('Error: File could not be read.');
          };
          reader.readAsText(this.files[0], 'UTF-8');
        }})]);
    panel.newChild('div', {className: 'loner'}).mergeChild([
        button('Export Preferences', exportPrefs), ' ',
        button('Reset Preferences', function() {
          if (confirm('Danger, Will Robinson! Are you sure?'))
            bg.defaultPrefs();
        })
    ]);
  }
};

onload = function() {
  bg = chrome.extension.getBackgroundPage();
  menu = document.body.newChild('ul');
  panel = document.body.newChild('div', {className: 'panel'});

  for (var name in prefPanels)
    menu.add(panelLink(name, function() {
      document.getElementsByClassName('selected')[0].className = '';
      this.parentNode.className = 'selected';
    }));

  menu.firstChild.className = 'selected';
  prefPanels['All Pages']();
};
