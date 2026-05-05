// Projects Page Functions

document.addEventListener('DOMContentLoaded', function () {
    const createProjectForm = document.querySelector('form');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function (e) {
            if (createProjectForm.id === 'createProjectForm') {
                e.preventDefault();
                createProject();
            }
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
        .then((response) => {
            if (response.ok) {
                location.reload();
            } else {
                return response.json().then((data) => {
                    throw new Error(data.message);
                });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error creating project: ' + error.message);
        });
}

// Get all projects for the current user
function loadProjects() {
    fetch('/api/projects')
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                console.log('Projects loaded:', data.data);
            }
        })
        .catch((error) => console.error('Error loading projects:', error));
}
