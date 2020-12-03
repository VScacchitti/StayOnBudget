// database
let db;

//create new db request for budget database
const request = indexedDB.open('budget',1);

//create object table named "pending". Calls when we run a new version
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    const budgetStore = db.createObjectStore('budget', {autoIncrement:true});
    budgetStore.createIndex('pendingIndex', 'pending');
};

//Call on a new request
request.onsuccess = function (event){
    db.event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
}
//logs our errors
request.onerror = function (event) {
    console.log("There is an error with retrieving your data:" + request.error);
}

//save new record
function saveRecord(record) {
    //create s transaction on the pending db with readwrite access
    const transaction = db.transaction(['budget'], 'readwrite');
    // access your pending object store
    const budgetStore = transaction.objectStore('budget');
    // add record 
    budgetStore.add(record);
}


//Check Database function

function checkDatabase() {
    const transaction = db.transaction(['budget'], 'readwrite');
    const budgetStore = transaction.objectStore('budget');
    const getRequest = budgetStore.getAll();
  
    getRequest.onsuccess = function () {
      if (getRequest.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getRequest.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(() => {
            // if successful, open a transaction on your pending db
            const transaction = db.transaction(['budget'], 'readwrite');
            // access your pending object store
            const budgetStore = transaction.objectStore('budget');
            // clear all items in your store
            budgetStore.clear();
          });

    
      }
    };
  }

  //listen for app coming back online
  window.addEventListener('online', checkDatabase);