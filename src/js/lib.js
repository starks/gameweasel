/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2008, 2009, 2010 Brian Marshall, Michael Ryan, Andrianto Effendy
 *
 * This file is part of GameFOX.
 *
 * GameFOX is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2
 * as published by the Free Software Foundation.
 *
 * GameFOX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GameFOX.  If not, see <http://www.gnu.org/licenses/>.
 */

var gamefox_lib =
{
  getPref: function(pref)
  {
    return prefs[pref];
  },

  setPref: function(pref, value)
  {
    chrome.extension.sendRequest([pref, value]);
  },

  onPage: function(page)
  {
    if (document.gamefox.pageType)
      return document.gamefox.pageType.indexOf(page) != -1;

    // pageType is an array because of overlapping pages, e.g. message detail and messages
    switch (page)
    {
      case 'index':
        return (document.location.pathname == '/boards');

      case 'topics':
        var div = document.querySelector('#content .board_wrap');
        if (div)
        {
          var col = document.evaluate('./div[@class="body"]/table[@class="board topics"]/colgroup/col[@class="status"]',
              div, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (col)
          {
            document.gamefox.pageType = ['topics'];
            return true;
          }
          // TODO: iterate over all <p> nodes (fails case when deleting only topic on board)
          var notopics = document.evaluate('./p', div, null,
              XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (notopics && notopics.textContent.indexOf('No topics are available') != -1)
          {
            document.gamefox.pageType = ['topics'];
            return true;
          }
        }
        return false;

      case 'messages':
        var div = !!document.querySelector('.body'); 
        if (div)
        {
          var table = !!document.querySelector('.board.message');
          if (table)
          {
            var messageList = (!!document.querySelector('.board.message.msg')) || (!!document.querySelector('.board.message'));
            if (!messageList){
              console.log("This shouldn't happen @ lib.js @ 74");
              document.gamefox.pageType = ['unknown'];
            }else{
              var isDetail = (!!document.querySelector('form[action$="friend"]')) /* all users but you have this on message detail */ || (!!document.querySelector('form[action$="delete"]')); /* your own message detail */

              var isNotArchived = !!document.querySelector('.name');
              // apparently this only exists when the username link does too,
              // so this can be used to detect archived topics

              if (isNotArchived){
                document.gamefox.pageType = ['messages'];
              }else if (isDetail) {
                document.gamefox.pageType = ['messages', 'detail'];
              }else{
                document.gamefox.pageType = ['messages', 'archive'];
              }
            }
            return true;
          }
        }
        return false;

      case 'boardlist':
        var div = document.querySelector('#content .board_wrap');
        if (div)
        {
          var table = document.evaluate('./div[@class="body"]/table[@class="board"]',
              div, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          if (table && !gamefox_lib.onPage('index'))
          {
            document.gamefox.pageType = ['boardlist'];
            return true;
          }
        }
        return false;

      default:
        return document.location.pathname.indexOf('/boards/' + page + '.php') == 0;
    }
  },

  setTitle: function(title, prefix, page)
  {
    if (!prefs['elements.titlechange']) return;
    if (!prefs['elements.titleprefix']) prefix = null;

    document.title = 'GameFAQs'
      + (prefix == null ? '' : ':' + prefix)
      + (page == null ? '' : ':' + page)
      + ': ' + title;
  }
};
