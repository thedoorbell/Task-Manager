import i18next from 'i18next'

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const tasks = await app.objection.models.task.query().withGraphJoined('[status, creator, executor]')
      return reply.render('tasks/index', { tasks })
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task()
      const statuses = await app.objection.models.taskStatus.query()
      const users = await app.objection.models.user.query()
      const userNames = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }))
      const usersForSelect = [{ id: '', name: '' }, ...userNames]
      const statusesForSelect = [{ id: '', name: '' }, ...statuses]

      return reply.render('tasks/new', { task, statuses: statusesForSelect, users: usersForSelect })
    })
    .get('/tasks/:id', { name: 'showTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params
      const task = await app.objection.models.task.query().findById(id).withGraphJoined('[status, creator, executor]')

      return reply.render('tasks/show', { task })
    })
    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params
      const task = await app.objection.models.task.query().findById(id)
      const statuses = await app.objection.models.taskStatus.query()
      const users = await app.objection.models.user.query()
      const userNames = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }))
      const usersForSelect = [{ id: '', name: '' }, ...userNames]

      return reply.render('tasks/edit', {
        task,
        statuses,
        users: usersForSelect,
        errors: {},
      })
    })
    .post('/tasks', { preValidation: app.authenticate }, async (req, reply) => {
      const taskData = req.body.data
      const updateData = { ...req.body.data }

      if (updateData.executorId === '') {
        updateData.executorId = null
      } else {
        updateData.executorId = parseInt(updateData.executorId, 10)
      }

      updateData.statusId = parseInt(updateData.statusId, 10)
      updateData.creatorId = req.user.id
      const task = new app.objection.models.task()
      task.$set(updateData)

      try {
        const validTask = await app.objection.models.task.fromJson(updateData)
        await app.objection.models.task.query().insert(validTask)
        req.flash('info', i18next.t('flash.tasks.create.success'))

        return reply.redirect(app.reverse('tasks'))
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.create.error'))
        const statuses = await app.objection.models.taskStatus.query()
        const users = await app.objection.models.user.query()
        const userNames = users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }))
        const usersForSelect = [{ id: '', name: '' }, ...userNames]
        const statusesForSelect = [{ id: '', name: '' }, ...statuses]

        return reply.render('tasks/new', {
          task: taskData,
          statuses: statusesForSelect,
          users: usersForSelect,
          errors: data,
        })
      }
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params
      const task = await app.objection.models.task.query().findById(id)
      const updateData = { ...req.body.data }

      if (updateData.executorId === '') {
        updateData.executorId = null
      } else {
        updateData.executorId = parseInt(updateData.executorId, 10)
      }

      updateData.statusId = parseInt(updateData.statusId, 10)

      try {
        const validTask = await app.objection.models.task.fromJson(updateData, { patch: true })
        await task.$query().patch(validTask)
        req.flash('info', i18next.t('flash.tasks.update.success'))

        return reply.redirect(app.reverse('tasks'))
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.update.error'))
        const statuses = await app.objection.models.taskStatus.query()
        const users = await app.objection.models.user.query()
        const userNames = users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }))
        const usersForSelect = [{ id: '', name: '' }, ...userNames]
        const taskWithId = { ...req.body.data, id }

        return reply.render('tasks/edit', {
          task: taskWithId,
          statuses,
          users: usersForSelect,
          errors: data,
        })
      }
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params
      const task = await app.objection.models.task.query().findById(id)

      if (req.user.id !== task.creatorId) {
        req.flash('error', i18next.t('flash.tasks.notAllowedTask'))
        return reply.redirect(app.reverse('tasks'))
      }

      try {
        await task.$query().delete()
        req.flash('success', i18next.t('flash.tasks.delete.success'))
      } catch (err) {
        console.error(err)
        req.flash('error', i18next.t('flash.tasks.delete.error'))
      }

      return reply.redirect(app.reverse('tasks'))
    })
}
