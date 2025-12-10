let terminalBody;

/* ============================
   FILESYSTEM
============================ */
const filesystem = {
    "type": "directory",
    "children": {
        "about.html": {
            "type": "file"
        },
        "contact.html": {
            "type": "file"
        },
        "projects.html": {
            "type": "file"
        }
    }
};
/* ============================
   STATE
============================ */
let currentDirectory = filesystem;
let pathStack = [];

/* ============================
   UTILITIES
============================ */
function getPromptPath() {
  return "~" + (pathStack.length ? "/" + pathStack.join("/") : "");
}

function findNode(startDir, path) {
  if (!path || path === "~") return filesystem;

  const parts = path.split("/").filter(Boolean);
  let current = path.startsWith("/") || path.startsWith("~")
    ? filesystem
    : startDir;

  for (let part of parts) {
    if (part === "..") {
      if (pathStack.length) pathStack.pop();
      current = findNode(filesystem, pathStack.join("/")) || filesystem;
      continue;
    }

    if (!current.children || !current.children[part]) return null;
    current = current.children[part];
  }

  return current;
}

function resolvePath(path) {
  if (!path) return null;

  if (path.startsWith("~")) {
    return findNode(filesystem, path.replace("~", ""));
  }

  return findNode(currentDirectory, path);
}

/* ============================
   TYPEWRITER
============================ */
function typeWriter(text, outputElement, callback) {
  let i = 0;
  const speed = 2;

  function type() {
    if (i < text.length) {
      const char = text.charAt(i);
      if (char === "<") {
        const tagEnd = text.indexOf(">", i);
        if (tagEnd !== -1) {
          outputElement.innerHTML += text.substring(i, tagEnd + 1);
          i = tagEnd + 1;
          type();
          return;
        }
      }
      outputElement.innerHTML += char;
      terminalBody.scrollTop = terminalBody.scrollHeight;
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  type();
}

/* ============================
   INPUT LINE
============================ */
function createNewInputLine() {
  const newLine = document.createElement("div");
  newLine.classList.add("terminal-line");
  newLine.innerHTML = `<span class="prompt">${getPromptPath()}$</span> <span contenteditable="true" class="terminal-input"></span>`;
  terminalBody.appendChild(newLine);

  const newInput = newLine.querySelector(".terminal-input");
  newInput.focus();
  newInput.addEventListener("keydown", handleKeyDown);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function handleKeyDown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const currentInput = event.target;
    currentInput.contentEditable = false;
    currentInput.removeEventListener("keydown", handleKeyDown);

    const commandText = currentInput.textContent.trim();
    processCommand(commandText, () => {
      createNewInputLine();
    });
  }
}

/* ============================
   COMMAND PROCESSOR
============================ */
function processCommand(commandText, onComplete) {
  const commandParts = commandText.split(" ");
  const command = commandParts[0].toLowerCase();
  const argument = commandParts.slice(1).join(" ");

  if (!commandText) {
    if (onComplete) onComplete();
    return;
  }

  if (command === "clear") {
    terminalBody.innerHTML = "";
    if (onComplete) onComplete();
    return;
  }

  const outputLine = document.createElement("div");
  outputLine.classList.add("terminal-line");
  terminalBody.appendChild(outputLine);

  let outputText = "";
  let shouldHaveOutput = true;

  switch (command) {
    case "help":
      outputText =
        "help  - Displays this list of available commands.<br>" +
        "go    - Navigates to a page or URL.<br>" +
        "clear - Clears the terminal screen.<br>" +
        "ls    - Lists files and directories.<br>" +
        "sl    - i like trains<br>" +
        "cd    - Changes the current directory.";
      break;

    case "ls":
      if (currentDirectory.type === "directory") {
        const items = Object.keys(currentDirectory.children || {});
        outputText = items.join("  ");
      } else {
        outputText = "ls: not a directory";
      }
      break;
    
      case 'sl':
        const train = document.createElement('div');
        train.classList.add('train-container');
        
        // Set the train text
        train.textContent = 
            "      ====      ========\n"+
            "  ____||__  __  |      |\n"+
            " |  |  |  ||  | |      | \n"+
            "/--O-O-O-O-O-O-O-O-O-O-\\\\"
;
    
        // If light mode, set text color black
        if (document.body.classList.contains('light-mode')) {
            train.style.color = '#000';
        } else {
            train.style.color = '#fff';
        }
    
        // Append to terminal body
        terminalBody.appendChild(train);
    
        // Immediately call onComplete so terminal continues accepting input
        if (onComplete) onComplete();
    
        // Remove the train after animation duration
        setTimeout(() => {
            if (train.parentNode) train.parentNode.removeChild(train);
        }, 5000); // match the CSS animation
        return;
    

    case "cd":
      if (!argument || argument === "~") {
        currentDirectory = filesystem;
        pathStack = [];
        shouldHaveOutput = false;
        break;
      }

      if (argument === "..") {
        if (pathStack.length) pathStack.pop();
        currentDirectory =
          findNode(filesystem, pathStack.join("/")) || filesystem;
        shouldHaveOutput = false;
        break;
      }

      const target = resolvePath(argument);

      if (!target) {
        outputText = `cd: no such file or directory: ${argument}`;
        break;
      }

      if (target.type !== "directory") {
        outputText = `cd: not a directory: ${argument}`;
        break;
      }

      argument.split("/").forEach(p => {
        if (p && p !== ".") pathStack.push(p);
      });

      currentDirectory = target;
      shouldHaveOutput = false;
      break;

    case "go":
      if (!argument) {
        outputText = "go: missing destination";
        break;
      }

      const fileNode = resolvePath(argument);

      if (fileNode && fileNode.type === "file") {
        const urlPath =
          pathStack.length ? pathStack.join("/") + "/" + argument : argument;
        window.location.href = urlPath;
        return;
      }

      let url = argument;
      if (!url.startsWith("http")) url = "https://" + url;
      window.location.href = url;
      return;

    default:
      outputText = `command not found: ${commandText}`;
      break;
  }

  if (outputText && shouldHaveOutput) {
    typeWriter(outputText, outputLine, onComplete);
  } else {
    terminalBody.removeChild(outputLine);
    if (onComplete) onComplete();
  }
}

/* ============================
   BOOT
============================ */
document.addEventListener("DOMContentLoaded", () => {
  terminalBody = document.getElementById("terminal-body");

  if (!terminalBody) {
    console.error("Terminal error: #terminal-body not found.");
    return;
  }

  createNewInputLine();
});

class WaTooltip extends HTMLElement {
  constructor() {
    super();
    this._tooltip = null;
    this._target = null;
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  connectedCallback() {
    if (this.hasAttribute('for')) {
      this._target = document.getElementById(this.getAttribute('for'));
      if (this._target) {
        this._target.addEventListener('mouseenter', this.show);
        this._target.addEventListener('mouseleave', this.hide);
        this.style.display = 'none'; // Hide the wa-tooltip element itself
      }
    }
  }

  disconnectedCallback() {
    if (this._target) {
      this._target.removeEventListener('mouseenter', this.show);
      this._target.removeEventListener('mouseleave', this.hide);
    }
    if (this._tooltip && this._tooltip.parentNode) {
      this._tooltip.parentNode.removeChild(this._tooltip);
    }
  }

  show() {
    if (!this._tooltip) {
      this._tooltip = document.createElement('div');
      this._tooltip.className = 'wa-tooltip-popup';
      this._tooltip.innerHTML = this.innerHTML;
      document.body.appendChild(this._tooltip);
    }

    const targetRect = this._target.getBoundingClientRect();
    const tooltipRect = this._tooltip.getBoundingClientRect();

    let top = targetRect.top - tooltipRect.height - 10;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

    if (top < 0) {
        top = targetRect.bottom + 10;
    }
    if (left < 0) {
        left = 5;
    }

    this._tooltip.style.top = `${top + window.scrollY}px`;
    this._tooltip.style.left = `${left + window.scrollX}px`;
    this._tooltip.style.display = 'block';
  }

  hide() {
    if (this._tooltip) {
      this._tooltip.style.display = 'none';
    }
  }
}

customElements.define('wa-tooltip', WaTooltip);
