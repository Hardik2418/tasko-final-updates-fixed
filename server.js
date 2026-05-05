require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const path = require('path');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.error('Request timeout');
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/tasko',
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tasko', {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const taskRequestRoutes = require('./routes/taskRequests');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  try {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    res.render('index');
  } catch (err) {
    console.error('Home page error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/signup', (req, res) => {
  try {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    res.render('signup');
  } catch (err) {
    console.error('Signup page error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/login', (req, res) => {
  try {
    if (req.session.userId) {
      return res.redirect('/dashboard');
    }
    res.render('login');
  } catch (err) {
    console.error('Login page error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    Promise.all([
      User.findById(req.session.userId),
      Project.find({
        $or: [
          { creator: req.session.userId },
          { members: req.session.userId },
        ],
      }).populate('creator').populate('members'),
      Task.countDocuments({ assignee: req.session.userId }),
      Task.countDocuments({
        assignee: req.session.userId,
        dueDate: { $lt: new Date() },
        status: { $ne: 'Done' },
      }),
    ])
      .then(([user, projects, myTasksCount, overdueCount]) => {
        res.render('dashboard', {
          user,
          projects,
          myTasksCount,
          overdueCount,
          userId: req.session.userId,
          isAdmin: user.role === 'admin',
        });
      })
      .catch((err) => {
        console.error('Dashboard error:', err);
        res.status(500).render('error', { message: 'Failed to load dashboard' });
      });
  } catch (err) {
    console.error('Dashboard route error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/projects', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    Promise.all([
      Project.find({
        $or: [
          { creator: req.session.userId },
          { members: req.session.userId },
        ],
      }).populate('creator').populate('members'),
      User.findById(req.session.userId),
    ])
      .then(([projects, user]) => {
        res.render('projects', {
          projects,
          user,
          userId: req.session.userId,
        });
      })
      .catch((err) => {
        console.error('Get projects page error:', err);
        res.status(500).render('error', { message: 'Failed to load projects' });
      });
  } catch (err) {
    console.error('Projects page error:', err);
    res.status(500).render('error', { message: err.message });
  }
});

app.get('/my-tasks', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    Promise.all([
      Task.find({ assignee: req.session.userId }).populate('project').populate('assignee'),
      User.findById(req.session.userId),
    ])
      .then(([tasks, user]) => {
        res.render('my-tasks', {
          tasks,
          user,
          userId: req.session.userId,
        });
      })
      .catch((err) => {
        console.error('Get my tasks page error:', err);
        res.status(500).render('error', { message: 'Failed to load tasks' });
      });
  } catch (err) {
    console.error('My tasks page error:', err);
    res.status(500).render('error', { message: err.message });
  }
});

app.get('/projects/:id', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    Promise.all([
      Project.findById(req.params.id).populate('creator').populate('members'),
      Task.find({ project: req.params.id }).populate('assignee').populate('project'),
      User.findById(req.session.userId),
    ])
      .then(([project, tasks, user]) => {
        if (!project) {
          return res.status(404).render('error', { message: 'Project not found' });
        }

        const isMember = project.members.some(
          (member) => member._id.toString() === req.session.userId
        );
        const isCreator = project.creator._id.toString() === req.session.userId;

        if (!isMember && !isCreator) {
          return res.status(403).render('error', { message: 'Not authorized' });
        }

        res.render('project-detail', {
          project,
          tasks,
          user,
          userId: req.session.userId,
          isCreator,
          isAdmin: user.role === 'admin',
        });
      })
      .catch((err) => {
        console.error('Get project details page error:', err);
        res.status(500).render('error', { message: 'Failed to load project' });
      });
  } catch (err) {
    console.error('Project details page error:', err);
    res.status(500).render('error', { message: err.message });
  }
});

app.get('/admin-panel', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  try {
    User.findById(req.session.userId).then((user) => {
      if (user.role !== 'admin') {
        return res.status(403).render('error', { message: 'Access denied. Admin only.' });
      }
      res.render('admin-panel', { user, userId: req.session.userId });
    }).catch((err) => {
      console.error('Admin panel error:', err);
      res.status(500).json({ error: err.message });
    });
  } catch (err) {
    console.error('Admin panel route error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-requests', taskRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  try {
    res.status(err.status || 500).render('error', {
      message: err.message || 'Something went wrong',
    });
  } catch (renderErr) {
    res.status(err.status || 500).json({
      error: err.message || 'Something went wrong',
    });
  }
});

app.use((req, res) => {
  try {
    res.status(404).render('error', { message: 'Page not found' });
  } catch (err) {
    res.status(404).json({ error: 'Page not found' });
  }
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
