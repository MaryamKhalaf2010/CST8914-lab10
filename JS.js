/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *   Desc:menu button that opens a menu of actions. 
 */
/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *   Desc: menu button that opens a menu of actions.
 */

'use strict';

// Define a class MenuButtonActions
class MenuButtonActions {
  constructor(domNode, performMenuAction) {
    this.domNode = domNode;
    this.performMenuAction = performMenuAction;
    this.buttonNode = domNode.querySelector('button');
    this.menuNode = domNode.querySelector('[role="menu"]');
    this.menuitemNodes = [];
    this.firstMenuitem = null;
    this.lastMenuitem = null;
    this.firstChars = [];

    // Add event listeners for button interactions
    this.buttonNode.addEventListener(
      'keydown',
      this.onButtonKeydown.bind(this)
    );
    this.buttonNode.addEventListener('click', this.onButtonClick.bind(this));

    // Query and iterate over menu items, setting up event listeners
    var nodes = domNode.querySelectorAll('[role="menuitem"]');

    for (var i = 0; i < nodes.length; i++) {
      var menuitem = nodes[i];
      this.menuitemNodes.push(menuitem);
      menuitem.tabIndex = -1; // All menu items are initially not focusable
      this.firstChars.push(menuitem.textContent.trim()[0].toLowerCase());

      menuitem.addEventListener('keydown', this.onMenuitemKeydown.bind(this));
      menuitem.addEventListener('click', this.onMenuitemClick.bind(this));
      menuitem.addEventListener('mouseover', this.onMenuitemMouseover.bind(this));

      if (!this.firstMenuitem) {
        this.firstMenuitem = menuitem;
      }
      this.lastMenuitem = menuitem;
    }

    // Add focus in and focus out event listeners for handling focus styles
    domNode.addEventListener('focusin', this.onFocusin.bind(this));
    domNode.addEventListener('focusout', this.onFocusout.bind(this));

    // Add mousedown event listener on window to handle clicks outside the menu
    window.addEventListener(
      'mousedown',
      this.onBackgroundMousedown.bind(this),
      true
    );
  }

 
  setFocusToMenuitem(newMenuitem) {
  
    this.menuitemNodes.forEach(function (item) {
     
      item.tabIndex = -1;
      item.removeAttribute('aria-current');
    });

    newMenuitem.tabIndex = 0;
    newMenuitem.focus();
   
    newMenuitem.setAttribute('aria-current', 'true');
  }

  setFocusToFirstMenuitem() {
    this.setFocusToMenuitem(this.firstMenuitem);
  }

  setFocusToLastMenuitem() {
    this.setFocusToMenuitem(this.lastMenuitem);
  }

  setFocusToPreviousMenuitem(currentMenuitem) {
    var newMenuitem, index;

    if (currentMenuitem === this.firstMenuitem) {
      newMenuitem = this.lastMenuitem;
    } else {
      index = this.menuitemNodes.indexOf(currentMenuitem);
      newMenuitem = this.menuitemNodes[index - 1];
    }

    this.setFocusToMenuitem(newMenuitem);
  }

  setFocusToNextMenuitem(currentMenuitem) {
    var newMenuitem, index;

    if (currentMenuitem === this.lastMenuitem) {
      newMenuitem = this.firstMenuitem;
    } else {
      index = this.menuitemNodes.indexOf(currentMenuitem);
      newMenuitem = this.menuitemNodes[index + 1];
    }
    this.setFocusToMenuitem(newMenuitem);
  }

  setFocusByFirstCharacter(currentMenuitem, char) {
    var start, index;

    if (char.length > 1) {
      return;
    }

    char = char.toLowerCase();

    // Get start index for search based on position of currentItem
    start = this.menuitemNodes.indexOf(currentMenuitem) + 1;
    if (start >= this.menuitemNodes.length) {
      start = 0;
    }

    // Check remaining slots in the menu
    index = this.firstChars.indexOf(char, start);

    // If not found in remaining slots, check from beginning
    if (index === -1) {
      index = this.firstChars.indexOf(char, 0);
    }

    // If match was found...
    if (index > -1) {
      this.setFocusToMenuitem(this.menuitemNodes[index]);
    }
  }

  // Utilities

  getIndexFirstChars(startIndex, char) {
    for (var i = startIndex; i < this.firstChars.length; i++) {
      if (char === this.firstChars[i]) {
        return i;
      }
    }
    return -1;
  }

  // Popup menu methods

  openPopup() {
    this.menuNode.style.display = 'block';
    this.buttonNode.setAttribute('aria-expanded', 'true');
    // When the menu is opened, set focus to the first menu item
    this.setFocusToFirstMenuitem();
  }

  closePopup() {
    if (this.isOpen()) {
      this.buttonNode.removeAttribute('aria-expanded');
      this.menuNode.style.display = 'none';
      // When the menu is closed, reset all menu items' tabindex to -1
      this.menuitemNodes.forEach(function (item) {
        item.tabIndex = -1;
        item.removeAttribute('aria-current');
      });
    }
  }

  isOpen() {
    return this.buttonNode.getAttribute('aria-expanded') === 'true';
  }

  // Menu event handlers

  onFocusin() {
    this.domNode.classList.add('focus');
  }

  onFocusout() {
    this.domNode.classList.remove('focus');
  }

  // This method is triggered when a keydown event occurs on the menu button.
  onButtonKeydown(event) {
    var key = event.key,
      flag = false;

    switch (key) {
      case ' ':
      case 'Enter':
      case 'ArrowDown':
      case 'Down':
        this.openPopup();
        this.setFocusToFirstMenuitem();
        flag = true;
        break;

      case 'Esc':
      case 'Escape':
        this.closePopup();
        flag = true;
        break;

      case 'Up':
      case 'ArrowUp':
        this.openPopup();
        this.setFocusToLastMenuitem();
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onButtonClick(event) {
    if (this.isOpen()) {
      this.closePopup();
      this.buttonNode.focus();
    } else {
      this.openPopup();
      this.setFocusToFirstMenuitem();
    }

    event.stopPropagation();
    event.preventDefault();
  }

  // This method is triggered when a keydown event occurs on a menu item.
  onMenuitemKeydown(event) {
    var tgt = event.currentTarget,
      key = event.key,
      flag = false;

    function isPrintableCharacter(str) {
      return str.length === 1 && str.match(/\S/);
    }

    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    if (event.shiftKey) {
      if (isPrintableCharacter(key)) {
        this.setFocusByFirstCharacter(tgt, key);
        flag = true;
      }

      if (event.key === 'Tab') {
        this.buttonNode.focus();
        this.closePopup();
        flag = true;
      }
    } else {
      switch (key) {
        case ' ':
        case 'Enter':
          this.closePopup();
          this.performMenuAction(tgt);
          this.buttonNode.focus();
          flag = true;
          break;

        case 'Esc':
        case 'Escape':
          this.closePopup();
          this.buttonNode.focus();
          flag = true;
          break;

        case 'Up':
        case 'ArrowUp':
          // Move focus to previous menu item
          this.setFocusToPreviousMenuitem(tgt);
          flag = true;
          break;

        case 'ArrowDown':
        case 'Down':
          // Move focus to next menu item
          this.setFocusToNextMenuitem(tgt);
          flag = true;
          break;

        case 'Home':
        case 'PageUp':
          this.setFocusToFirstMenuitem();
          flag = true;
          break;

        case 'End':
        case 'PageDown':
          this.setFocusToLastMenuitem();
          flag = true;
          break;

        case 'Tab':
          this.closePopup();
          break;

        default:
          if (isPrintableCharacter(key)) {
            this.setFocusByFirstCharacter(tgt, key);
            flag = true;
          }
          break;
      }
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onMenuitemClick(event) {
    var tgt = event.currentTarget;
    this.closePopup();
    this.buttonNode.focus();
    this.performMenuAction(tgt);
  }

  onMenuitemMouseover(event) {
    var tgt = event.currentTarget;
    // Set focus to the menu item being hovered over
    this.setFocusToMenuitem(tgt);
  }

  onBackgroundMousedown(event) {
    if (!this.domNode.contains(event.target)) {
      if (this.isOpen()) {
        this.closePopup();
        this.buttonNode.focus();
      }
    }
  }
}

// Initialize menu buttons
window.addEventListener('load', function () {
  document.getElementById('action_output').value = 'none';

  function performMenuAction(node) {
    document.getElementById('action_output').value = node.textContent.trim();
  }

  var menuButtons = document.querySelectorAll('.menu-button-actions');
  for (var i = 0; i < menuButtons.length; i++) {
    new MenuButtonActions(menuButtons[i], performMenuAction);
  }
});
