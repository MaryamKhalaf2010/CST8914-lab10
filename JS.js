/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *   Desc:menu button that opens a menu of actions. 
 */
'use strict';

class MenuButtonActions {
  constructor(domNode, performMenuAction) {
    this.domNode = domNode;
    this.performMenuAction = performMenuAction;
    this.buttonNode = domNode.querySelector('button');
    this.menuNode = domNode.querySelector('[role="menu"]');
    this.menuitemNodes = [];
    this.firstMenuitem = false;
    this.lastMenuitem = false;

    // Add event listeners for button interactions
    this.buttonNode.addEventListener('keydown', this.onButtonKeydown.bind(this));
    this.buttonNode.addEventListener('click', this.onButtonClick.bind(this));

    // Query and iterate over menu items
    const nodes = domNode.querySelectorAll('[role="menuitem"]');
    for (let i = 0; i < nodes.length; i++) {
      let menuitem = nodes[i];
      this.menuitemNodes.push(menuitem);
      menuitem.tabIndex = -1;
      if (!this.firstMenuitem) {
        this.firstMenuitem = menuitem;
      }
      this.lastMenuitem = menuitem;

      menuitem.addEventListener('keydown', this.onMenuitemKeydown.bind(this));
      menuitem.addEventListener('click', this.onMenuitemClick.bind(this));
      menuitem.addEventListener('mouseover', this.onMenuitemMouseover.bind(this));
    }

    // Add mousedown event listener on window to handle clicks outside the menu
    window.addEventListener('mousedown', this.onBackgroundMousedown.bind(this), true);
  }

  setFocusToMenuitem(newMenuitem) {
    this.menuitemNodes.forEach(item => item.tabIndex = -1);  // Reset all items tabindex
    newMenuitem.tabIndex = 0;  // Set tabindex for focused item
    newMenuitem.focus(); // Apply focus to the element
  }

  setFocusToFirstMenuitem() {
    this.setFocusToMenuitem(this.firstMenuitem);
  }

  setFocusToLastMenuitem() {
    this.setFocusToMenuitem(this.lastMenuitem);
  }

  setFocusToPreviousMenuitem(currentMenuitem) {
    let newMenuitem;
    if (currentMenuitem === this.firstMenuitem) {
      newMenuitem = this.lastMenuitem;
    } else {
      const index = this.menuitemNodes.indexOf(currentMenuitem);
      newMenuitem = this.menuitemNodes[index - 1];
    }
    this.setFocusToMenuitem(newMenuitem);
    return newMenuitem;
  }

  setFocusToNextMenuitem(currentMenuitem) {
    let newMenuitem;
    if (currentMenuitem === this.lastMenuitem) {
      newMenuitem = this.firstMenuitem;
    } else {
      const index = this.menuitemNodes.indexOf(currentMenuitem);
      newMenuitem = this.menuitemNodes[index + 1];
    }
    this.setFocusToMenuitem(newMenuitem);
    return newMenuitem;
  }

  // Popup menu methods
  openPopup() {
    this.menuNode.style.display = 'block';
    this.buttonNode.setAttribute('aria-expanded', 'true');
  }

  closePopup() {
    if (this.isOpen()) {
      this.buttonNode.removeAttribute('aria-expanded');
      this.menuNode.style.display = 'none';
    }
  }

  isOpen() {
    return this.buttonNode.getAttribute('aria-expanded') === 'true';
  }

  // Menu event handlers
  onButtonKeydown(event) {
    const key = event.key;
    let flag = false;

    switch (key) {
      case ' ':
      case 'Enter':
      case 'ArrowDown':
        this.openPopup();
        this.setFocusToFirstMenuitem();
        flag = true;
        break;

      case 'Esc':
      case 'Escape':
        this.closePopup();
        flag = true;
        break;

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

  onMenuitemKeydown(event) {
    const tgt = event.currentTarget;
    const key = event.key;
    let flag = false;

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

      case 'ArrowUp':
        this.setFocusToPreviousMenuitem(tgt);
        flag = true;
        break;

      case 'ArrowDown':
        this.setFocusToNextMenuitem(tgt);
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

  onMenuitemClick(event) {
    const tgt = event.currentTarget;
    this.closePopup();
    this.buttonNode.focus();
    this.performMenuAction(tgt);
  }

  onMenuitemMouseover(event) {
    const tgt = event.currentTarget;
    this.setFocusToMenuitem(tgt);
  }

  onBackgroundMousedown(event) {
    if (this.isOpen() && !this.domNode.contains(event.target)) {
      this.closePopup();
      this.buttonNode.focus();
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const menuButtonNode = document.querySelector('.menu-button-actions');
  new MenuButtonActions(menuButtonNode, function (menuItem) {
    const textNode = menuItem.textContent;
    document.getElementById('action_output').value = textNode;
  });
});
