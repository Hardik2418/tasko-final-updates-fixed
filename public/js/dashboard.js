// Dashboard Functions

document.addEventListener('DOMContentLoaded', function () {
    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function (e) {
            e.preventDefault();
            createProject();
        });
    }
});

function createProject() {
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;

    if (!name.trim()) {
        alert('Please enter a project name');
        return;
    }

    fetch('/api/projects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            description,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert('Project created successfully!');
                window.location.href = `/projects/${data.projectId}`;
            } else {
                throw new Error(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error creating project: ' + error.message);
        });
}

// Load dashboard stats
function loadDashboardStats() {
    fetch('/api/tasks/dashboard/stats')
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log('Dashboard stats:', data.data);
            }
        })
        .catch((error) => console.error('Error loading stats:', error));
}
