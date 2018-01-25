var divs = document.getElementsByClassName('list-item');

var selClass = "emSelected";
var lastSelected = null;

function getSelected()
{
    return document.getElementsByClassName(selClass);
}

// Removes a value from the selected array
function removeFromSelected(div)
{
    div.classList.remove(selClass);
}

// Clears all selected items
function clearSelected()
{
    var selected = getSelected();
    while (selected.length > 0)
        removeFromSelected(selected[0]);
}

// Adds a value to the selected array
function addToSelected(div)
{
    div.classList.add(selClass);
}

// selectUpTo adds every element from the last element clicked to the parameter
// ctrl boolean, when true, makes it so shift REMOVES all the elements rather than adding them
function selectUpTo(div, ctrl)
{
    var idxLast = -1;
    var idxNew  = -1;
    for (var i=0 ; i < divs.length ; i++)
    {
        if (divs[i] == lastSelected)
            idxLast = i;
        if (divs[i] == div)
            idxNew = i;
        if (idxLast != -1 && idxNew != -1)
            break;
    }
    if (idxLast == -1 || idxNew == -1)
    {
        console.error("Something went wrong with shift-click!");
        return ;
    }
    // We're gonna iterate from new to last. If they're in the wrong order, switch their values.
    if (idxNew < idxLast)
    {
        var temp = idxNew;
        idxNew = idxLast;
        idxLast = temp;
    }
    while (idxLast <= idxNew)
    {
        if (!ctrl)
            addToSelected(divs[idxLast]);
        else
            removeFromSelected(divs[idxLast]);
        idxLast++;
    }
}

// Click handler
function handleClick(ev)
{
    var ctrl = ev.ctrlKey;
    var shift = ev.shiftKey;

    // Events trigger on the child and don't go up, annoyingly enough. Need to manually browse through it.
    var div = ev.target;
    while (!div.classList.contains("list-item"))
    {
        div = div.parentNode;
        // Somehow fucked up, leave
        if (div == document.Body)
        {
            console.log("Zeb");
            return ;
        }
    }
    // div now contains the right value
    if (shift &&
        getSelected().length > 0 &&
        lastSelected != null)
    {
        selectUpTo(div, ctrl);
    }
    // No control, no shift, always clear everything and seleect only this element
    else if (!ctrl)
    {
        clearSelected();
        addToSelected(div);
    }
    else
    {
        // Ctrl click
        if (div.classList.contains(selClass))
            removeFromSelected(div);
        else
            addToSelected(div);
    }

    // Remove text highlight browser dumbness
    if (document.selection)
        document.selection.empty();
    else if (window.getSelection)
        window.getSelection().removeAllRanges();

    lastSelected = div;
}

function setOnClickListeners()
{
    for (var i=0 ; i < divs.length ; i++)
    {
        divs[i].onclick = handleClick;
    }
}

// This value is '1' when looking at your own profile:
if (document.body.dataset.owner != "")
{
    setOnClickListeners();
}
