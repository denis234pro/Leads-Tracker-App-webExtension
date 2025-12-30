//===========================INITIALIZATION============================
const themeBtn = document.getElementById("themeBtn");
const savedTheme = localStorage.getItem("dark-mode");

if (savedTheme === "enabled") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "Light ☀️";
    themeBtn.style.color = "white";
}

// ====================================================================
//                        GLOBAL STATE & ELEMENTS
// ====================================================================
// Application data state. This array holds all leads.
const ulEl = document.getElementById('ul-el');
let myLeads = [];
const inputEl = document.getElementById('input-el');
const saveButton = document.getElementById('save-btn');
const clearButton = document.getElementById('clear-btn');
const clearAllBtn = document.getElementById('clear-all');
const exportBtn = document.getElementById('export-btn');
const searchInputEl = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const saveTabBtn = document.getElementById("tab-btn");

//=====================================================================
//              THEME LOGIC
//====================================================================
themeBtn.addEventListener("click", ()  => {
 document.body.classList.toggle("dark-mode");
//  keeping the theme button label dynamic

    if (document.body.classList.contains("dark-mode")){
        themeBtn.textContent = "Light ☀️";
        themeBtn.style.color = "white";
        localStorage.setItem("dark-mode","enabled"); // saving user defined theme persistence
    }
    else{
        themeBtn.textContent = "Dark 🌙"
         themeBtn.style.color = "black"
        localStorage.setItem("dark-mode","disabled"); // saving user defined theme for persistence
    }

});

// ====================================================================
//                             DISPLAY LOGIC (READ)
// ====================================================================
/**
 * Renders the entire myLeads array to the webpage.
 */
function displayLeads(leads){

    let listElements = '';

    for (let i = 0; i < leads.length; i++) {
        const currentLead = leads[i]; // grab the real text first
        const realIndex = myLeads.indexOf(currentLead); // calculate and store the real index of the grabbed text .

//          B . Use the extracted text and index to build the HTML string to be rendered on the page
        listElements +=`<li data-index="${realIndex}">
                            <input type="checkbox" class= "delete-box"> 
                             <a href="https://${currentLead}"target="_blank">${currentLead}  </a> 
                               <span class="edit-icon"> edit</span> 
                        </li>`
    }
    // Update the DOM efficiently.
    ulEl.innerHTML = listElements;
    //======================================================================
//                          EDIT LOGIC INIT
//======================================================================
    const editIcons = document.querySelectorAll(".edit-icon");
    editIcons.forEach(function (icon) {
        icon.addEventListener('click', () => {
            const leadToEdit = icon.parentElement;
            const leadAnchor = leadToEdit.querySelector("a");
            const readyToEdit = leadAnchor.textContent;
            const leadIndex = Number(leadToEdit.dataset.index);

            leadToEdit.innerHTML = `<input type="text" class="new-input" value="${readyToEdit}">
                                <button class="save-edited btn btn-primary">confirm</button>`;

            const newInputEL = document.querySelector(".new-input");
            const saveEditBtn = document.querySelector('.save-edited');

            function saveEdited() {
                if (newInputEL.value.trim() !== ""){
                    myLeads[leadIndex] = newInputEL.value;
                    localStorage.setItem('myLeads', JSON.stringify(myLeads));
                    displayLeads(myLeads);
                }
            }
            saveEditBtn.addEventListener('click', () => {saveEdited()});
            newInputEL.addEventListener("keyup" ,ev => {
                if (ev.key === "Enter") {
                    saveEdited();
                }
            })
        })
    })
}

saveTabBtn.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        const currentTab = tabs[0].url; // Grab the object property at index number 0
        myLeads.push(currentTab); // add new url to the main box
        localStorage.setItem("myLeads", JSON.stringify(myLeads)); // convert and save new leads into the local storage.
        saveContent();
        displayLeads(myLeads) // call the render leads function
    })

})
//===============================================================================================
//                          SEARCH LOGICS
//==============================================================================================

    searchBtn.addEventListener('click' , handleSearch);
     function handleSearch() {
    
    const searchTerm = searchInputEl.value;

    if (searchTerm === ''){
        displayLeads(myLeads); // if the searchTerm is empty or has no value , render all the leads in the array
        searchBtn.textContent = "search";
        return; // And immediately go back home
        
    }
    const filteredLeads = myLeads.filter(lead => lead.toLowerCase().includes(searchTerm.toLowerCase())); // filter out what the user has typed in the search box from the main array
         if (filteredLeads.length === 0){
             ulEl.innerHTML = `<li>No results Found, please try again</li>`
         }
         else {
             displayLeads(filteredLeads); // calling the render function to render only what has been filtered by passing there argument (filteredLeads) which is the variable strong the filtered leads
            searchBtn.textContent = "clear";
         }
         
}

// ====================================================================
//                           DATA LOGIC (CREATE)
// ====================================================================
// * Saves the current input value into the myLeads array.
function saveContent() {
    if (inputEl.value.trim() !== ""){
        myLeads.push(inputEl.value);
        localStorage.setItem('myLeads', JSON.stringify(myLeads));
        inputEl.value = '';
    }
}
//=====================================================================
//Local Storage through API section
let leadsFromLocalStorage = localStorage.getItem('myLeads');
// Check if there is old data stored not null or empty
if (leadsFromLocalStorage){ // this is always a true value so we check only a variable if it has some data there.
    myLeads = JSON.parse(leadsFromLocalStorage); // if storage is not empty then convert our old data into a reusable array// Reassigning the original myLeads empty array with old converted data
    displayLeads(myLeads); // call the render function to display  data
}
//=====================================================================
//                          BATCH DELETION LOGIC INIT
//====================================================================
function deleteCheckedLeads() {
    const checkBoxes = document.querySelectorAll(".delete-box");
    const checkedBoxes = Array.from(checkBoxes).filter(box => box.checked);

    const indexesToDelete = [];
    checkedBoxes.forEach((box) => {
        indexesToDelete.push(parseInt(box.parentElement.dataset.index));
    });
        indexesToDelete.sort((a, b) => b - a);
        indexesToDelete.forEach((index) => {
       myLeads.splice(index, 1)
});
        localStorage.setItem('myLeads', JSON.stringify(myLeads));
        displayLeads(myLeads);
}
//=========================================================================
//                          SIMPLE CLEAR ALL FUNC
//=======================================================================
function clearAll() {
    localStorage.removeItem('myLeads'); // delete all the items in the storage after delete  button press
    myLeads = []; // reset the array back to empty
    displayLeads(myLeads); // call the render function to display nothing 😩😂😂
}
// ====================================================================
//                      INTERACTION FLOW (CONTROLLER)
// ====================================================================
// Defines the three-step process when the save button is clicked.

inputEl.addEventListener("keyup", ev => {
    if (ev.key === "Enter"){
        saveContent();
        displayLeads(myLeads);
    }
})
//====================================================================
saveButton.addEventListener('click' , function() {
    saveContent();     // 1. CREATE: Save the data.
    inputEl.value = '';// 2. Clear the input.
    displayLeads(myLeads);   // 3. READ: Re-render the list.
});
//=============================================================
//                  EXPORT LEADS SECTION
//=============================================================
function exportLeads() {
    if (myLeads.length === 0){
       return;
    }
        myLeads.unshift('My Leads')
        const leadsToExport = myLeads.map(eachLead => eachLead + "\n").join('')//separate arrays each in its own line and then join them .

        const blob = new Blob([leadsToExport], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
    //DOWNLOAD TRIGGER: Create temporary URL and link.
        link.href = url;
        link.download = 'my-leads-export.csv';
        link.click();  // Start the download.
        URL.revokeObjectURL(url); // CLEANUP: Revoke the temporary URL to free up browser memory.

// Export display message
    const feedBackBox = document.createElement('div'); // creating a div element with JavaScript create Element method
    feedBackBox.textContent = 'Export Complete !'; // Actual HTML content or message to be displayed
    feedBackBox.classList.add('export-notification'); // adding a class for CSS styling
   // Attaching the created document
    // setting a timer for the feedback message after a duration of 3 seconds
    setTimeout(() => {
        document.body.appendChild(feedBackBox);
        setTimeout(() => {  document.body.removeChild(feedBackBox);}, 4000);
    } ,2000);

}
exportBtn.addEventListener('click',() => {exportLeads()});
//===================================================================
clearButton.addEventListener("click", ()=>{deleteCheckedLeads()});

clearAllBtn.addEventListener("click", ()=> {clearAll()});


