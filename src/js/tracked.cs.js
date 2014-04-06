/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2009, 2010 Brian Marshall, Michael Ryan
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

var gamefox_tracked =
{
  linkListener: function(event)
  {
    // Prevent the link from loading, make our own XMLHttpRequest to stop/start
    // tracking and update the cached tracked list
    event.preventDefault();

    var request = new XMLHttpRequest();
    request.open('GET', this.href);
    var link = this;
    request.onreadystatechange = function()
    {
      if (request.readyState == 4)
      {
        var result = gamefox_tracked.trackResponse(request.responseText);

        if (result[0])
        {
          if (result[1] == 'tracktopic')
          {
            link.textContent = link.parentNode.nodeName == 'LI' ?
              'Stop tracking' : 'Stop Tracking';
            link.href = link.href.replace(/tracktopic/, 'stoptrack');
          }
          else
          {
            link.textContent = 'Track Topic';
            link.href = link.href.replace(/stoptrack/, 'tracktopic');
          }
          chrome.extension.sendRequest('track');
        }
        else
          alert('An error occurred while tracking or untracking this topic.\n\n' + result[1]);
      }
    }
    request.send(null);
  },

  trackResponse: function(str)
  {
    // archived topic
    if (str.indexOf('Topic List</a>\n\t\t\t\t| Topic Archived') != -1)
      return [false, 'This topic is archived.'];

    // start tracking
    if (str.indexOf('?action=stoptrack">') != -1)
      return [true, 'tracktopic'];

    // stop tracking
    if (str.indexOf('?action=tracktopic">') != -1)
      return [true, 'stoptrack'];

    // generic error
    return [false, ''];
  },

  listUpdatedTopics: function()
  {
    var topics = [];
    for (var topicId in prefs.tracked)
      if (prefs.tracked[topicId].newPosts)
        topics.push(topicId);

    return topics;
  },

  markTopicAsRead: function(topicId, msgs)
  {
    if (!prefs.tracked[topicId])
      return;

    prefs.tracked[topicId].newPosts = false;
    prefs.tracked[topicId].msgs = msgs;

    gamefox_lib.setPref('tracked', prefs.tracked);
  },

  markAllAsRead: function()
  {
    for (var topicId in prefs.tracked)
      prefs.tracked[topicId].newPosts = false;

    gamefox_lib.setPref('tracked', prefs.tracked);
  },

  add: function(event, url)
  {
    if (event) // Double click
    {
      event.preventDefault();
      getSelection().removeAllRanges();
      url = this.cells[1].getElementsByTagName('a')[0].href;
    }

    var untrack = (url.match(/\d+$/)[0] in prefs.tracked);

    var request = new XMLHttpRequest();
    request.open('GET', url + '?action=' +
        (untrack ? 'stoptrack' : 'tracktopic'));
    request.onreadystatechange = function()
    {
      if (request.readyState == 4)
      {
        var result = gamefox_tracked.trackResponse(request.responseText);
        if (result[0])
        {
          chrome.extension.sendRequest('track');

          if (gamefox_lib.onPage('messages'))
          {
            var userNav = document.evaluate('//div[@class="board_nav"]//div[@class="user"]',
                document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var trackLink = document.evaluate('./a[contains(@href, "track")]', userNav,
                null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

            if (result[1] == 'tracktopic')
            {
              trackLink.textContent = 'Stop Tracking';
              trackLink.href = trackLink.href.replace(/tracktopic/, 'stoptrack');
            }
            else
            {
              trackLink.textContent = 'Track Topic';
              trackLink.href = trackLink.href.replace(/stoptrack/, 'tracktopic');
            }
          }
        }
        else
          alert('An error occurred while ' + (untrack ? 'un' : '') +
            'tracking this topic.\n\n' + result[1]);
      }
    }
    request.send(null);
  }
};
