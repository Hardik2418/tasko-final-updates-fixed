// My Tasks Page Functions

document.addEventListener('DOMContentLoaded', function () {
    console.log('My Tasks page loaded');
});

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

function updateTaskStatus(taskId, status) {
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
                console.log('Task status updated successfully');
                // Show success message
                showNotification('Task status updated');
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

function requestCompletion(taskId) {
    const comment = prompt('Add a comment about your work completion:');
    if (comment === null) return;

    fetch('/api/task-requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taskId,
            comment,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert('✓ Completion request sent to admin for approval');
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

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 3000;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Load my tasks
function loadMyTasks() {
    fetch('/api/tasks/my-tasks')
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log('My tasks loaded:', data.data);
            }
        })
        .catch((error) => console.error('Error loading my tasks:', error));
}
