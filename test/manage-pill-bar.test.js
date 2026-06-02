const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class TestElement {
    constructor(tagName) {
        this.tagName = tagName.toLowerCase();
        this.children = [];
        this.parentNode = null;
        this.id = '';
        this.dataset = {};
        this.style = {};
    }

    get parentElement() {
        return this.parentNode;
    }

    get firstChild() {
        return this.children[0] || null;
    }

    get nextSibling() {
        if (!this.parentNode) return null;

        const siblings = this.parentNode.children;
        const index = siblings.indexOf(this);

        return siblings[index + 1] || null;
    }

    querySelector(tagName) {
        if (this.tagName === tagName) return this;

        for (const child of this.children) {
            const match = child.querySelector(tagName);
            if (match) return match;
        }

        return null;
    }

    appendChild(child) {
        if (child.parentNode) {
            child.parentNode.removeChild(child);
        }

        child.parentNode = this;
        this.children.push(child);

        return child;
    }

    insertBefore(child, nextSibling) {
        if (child.parentNode) {
            child.parentNode.removeChild(child);
        }

        child.parentNode = this;

        if (!nextSibling) {
            this.children.push(child);
            return child;
        }

        const index = this.children.indexOf(nextSibling);

        this.children.splice(index === -1 ? this.children.length : index, 0, child);

        return child;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);

        if (index !== -1) {
            this.children.splice(index, 1);
            child.parentNode = null;
        }

        return child;
    }

    contains(element) {
        if (!element) return false;
        if (element === this) return true;

        return this.children.some((child) => child.contains(element));
    }

    addEventListener() {}
}

class TestDocument {
    constructor() {
        this.body = new TestElement('body');
    }

    createElement(tagName) {
        return new TestElement(tagName);
    }

    getElementById(id) {
        return this.find(this.body, (element) => element.id === id);
    }

    querySelectorAll(tagName) {
        const matches = [];

        this.walk(this.body, (element) => {
            if (element.tagName === tagName) matches.push(element);
        });

        return matches;
    }

    find(element, predicate) {
        if (predicate(element)) return element;

        for (const child of element.children) {
            const match = this.find(child, predicate);
            if (match) return match;
        }

        return null;
    }

    walk(element, visitor) {
        visitor(element);

        for (const child of element.children) {
            this.walk(child, visitor);
        }
    }
}

function loadManagePillBar(document, window) {
    const source = fs.readFileSync(path.join(__dirname, '../src/content.js'), 'utf8');
    const context = {
        document,
        window,
        setInterval() {},
    };

    vm.createContext(context);
    vm.runInContext(source, context);

    return context.managePillBar;
}

const document = new TestDocument();
const window = { innerWidth: 500 };
const managePillBar = loadManagePillBar(document, window);

const originalParent = document.createElement('div');
const renderer = document.createElement('ytmusic-like-button-renderer');
const originalNextSibling = document.createElement('span');

document.body.appendChild(originalParent);
originalParent.appendChild(renderer);
originalParent.appendChild(originalNextSibling);

managePillBar();

const pillContainer = document.getElementById('ytm-pill-container');

assert.equal(renderer.parentNode, pillContainer, 'renderer should move into pill on small viewport');
assert.equal(pillContainer.style.display, 'flex');

window.innerWidth = 700;
managePillBar();

assert.equal(renderer.parentNode, originalParent, 'renderer should restore to its original parent on large viewport');
assert.deepEqual(originalParent.children, [renderer, originalNextSibling], 'renderer should restore before original next sibling');
assert.equal(pillContainer.style.display, 'none');

window.innerWidth = 500;
managePillBar();

assert.equal(renderer.parentNode, pillContainer, 'renderer should move back into pill after repeated resize');
assert.equal(pillContainer.children.length, 1, 'pill should not duplicate renderer after repeated resize');
