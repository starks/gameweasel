/* vim: set et sw=2 ts=2 sts=2 tw=79:
 *
 * Copyright 2008, 2010 Brian Marshall, Michael Ryan, Andrianto Effendy
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

var gamefox_messages =
{
  updateDelay: 100,

  delayedUpdateMessageCount: function(event)
  {
    if (this.timeoutId)
      clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(gamefox_messages.updateMessageCount,
        gamefox_messages.updateDelay, event);
  },

  updateMessageCount: function()
  {
    var messageCount = document.getElementById('gamefox-message-count');

    if (!messageCount)
      return;

    var messageLength = gamefox_utils.encodedMessageLength(
        document.getElementsByName('messagetext')[0].value);

    messageCount.textContent = messageLength + ' / 4096 characters';

    if (messageLength > 4096)
    {
      messageCount.textContent += '(!!)';
      messageCount.style.setProperty('font-weight', 'bold', '');
    }
    else
      messageCount.style.setProperty('font-weight', '', '');
  },

  delayedUpdateTitleCount: function(event)
  {
    if (this.timeoutId)
      clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(gamefox_messages.updateTitleCount,
        gamefox_messages.updateDelay, event);
  },

  updateTitleCount: function()
  {
    var titleLength = gamefox_utils.encodedTitleLength(
        document.getElementsByName('topictitle')[0].value);

    var titleCount = document.getElementById('gamefox-title-count');
    titleCount.textContent = titleLength + ' / 80 characters';

    if (titleLength > 80)
    {
      titleCount.textContent += '(!!)';
      titleCount.style.setProperty('font-weight', 'bold', '');
    }
    else
      titleCount.style.setProperty('font-weight', '', '');
  },

  deletePost: function(event)
  {
    event.preventDefault();

    var msgComponents = gamefox_utils.getMsgComponents(this);
    var deleteType = msgComponents.header.getAttribute('gfdeletetype');

    var closeTopic = deleteType == 'close';
    var deletePost = deleteType == 'deletepost';
    var deleteTopic = deleteType == 'deletetopic';

    if (deleteTopic)
      var str = 'Delete this topic?';
    else if (closeTopic)
      var str = 'Close this topic?';
    else if (deletePost)
      var str = 'Delete this post?';
    else
      return;

    if (!confirm(str)) return false;

    var uri = msgComponents.header.getElementsByTagName('a')[2].href;

    var get = new XMLHttpRequest();
    get.open('GET', uri);
    get.onreadystatechange = function()
    {
      if (get.readyState == 4)
      {
        if (get.responseText.indexOf('>Delete this Message</h2>') == -1 &&
            get.responseText.indexOf('>Close this Topic</h2>') == -1)
        {
          alert('No action is available.');
          return false;
        }

        var post = new XMLHttpRequest();
        post.open('POST', uri + '?action=' + (closeTopic ? 'closetopic' : 'delete'));
        post.onreadystatechange = function()
        {
          if (post.readyState == 4)
          {
            if (post.responseText.indexOf('<title>401 Error') != -1)
              alert('Can\'t delete this message.');
            else if (deleteTopic)
              document.location = gamefox_utils.newURI(
                  gamefox_utils.parseBoardLink(document.location.pathname)['board'],
                  null, null, null, null, document.location.pathname);
            else
            {
              if (!closeTopic)
                document.location.hash = '#' + msgComponents.header.id;
              document.location.reload();
            }
          }
        }
        post.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        post.send('key=' + get.responseText.match(/<input\b[^>]+?\bname="key"[^>]+?\bvalue="([^"]*)"[^>]*>/)[1] +
            '&YES=1');
      }
    }

    get.send(null);
  },

  editPost: function(event) {
    event.preventDefault();

    var msgid = this.parentNode.previousSibling.href;
    msgid = msgid.substr(msgid.lastIndexOf('/') + 1);

    var qpForm = document.getElementById('gamefox-quickpost-form');
    var qpMsg = document.getElementById('gamefox-message');
    var postBtn = document.getElementById('gamefox-quickpost-btn');

    if (!qpForm || !qpMsg || !postBtn)
      document.location.href =
        gamefox_utils.domain + gamefox_utils.path
        + 'post.php?board=' + gamefox_utils.getBoardId(document.location.pathname)
        + '&topic=' + gamefox_utils.getTopicId(document.location.pathname)
        + '&message=' + msgid;

    if (qpForm.action.indexOf('message') != -1)
    {
      var oldmsgid = qpForm.action.substr(qpForm.action.lastIndexOf('=') + 1);
      qpForm.removeChild(postBtn.previousSibling);
      qpForm.action = qpForm.action.substr(0, qpForm.action.indexOf('&message'));

      if (msgid == oldmsgid)
      {
        qpMsg.value = '';

        if (prefs['signature.applyeverywhere'])
          qpForm.insertBefore(gamefox_quickpost.createSigBox(), postBtn);

        if (prefs['elements.charcounts'])
          gamefox_messages.updateMessageCount();

        return;
      }
    }
    else if (qpMsg.value.length && !confirm('Discard partially entered QuickPost message?'))
      return;
    else if (prefs['signature.applyeverywhere'])
      qpForm.removeChild(document.getElementById('gamefox-quickpost-signature'));

    var msgComponents = gamefox_utils.getMsgComponents(this);

    var editSpan = document.createElement('span');
    editSpan.className = 'gamefox-quickpost-edit';
    editSpan.textContent = '[Editing #' + msgComponents.header.id.substr(1,3) + '] ';
    qpForm.insertBefore(editSpan, postBtn);

    qpForm.action += '&message=' + msgid;
    qpMsg.value = gamefox_utils.specialCharsDecode(
      msgComponents.body.innerHTML.
        replace(/<br\s*\/?>/gi, '\n').
        replace(/<img\b[^<>]+\bsrc="([^"]*)"[^<>]*>/gi, '$1').
        replace(/<\/?(img|a|font|span|div|table|tbody|th|tr|td|wbr|u|embed)\b[^<>]*\/?>/gi, '')
    );
    qpMsg.focus();

    if (prefs['elements.charcounts'])
      gamefox_messages.updateMessageCount();
  }
};
