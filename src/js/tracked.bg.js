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
  updateList: function(callback)
  {
    var account = prefs['accounts.current'];
    if (!prefs['tracked.rssUrl'][account])
    { // No cached url
      var request = new XMLHttpRequest();
      request.open('GET', gamefox_utils.domain + gamefox_utils.path + 'tracked.php');
      request.onreadystatechange = function()
      {
        if (request.readyState == 4)
        {
          var url = /<link rel="alternate"[^>]*href="(http:\/\/www\.gamefaqs\.com\/boards\/tracked\.xml\?user=\d+&key=[^"]+)" \/>/
            .exec(request.responseText);
          if (url)
          {
            url = url[1];

            prefs['tracked.rssUrl'][account] = url;
            gamefox_tracked.grabFromRSS(url, callback);
          }
        }
      }
      request.send(null);
    }
    else
    {
      // use cached url
      gamefox_tracked.grabFromRSS(prefs['tracked.rssUrl'][account], callback);
    }
  },

  grabFromRSS: function(url, callback)
  {
    var request = new XMLHttpRequest();
    request.open('GET', url);
    request.onreadystatechange = function()
    {
      if (request.readyState == 4)
      {
        var year = new Date().getFullYear();
        var prevLastPost = 0;

        var xmlobject = (new DOMParser()).parseFromString(request.
            responseText.substr(request.responseText.indexOf('>') + 1), 'text/xml');

        var items = xmlobject.getElementsByTagName('item');
        var updated = [];
        for (var i = 0; i < items.length; i++)
        {
          var title = items[i].getElementsByTagName('title')[0].textContent;
          var link = items[i].getElementsByTagName('link')[0].textContent;
          var ids = gamefox_utils.parseBoardLink(link);

          var topic = {
            title: title.substr(0, title.lastIndexOf('-') - 2),
            boardId: ids.board,
            link: link,
            age: title.substr(title.lastIndexOf('-') + 2),
            newPosts: false,
            accounts: [prefs['accounts.current']],
          };
          var data = new Array(
              'Last Post', 'lastPost',
              'Messages', 'msgs',
              'Board', 'boardName'
              );

          var desc = items[i].getElementsByTagName('description')[0].
            textContent;

          for (var j = 0; j < data.length; j += 2)
          {
            topic[data[j + 1]] =
                (new RegExp(data[j] + ': ([^\\0]*?)\n')).
                exec(desc)[1].replace(/<br \/>/g, '').trim();
          }
          topic.msgs = parseInt(topic.msgs);

          // check for year change
          if (prevLastPost != 0 &&
              prevLastPost < topic.lastPost.strtotime().getTime())
          {
            // this entry is more recent than the last entry, which should
            // only happen when the year is different
            --year;
          }
          prevLastPost = topic.lastPost.strtotime().getTime();
          topic.lastPostYear = year;

          // check for new posts
          if (prefs.tracked[ids.topic])
          {
            if (topic.msgs > prefs.tracked[ids.topic].msgs || prefs.tracked[ids.topic].newPosts)
              topic.newPosts = true;

            if (prefs.tracked[ids.topic].accounts.indexOf(prefs['accounts.current']) == -1)
              prefs.tracked[ids.topic].accounts.push(prefs['accounts.current']);
            topic.accounts = prefs.tracked[ids.topic].accounts;
          }

          prefs.tracked[ids.topic] = topic;
          updated.push(ids.topic);
        }

        // check deleted topics
        for (var i in prefs.tracked)
        {
          if (prefs.tracked[i].accounts.indexOf(prefs['accounts.current']) != -1 && updated.indexOf(i) == -1)
            delete prefs.tracked[i];
        }

	      setPref('tracked.lastUpdate', Math.floor(Date.now() / 1000));
        if (callback)
          callback();
      }
    }
    request.send(null);
  },

  deleteTopic: function(boardId, topicId)
  {
    var topic = bg.prefs.tracked[boardId].topics[topicId];
    if (!topic.deleted)
    {
      var request = new XMLHttpRequest();
      request.open('GET', gamefox_utils.linkToTopic(boardId, topicId) + '?action=stoptrack');
      request.onreadystatechange = function()
      {
        if (request.readyState == 4)
        {
          if (request.responseText.indexOf('no longer tracking') != -1)
            gamefox_tracked.updateList();
          else
            alert('An error occurred untracking this topic.');
        }
      }
      request.send(null);
    }
    else
    {
      delete bg.prefs.tracked[boardId].topics[topicId];

      if (!bg.prefs.tracked[boardId].topics.__count__)
        delete bg.prefs.tracked[boardId]; // board is empty

      bg.setPref();
    }
  }
};
