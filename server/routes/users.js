// @ts-check

import i18next from 'i18next'

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query()
      return reply.render('users/index', { users })
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user()
      return reply.render('users/new', { user })
    })
    .get('/users/:id/edit', { name: 'editUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params
      const user = await app.objection.models.user.query().findById(id)

      if (req.user.id !== user.id) {
        req.flash('error', i18next.t('flash.users.notAllowed'))
        return reply.redirect(app.reverse('users'))
      }

      return reply.render('users/edit', { user })
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user()
      user.$set(req.body.data)

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data)
        await app.objection.models.user.query().insert(validUser)
        req.flash('info', i18next.t('flash.users.create.success'))
        return reply.redirect(app.reverse('root'))
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'))
        return reply.render('users/new', { user, errors: data })
      }
    })
    .patch('/users/:id', { name: 'updateUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params
      const user = await app.objection.models.user.query().findById(id)
      const updateData = { ...req.body.data }

      try {
        const validUser = await app.objection.models.user.fromJson(updateData, { patch: true })
        await user.$query().patch(validUser)
        req.flash('info', i18next.t('flash.users.update.success'))
        return reply.redirect(app.reverse('users'))
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.update.error'))
        const userWithId = { ...req.body.data, id }
        return reply.render('users/edit', { user: userWithId, errors: data })
      }
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params
      const user = await app.objection.models.user.query().findById(id)
      const usersTask = await app.objection.models.task.query()
        .where('creatorId', id)
        .orWhere('executorId', id).resultSize()

      if (req.user.id !== user.id) {
        req.flash('error', i18next.t('flash.users.notAllowed'))
        return reply.redirect(app.reverse('users'))
      }

      if (usersTask > 0) {
        req.flash('error', i18next.t('flash.users.delete.error'))
        return reply.redirect(app.reverse('users'))
      }

      try {
        await user.$query().delete()
        req.logOut()
        req.flash('info', i18next.t('flash.users.delete.success'))
      } catch (err) {
        console.error(err)
        req.flash('error', i18next.t('flash.users.delete.error'))
      }

      return reply.redirect(app.reverse('users'))
    })
}
