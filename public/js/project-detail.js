// Project Detail Page Functions

document.addEventListener('DOMContentLoaded', function () {
    const createTaskForm = document.getElementById('createTaskForm');
    if (createTaskForm) {
        createTaskForm.addEventListener('submit', function (e) {
            e.preventDefault();
            createTask();
        });
    }
});

function showCreateTaskForm() {
    const modal = document.getElementById('createTaskModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function createTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const projectId = document.getElementById('projectId').value;
    const priority = document.getElementById('taskPriority').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const assignee = document.getElementById('taskAssignee').value;

    if (!title.trim()) {
        alert('Please enter a task title');
        return;
    }

    fetch('/api/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            description,
            projectId,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            assignee: assignee || null,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert('Task created and assigned successfully');
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred');
        });
}

function editTask(taskId) {
    // Open edit modal or redirect to edit page
    alert('Edit functionality coming soon!');
}

function addMember() {
    const memberEmail = document.getElementById('memberEmail').value;
    const projectId = window.location.pathname.split('/').pop();

    if (!memberEmail.trim()) {
        alert('Please enter a member email');
        return;
    }

    fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberEmail }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert('Member added successfully');
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred');
        });
}

function removeMember(memberId) {
    if (confirm('Are you sure you want to remove this member?')) {
        const projectId = window.location.pathname.split('/').pop();

        fetch(`/api/projects/${projectId}/members/${memberId}`, {
            method: 'DELETE',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert('Member removed successfully');
                    location.reload();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred');
            });
    }
}

function filterTasks() {
    const filter = document.getElementById('statusFilter').value;
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach((task) => {
        if (!filter || task.getAttribute('data-status') === filter) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}

// Load project tasks
function loadProjectTasks() {
    const projectId = window.location.pathname.split('/').pop();
    fetch(`/api/tasks/${projectId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log('Tasks loaded:', data.data);
            }
        })
        .catch((error) => console.error('Error loading tasks:', error));
}

function updateTaskStatus(taskId, status) {
    if (!status) {
        return;
    }

    fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert('Task updated successfully');
                location.reload();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred');
        });
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert('Task deleted successfully');
                    location.reload();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred');
            });
    }
}
