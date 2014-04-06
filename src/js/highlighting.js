/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2008, 2009, 2010
 * Brian Marshall, Michael Ryan, Andrianto Effendy
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

var gamefox_highlighting =
{
  highlightClassName: 'gamefox-highlight',
  groupClassName: 'gamefox-groupname',
  extraTypes: ['admins', 'mods', 'vips', 'tc'],

  loadGroups: function()
  {
    var values, value, included;
    this.index = {users:{}, titleContains:{}, postContains:{}, status: {}};
    for (var i = 0; i < gamefox_highlighting.extraTypes.length; i++)
      this.index.status[gamefox_highlighting.extraTypes[i]] = [];

    // build the index
    for (var i = 0; i < prefs.userlists.length; i++)
    {
      values = prefs.userlists[i].users.trim().toLowerCase().split(/\s*[,\n]\s*/m);
      included = prefs.userlists[i].include;
      for (var j = 0; j < values.length; j++)
      {
        value = values[j];
        if (!value.length) continue;

        if (prefs.userlists[i].type == 0) // Users
        {
          if (this.index.users[value])
          {
            // don't add the same group twice, if the value is listed multiple times
            if (this.index.users[value].indexOf(i) == -1)
              this.index.users[value].push(i);
          }
          else
            this.index.users[value] = [i];
        }
        else // type == titleContains|postContains
        {
          // the index for titleContains/postContains maps groups to values
          var type = (prefs.userlists[i].type == 1 ? 'titleContains' : 'postContains');
          if (this.index[type][i])
            this.index[type][i].push(value);
          else
            this.index[type][i] = [value];
        }
      }

      for (var j = 0; j < included.length; j++)
        this.index.status[included[j]].push(i);
    }
  },

  // TODO: Consolidate the search functions? Lots of duplicated code

  searchPost: function(username, post, tc, status)
  {
    if (!this.index) return false;
    var index = this.index.postContains;

    post = post.toLowerCase();
    if (tc && status)
      status = [status, 'tc'];
    else if (tc)
      status = 'tc';

    var groups = [];
    for (var i in index)
    {
      for (var j = 0; j < index[i].length; j++)
      {
        if (post.indexOf(index[i][j]) != -1)
        {
          groups.push(i);
          break;
        }
      }
    }

    if (!groups[0])
    {
      // nothing in postContains index, return users index instead
      return this.searchUsername(username, tc, status);
    }

    // also get groups from username search
    var hlinfo = this.searchUsername(username, tc, status);
    if (hlinfo && hlinfo[4])
      groups = gamefox_utils.mergeArrayOfNumbersAsSortedSet(groups, hlinfo[4]);

    // first group decides everything
    var color = prefs.userlists[groups[0]].color;
    var messages = prefs.userlists[groups[0]].messages;
    var topics = prefs.userlists[groups[0]].topics;

    var groupNames = '';
    for (var i = 0; i < groups.length; i++)
      if (prefs.userlists[groups[i]].name.length)
        groupNames += prefs.userlists[groups[i]].name + ', ';

    return [groupNames.substr(0, groupNames.length - 2), color, messages,
           topics, groups];
  },

  searchTopic: function(username, topicId, title, status)
  {
    if (!this.index) return false;
    var index = this.index.titleContains;

    title = title.toLowerCase();

    var groups = [];
    for (var i in index)
    {
      for (var j = 0; j < index[i].length; j++)
      {
        if (title.indexOf(index[i][j]) != -1)
        {
          groups.push(i);
          break;
        }
      }
    }

    if (!groups[0])
    {
      // nothing in titleContains index, return users index instead
      return this.searchUsername(username, false, status);
    }

    // also get groups from username search
    var hlinfo = this.searchUsername(username, false, status);
    if (hlinfo && hlinfo[4])
      groups = gamefox_utils.mergeArrayOfNumbersAsSortedSet(groups, hlinfo[4]);

    // first group decides everything
    var color = prefs.userlists[groups[0]].color;
    var messages = prefs.userlists[groups[0]].messages;
    var topics = prefs.userlists[groups[0]].topics;

    var groupNames = '';
    for (var i = 0; i < groups.length; i++)
      if (prefs.userlists[groups[i]].name.length)
        groupNames += prefs.userlists[groups[i]].name + ', ';

    return [groupNames.substr(0, groupNames.length - 2), color, messages,
           topics, groups];
  },

  searchUsername: function(username, tc, status)
  {
    if (!this.index) return false;
    var index = this.index.users;

    username = username.trim().toLowerCase();
    if (!username.length) return false;

    if (!index[username] && !(tc && index['(tc)']))
      return this.searchStatus(status); // username isn't in any groups

    if (tc && index[username] && index['(tc)'])
      var groups = gamefox_utils.mergeArrayOfNumbersAsSortedSet(index[username], index['(tc)']);
    else if (tc && index['(tc)'])
      var groups = index['(tc)'];
    else
      var groups = index[username];

    if (status)
    {
      var statusGroups = this.searchStatus(status);
      if (statusGroups)
        groups = gamefox_utils.mergeArrayOfNumbersAsSortedSet(statusGroups[4],
            groups)
    }

    // first group decides everything
    var color = prefs.userlists[groups[0]].color;
    var messages = prefs.userlists[groups[0]].messages;
    var topics = prefs.userlists[groups[0]].topics;

    // list of all groups where the user is present
    var groupNames = '';
    for (var i = 0; i < groups.length; i++)
      if (prefs.userlists[groups[i]].name.length)
        groupNames += prefs.userlists[groups[i]].name + ', ';

    return [groupNames.substr(0, groupNames.length - 2), color, messages,
           topics, groups];
  },

  convertStatus: function(status)
  {
    status = status.trim();

    if (status == '(A)' || status == '(Admin)')
      return 'admins';
    if (status == '(M)' || status == '(Moderator)')
      return 'mods';
    if (status == '(V)' || status == '(VIP)')
      return 'vips';

    return status;
  },

  searchStatus: function(status)
  {
    if (!status || !this.index) return false;
    var index = this.index.status;

    var groups = [];

    // tc and tracked can be combined with any other status
    if (status instanceof Array)
      for (var i = 0; i < status.length; i++)
        groups = gamefox_utils.mergeArrayOfNumbersAsSortedSet(
            index[this.convertStatus(status[i])], groups);
    else
      groups = index[this.convertStatus(status)];

    if (!groups || !groups.length) return false;

    // first group decides everything
    var color = prefs.userlists[groups[0]].color;
    var messages = prefs.userlists[groups[0]].messages;
    var topics = prefs.userlists[groups[0]].topics;

    // list group names
    var groupNames = '';
    for (var i = 0; i < groups.length; i++)
      if (prefs.userlists[groups[i]].name.length)
        groupNames += prefs.userlists[groups[i]].name + ', ';
    
    return [groupNames.substr(0, groupNames.length - 2), color, messages,
           topics, groups];
  },

  showPost: function(event)
  {
    event.preventDefault();

    var button = event.target;
    var buttonContainer = button.offsetParent; // td
    var postMsg;

    // TODO: do we need to do this font-size stuff?
    if (gamefox_utils.getMsgDataDisplay()) // left of message
    {
      postMsg = buttonContainer.parentNode.cells[1];
      if (postMsg.style.fontSize == '0pt')
      {
        postMsg.style.removeProperty('font-size');
        postMsg.removeAttribute('style');
        buttonContainer.style.removeProperty('font-size');
        button.title = 'Hide';
        button.className = 'gamefox-hide-post-link';
        button.textContent = 'hide';
      }
      else
      {
        postMsg.style.setProperty('font-size', '0pt', 'important');
        postMsg.style.setProperty('display', 'none', 'important');
        button.title = 'Show';
        button.className = 'gamefox-show-post-link';
        button.textContent = 'show';
      }
    }
    else // above message
    {
      postMsg = buttonContainer.offsetParent.rows[buttonContainer.parentNode.rowIndex + 1].cells[0];
      if (postMsg.style.fontSize == '0pt')
      {
        postMsg.style.removeProperty('font-size');
        postMsg.style.removeProperty('display');
        postMsg.removeAttribute('style');
        button.title = 'Hide';
        button.className = 'gamefox-hide-post-link';
        button.textContent = 'hide';
      }
      else
      {
        postMsg.style.setProperty('font-size', '0pt', 'important');
        postMsg.style.setProperty('display', 'none', 'important');
        button.title = 'Show';
        button.className = 'gamefox-show-post-link';
        button.textContent = 'show';
      }
    }
  }
};
