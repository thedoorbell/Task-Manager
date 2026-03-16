// @ts-check

export default {
  translation: {
    appName: 'Task Manager',
    placeholders: {
      email: 'Email',
      password: 'Password',
      firstName: 'First name',
      lastName: 'Last name',
      name: 'Name',
      description: 'Description',
      status: 'Status',
      executor: 'Executor',
      labels: 'Labels',
      statusId: 'Status',
      executorId: 'Executor',
    },
    flash: {
      session: {
        create: {
          success: 'You are logged in',
          error: 'Wrong email or password',
        },
        delete: {
          success: 'You are logged out',
        },
      },
      users: {
        create: {
          error: 'Failed to register',
          success: 'User registered successfully',
        },
        delete: {
          success: 'User deleted successfully',
          error: 'Failed to delete user',
        },
        update: {
          success: 'User updated successfully',
          error: 'Failed to update user',
        },
        notAllowed: 'You can not edit or delete another user',
      },
      statuses: {
        create: {
          success: 'Status created successfully',
          error: 'Failed to create status',
        },
        delete: {
          success: 'Status deleted successfully',
          error: 'Failed to delete status',
        },
        update: {
          success: 'Status updated successfully',
          error: 'Failed to update status',
        },
      },
      tasks: {
        create: {
          success: 'Task created successfully',
          error: 'Failed to create task',
        },
        update: {
          success: 'Task updated successfully',
          error: 'Failed to update task',
        },
        delete: {
          success: 'Task deleted successfully',
          error: 'Failed to delete task',
        },
        notAllowedTask: 'Only the author can delete the task',
      },
      authError: 'Access denied! Please login',
    },
    layouts: {
      application: {
        users: 'Users',
        signIn: 'Login',
        signUp: 'Register',
        signOut: 'Logout',
        statuses: 'Statuses',
        labels: 'Labels',
        tasks: 'Tasks',
      },
      edit: 'Edit',
      delete: 'Delete',
    },
    views: {
      session: {
        new: {
          signIn: 'Login',
          submit: 'Login',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        password: 'Password',
        firstName: 'Name',
        lastName: 'Surname',
        fullName: 'Full name',
        createdAt: 'Created at',
        actions: 'Actions',
        editUser: 'Edit user',
        new: {
          submit: 'Register',
          signUp: 'Register',
        },
      },
      welcome: {
        index: {
          hello: 'Hello from Hexlet!',
          description: 'Online programming school',
          more: 'Learn more',
        },
      },
      statuses: {
        new: {
          submit: 'Create',
          name: 'Name',
          create: 'Create status',
          title: 'Create status',
        },
        id: 'ID',
        title: 'Statuses',
        name: 'Name',
        createdAt: 'Created at',
        edit: {
          title: 'Edit status',
        },
      },
      tasks: {
        title: 'Tasks',
        new: {
          create: 'Create task',
          title: 'Create task',
          submit: 'Create',
        },
        edit: {
          title: 'Edit task',
          submit: 'Update',
        },
        id: 'ID',
        name: 'Name',
        status: 'Status',
        executor: 'Executor',
        creator: 'Creator',
        createdAt: 'Created at',
      },
    },
  },
}
