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
 *
 * This TTI implementation is inspired by, but not based on or affiliated
 * with, the Firefox extension Text-to-Image by Starks, RockMFR, and Toad King.
 */

var tti =
{
  converted: 0,

  resize: function (img, x, y)
  {
    if (x != '0')
      img.style.maxWidth = x + 'px';
    else
      img.style.maxWidth = 'none';

    if (y != '0')
      img.style.maxHeight = y + 'px';
    else
      img.style.maxHeight = 'none';
  },

  over: function()
  {
    tti.resize(this, prefs['elements.tti.hoverx'], prefs['elements.tti.hovery']);
  },

  out: function()
  {
    tti.resize(this, prefs['elements.tti.x'], prefs['elements.tti.y']);
  },

  process: function(target)
  {
    var node, iterator = document.createNodeIterator(target, NodeFilter.SHOW_TEXT, function(testNode) {
      if (testNode.data.length >= 16 || (prefs['elements.tti.nosigs'] && testNode.data == '---'))
        return NodeFilter.FILTER_ACCEPT;
      else
        return NodeFilter.FILTER_REJECT;
    }, false);

    var pattern = /(?:https?|ftp):\/\/[a-z0-9\.\/%~_-]+\.(?:jpe?g|png|gif|bmp|dib|jpe|jfif)(?![a-z0-9\.\/_-])/i;
    while (node = iterator.nextNode())
    {
      if (tti.converted == prefs['elements.tti.max'] || node.data.length == 3) // Signature separator
        break;

      var match = node.data.match(pattern);
      if (match)
      {
        var index = node.data.indexOf(match[0]);
        node.deleteData(index, match[0].length);

        var img = document.createElement('img');
        img.src = match[0];
        img.alt = match[0];
        img.title = match[0];
        img.className = 'gamefox-tti';

        tti.resize(img, prefs['elements.tti.x'], prefs['elements.tti.y']);

        img.onmouseover = tti.over;
        img.onmouseout = tti.out;

        img.onclick = function(event) {
          event.preventDefault();

          if (this.onmouseover && this.onmouseout)
          {
            tti.resize(this, '0', '0');
            this.onmouseover = null;
            this.onmouseout = null;
          }
          else
          {
            tti.resize(this, prefs['elements.tti.x'], prefs['elements.tti.y']);
            this.onmouseover = tti.over;
            this.onmouseout = tti.out;
          }
        };

        img.ondblclick = function() {
          document.location.href = this.src;
        };

        img.onerror = function() {
          this.parentNode.replaceChild(document.createTextNode(this.src), this);
        };

        node.parentNode.insertBefore(img, node.splitText(index));
        tti.converted ++;
      }
    }
  }
};
