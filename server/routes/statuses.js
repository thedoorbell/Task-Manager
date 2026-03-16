import i18next from 'i18next';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await app.objection.models.taskStatus.query();
      return reply.render('statuses/index', { statuses });
    })
    .get(
      '/statuses/new',
      { name: 'newStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const status = new app.objection.models.taskStatus();
        return reply.render('statuses/new', { status });
      },
    )
    .get(
      '/statuses/:id/edit',
      { name: 'editStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const status = await app.objection.models.taskStatus.query().findById(id);
        return reply.render('statuses/edit', { status });
      },
    )
    .post('/statuses', { preValidation: app.authenticate }, async (req, reply) => {
      const status = new app.objection.models.taskStatus();
      status.$set(req.body.data);

      try {
        const validStatus = await app.objection.models.taskStatus.fromJson(req.body.data);
        await app.objection.models.taskStatus.query().insert(validStatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        return reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        return reply.render('statuses/new', { status, errors: data });
      }
    })
    .patch(
      '/statuses/:id',
      { name: 'updateStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const status = await app.objection.models.taskStatus.query().findById(id);
        const updateData = { ...req.body.data };

        try {
          const validStatus = await app.objection.models.taskStatus
            .fromJson(updateData, { patch: true });
          await status.$query().patch(validStatus);
          req.flash('info', i18next.t('flash.statuses.update.success'));
          return reply.redirect(app.reverse('statuses'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.statuses.update.error'));
          const statusWithId = { ...req.body.data, id };
          return reply.render('statuses/edit', { status: statusWithId, errors: data });
        }
      },
    )
    .delete(
      '/statuses/:id',
      { name: 'deleteStatus', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const status = await app.objection.models.taskStatus.query().findById(id);
        const tasksWithStatus = await app.objection.models.task.query()
          .where('statusId', id).resultSize();

        if (tasksWithStatus > 0) {
          req.flash('error', i18next.t('flash.statuses.delete.error'));
          return reply.redirect(app.reverse('statuses'));
        }

        try {
          await status.$query().delete();
          req.flash('success', i18next.t('flash.statuses.delete.success'));
        } catch (err) {
          console.error(err);
          req.flash('error', i18next.t('flash.statuses.delete.error'));
        }

        return reply.redirect(app.reverse('statuses'));
      },
    );
};
