// Class names
var emItem = "eMALItem";
var selClass = "emSelected";

// Whether we're on the manga list or not
var isManga = window.location.href.split("/")[3] === "mangalist";

// Stores the last object the user clicked on
var lastSelected = null;
// Stores the csrf token
var csrf = null;

function getSelected() {
  return document.getElementsByClassName(selClass);
}

// Removes a value from the selected array
function removeFromSelected(div) {
  div.classList.remove(selClass);
  if (getSelected().length == 0)
    document.getElementById("eMalButtons").classList.remove("emActive");
}

// Clears all selected items
function clearSelected() {
  var selected = getSelected();
  while (selected.length > 0) removeFromSelected(selected[0]);
  document.getElementById("eMalButtons").classList.remove("emActive");
}

// Adds a value to the selected array
function addToSelected(div) {
  div.classList.add(selClass);
  document.getElementById("eMalButtons").classList.add("emActive");
}

// selectUpTo adds every element from the last element clicked to the parameter
// ctrl boolean, when true, makes it so shift REMOVES all the elements rather than adding them
function selectUpTo(div, ctrl) {
  var divs = document.getElementsByClassName(emItem);
  var idxLast = -1;
  var idxNew = -1;
  for (var i = 0; i < divs.length; i++) {
    if (divs[i] == lastSelected) idxLast = i;
    if (divs[i] == div) idxNew = i;
    if (idxLast != -1 && idxNew != -1) break;
  }
  if (idxLast == -1 || idxNew == -1) {
    console.error("Something went wrong with shift-click!");
    return;
  }
  // We're gonna iterate from new to last. If they're in the wrong order, switch their values.
  if (idxNew < idxLast) {
    var temp = idxNew;
    idxNew = idxLast;
    idxLast = temp;
  }
  while (idxLast <= idxNew) {
    if (!ctrl) addToSelected(divs[idxLast]);
    else removeFromSelected(divs[idxLast]);
    idxLast++;
  }
}

// Click handler
function handleClick(ev) {
  // Remove text highlight browser dumbness
  if (document.selection) document.selection.empty();
  else if (window.getSelection) window.getSelection().removeAllRanges();

  var ctrl = ev.ctrlKey;
  var shift = ev.shiftKey;

  // Events trigger on the child and don't go up, annoyingly enough. Need to manually browse up to the desired parent.
  var div = ev.target;
  while (!div.classList.contains("list-item")) {
    div = div.parentNode;
    // Somehow fucked up, leave
    if (div == document.Body) {
      console.log("Zeb");
      return;
    }
  }
  // div now contains the right value
  if (shift && getSelected().length > 0 && lastSelected != null) {
    // User pressed shift, and we have a previous point from which to select
    selectUpTo(div, ctrl);
  } else if (!ctrl) {
    // No control, no shift: clear everything and select only this element
    // Special case, if the element the user clicked on is the only one set, then don't re-add it, instead understand it as 'clear'
    var shouldSelect = !(
      div.classList.contains(selClass) && getSelected().length == 1
    );
    clearSelected();
    if (shouldSelect) addToSelected(div);
  } else {
    // Ctrl click
    if (div.classList.contains(selClass)) removeFromSelected(div);
    else addToSelected(div);
  }
  lastSelected = div;
}

function setOnClickListeners() {
  var divs = document.querySelectorAll(".list-item:not(." + emItem + ")");
  for (var i = 0; i < divs.length; i++) {
    divs[i].classList.add(emItem);
    divs[i].addEventListener("click", handleClick, false);
  }
}

function getId(div) {
  var img = div.firstChild.childNodes[4].firstChild;
  return img.href.split("/")[4];
}

// AJAX request to MAL to delete an anime (or a manga)
function deleteElement(animu) {
  var id = getId(animu);
  // Put in the csrf token
  var payload = "csrf_token=" + csrf;
  console.log(payload);
  var request = new window.wrappedJSObject.XMLHttpRequest();
  request.withCredentials = true;
  const type = isManga ? "manga" : "anime";
  reqUrl = `https://myanimelist.net/ownlist/${type}/${id}/delete?hideLayout=1`;
  request.open("POST", reqUrl, true);

  request.onload = function(e) {
    // This doesn't trigger on firefox for some reason, so we can't do anything here.
    if (request.status >= 200 && request.status < 400) {
      // Success!
    } else {
      // We reached our target server, but it returned an error
      console.error("Server returned an error");
      console.error(request);
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    console.error("Connection error");
    console.error(request);
  };

  // Necessary for the server to respond
  request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  request.send(payload);
}

function removeAll() {
  var selected = getSelected();
  // For now, remove the first anime in the list
  if (selected.length < 1) return;
  for (var i = 0; i < selected.length; i++) {
    var animu = selected[i];
    deleteElement(animu);
    animu.style.display = "none";
  }
}

function createButtons() {
  var bar = document.getElementsByClassName("list-status-title")[0];

  var container = document.createElement("div");
  container.id = "eMalButtons";

  bar.appendChild(container);

  var remove = document.createElement("a");
  var linkText = document.createTextNode("Remove");
  remove.appendChild(linkText);
  remove.classList.add("emButton");
  remove.title = "Remove";
  remove.href = "#";
  remove.addEventListener("click", removeAll, false);

  container.append(remove);
}

// We need to get the CSRF token from the site so it doesn't panic when we pretend we are the website.
function getCSRF() {
  var metas = document.getElementsByTagName("meta");
  for (var i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute("name") == "csrf_token") {
      return metas[i].getAttribute("content");
    }
  }
}

// This value is '1' when looking at your own profile:
if (document.body.dataset.owner != "") {
  csrf = getCSRF();
  // Every so often, check for new list elements and add them.
  setInterval(setOnClickListeners, 1000);
  createButtons();
}
