// global variables
var taskIdCounter = 0;
var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];
// task form function
var taskFormHandler = function(event) {
    
    event.preventDefault();
    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    //test for empty values
    if(!taskNameInput || !taskTypeInput) {
      alert("You need to fill out the task form!");
      return false;
    }

    formEl.reset();
    var isEdit = formEl.hasAttribute("data-task-id");
    //has data attribute
    if (isEdit) {
      var taskId = formEl.getAttribute("data-task-id");
      completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    // no data attribute, so create object as normal
    else {
      var taskDataObj = {
        name: taskNameInput,
        type: taskTypeInput, 
        status: "to do"
        };
        createTaskEl(taskDataObj);
    }
    
  } 

//  task creator function
var createTaskEl = function(taskDataObj) {
    //create list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";
    //add task id for each li
    listItemEl.setAttribute("data-task-id", taskIdCounter);  
    listItemEl.setAttribute("draggable", "true");
    //create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    //give it a class name
    taskInfoEl.className = "task-info";
    //add html content to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
    listItemEl.appendChild(taskInfoEl);

    var taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);
    //add entire list item to list
    tasksToDoEl.appendChild(listItemEl); 

    taskDataObj.id=taskIdCounter;
    tasks.push(taskDataObj);
    saveTasks();
    
    //increase task counter for next unique id
    taskIdCounter++;
    
  }
//task actions function
var createTaskActions = function(taskId) {
  var actionContainerEl = document.createElement("div");
  actionContainerEl.className = "task-actions";
  //create edit button
  var editButtonEl = document.createElement("button");
  editButtonEl.textContent = "Edit";
  editButtonEl.className = "btn edit-btn";
  editButtonEl.setAttribute("data-task-id", taskId);
  
  actionContainerEl.appendChild(editButtonEl);

  //create the delete button
  var deleteButtonEl = document.createElement("button");
  deleteButtonEl.textContent = "Delete";
  deleteButtonEl.className = "btn delete-btn";
  deleteButtonEl.setAttribute("data-task-id", taskId);

  actionContainerEl.appendChild(deleteButtonEl);

  var statusSelectEl = document.createElement("select");
  statusSelectEl.className="select-status";
  statusSelectEl.setAttribute("name", "status-change");
  statusSelectEl.setAttribute("data-task-id", taskId);

  var statusChoices = ["To Do", "In Progress", "Completed"];
  for (var i=0; i < statusChoices.length; i++) {
    //create option element
    var statusOptionEl = document.createElement("option");
    statusOptionEl.textContent = statusChoices[i];
    statusOptionEl.setAttribute("value", statusChoices[i]);

    //append to select
    statusSelectEl.appendChild(statusOptionEl);
  } // end for loop
  actionContainerEl.appendChild(statusSelectEl);

  return actionContainerEl;
}  

  // formEl.addEventListener("submit", taskFormHandler);

//edit task function
var editTask = function(taskId) {
  // console.log("editing task # " + taskId);
  var taskSelected = document.querySelector(".task-item[data-task-id= '" +taskId + "']");
  // get content from task name and type
  var taskName = taskSelected.querySelector("h3.task-name").textContent;
  var taskType = taskSelected.querySelector("span.task-type").textContent;
  document.querySelector("input[name='task-name']").value = taskName;
  document.querySelector("select[name='task-type']").value = taskType;
  document.querySelector("#save-task").textContent = "Save Task";
  formEl.setAttribute("data-task-id", taskId);
}

//complete edit task
var completeEditTask = function(taskName, taskType, taskId) {
  //find the matchin task list item
  var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
  //set new values
  taskSelected.querySelector("h3.task-name").textContent = taskName;
  taskSelected.querySelector("span.task-type").textContent = taskType;

  for (var i = 0; i < tasks.length; i++) {
    if(tasks[i].id === parseInt(taskId)) {
      tasks[i].name = taskName;
      tasks[i].type = taskType;
    }
  };
  saveTasks();
  alert("Task Updated!");

  formEl.removeAttribute("data-task-id");
  document.querySelector("#save-task").textContent = "Add Task";
};
//delete task function
  var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();
    // localStorage.removeItem('');
    var updatedTaskArr = [];

    for(var i= 0; i < tasks.length; i++) {
      if(tasks[i] !== parseInt(taskId)) {
        updatedTaskArr.push(tasks[i]);
      }
    }
    tasks = updatedTaskArr;
    saveTasks();
    alert("Task Deleted")
    
  }

  // button handler function
  var taskButtonHandler = function(event) {
   //get target element from event
   var targetEl = event.target;
   //edit button was clicked
   if(targetEl.matches(".edit-btn")) {
     var taskId = targetEl.getAttribute("data-task-id");
     editTask(taskId);
   }

   //delete button was clicked
    if (event.target.matches(".delete-btn")) {
      var taskId = event.target.getAttribute("data-task-id");
      deleteTask(taskId);
    }

  };

  // task status change function
  var taskStatusChangeHandler = function(event){
    //get task item id
    var taskId = event.target.getAttribute("data-task-id");
    //get the currenttly selected options value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();
    //find the parent task item element based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    if (statusValue === "to do") {
      tasksToDoEl.appendChild(taskSelected);
    } else if (statusValue === "in progress") {
      tasksInProgressEl.appendChild(taskSelected);
    } else if (statusValue === "completed") {
      tasksCompletedEl.appendChild(taskSelected);
    }
    for (var i = 0; i < tasks.length; i++) {
      if(tasks[i].id === parseInt(taskId)) {
        tasks[i].status = statusValue;
      }
    }
    saveTasks();
  };

  //create drag task handler
  var dragTaskHandler = function(event) {
    var taskId =  event.target.getAttribute("data-task-id");
    event.dataTransfer.setData("text/plain", taskId);
    event.dataTransfer.getData("text/plain");
  };

  // create drop zone
  var dropZoneDragHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
      event.preventDefault();
      taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");

    }
    
  };

  //create drop task handler
  var dropTaskHandler = function(event) {
    var id = event.dataTransfer.getData("text/plain");
    var draggableElement = document.querySelector("[data-task-id='" + id + "']");
    var dropZoneEl = event.target.closest(".task-list");
    var statusType = dropZoneEl.id;
    var statusSelectEl = draggableElement.querySelector("select[name='status-change']");
   if(statusType === "tasks-to-do") {
     statusSelectEl.selectedIndex = 0;
   }
   else if(statusType === "tasks-in-progress") {
     statusSelectEl.selectedIndex = 1;
   } 
   else if (statusType === "tasks-completed") {
    statusSelectEl.selectedIndex = 2;
   }
   dropZoneEl.appendChild(draggableElement);
   dropZoneEl.removeAttribute("style");

   for (var i = 0; i < tasks.length; i++) {
     if (tasks[i].id === parseInt(id)) {
       tasks[i].status = statusSelectEl.value.toLowerCase();
     }
   }
   saveTasks();
  };

  //create drag leave handler
  var dragLeaveHandler = function(event) {
    var taskListEl = event.target.closest(".task-list");
    if(taskListEl) {
      taskListEl.removeAttribute("style");
    }
  }

  //save tasks function
  var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  //load tasks
  var loadTasks = function() {
    var savedTasks = localStorage.getItem("tasks");
    if (!savedTasks) {
      return false;
    }
  
    savedTasks = JSON.parse(savedTasks);
    for (var i = 0; i < savedTasks.length; i++) {
      createTaskEl(savedTasks[i]);
    }
};


  // event listeners
  formEl.addEventListener("submit", taskFormHandler);

  pageContentEl.addEventListener("click", taskButtonHandler);

  pageContentEl.addEventListener("change", taskStatusChangeHandler);

  pageContentEl.addEventListener("dragstart" , dragTaskHandler);

  pageContentEl.addEventListener("dragover", dropZoneDragHandler);

  pageContentEl.addEventListener("drop", dropTaskHandler);

  pageContentEl.addEventListener("dragleave", dragLeaveHandler);

  loadTasks();