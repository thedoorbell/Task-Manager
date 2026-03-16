import i18next from 'i18next';

export default (app) => {
  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      return reply.render('labels/index', { labels });
    })
    .get(
      '/labels/new',
      { name: 'newLabel', preValidation: app.authenticate },
      async (req, reply) => {
        const label = new app.objection.models.label();
        return reply.render('labels/new', { label });
      },
    )
    .get(
      '/labels/:id/edit',
      { name: 'editLabel', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const label = await app.objection.models.label.query().findById(id);
        return reply.render('labels/edit', { label });
      },
    )
    .post('/labels', { preValidation: app.authenticate }, async (req, reply) => {
      const label = new app.objection.models.label();
      label.$set(req.body.data);

      try {
        const validLabel = await app.objection.models.label.fromJson(req.body.data);
        await app.objection.models.label.query().insert(validLabel);
        req.flash('info', i18next.t('flash.labels.create.success'));
        return reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        return reply.render('labels/new', { label, errors: data });
      }
    })
    .patch(
      '/labels/:id',
      { name: 'updateLabel', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const label = await app.objection.models.label.query().findById(id);
        const updateData = { ...req.body.data };

        try {
          const validLabel = await app.objection.models.label
            .fromJson(updateData, { patch: true });
          await label.$query().patch(validLabel);
          req.flash('info', i18next.t('flash.labels.update.success'));
          return reply.redirect(app.reverse('labels'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.labels.update.error'));
          const labelWithId = { ...req.body.data, id };
          return reply.render('labels/edit', { label: labelWithId, errors: data });
        }
      },
    )
    .delete(
      '/labels/:id',
      { name: 'deleteLabel', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const label = await app.objection.models.label.query().findById(id);
        const tasksCount = await label.$relatedQuery('tasks').resultSize();

        if (tasksCount > 0) {
          req.flash('error', i18next.t('flash.labels.delete.error'));
          return reply.redirect(app.reverse('labels'));
        }

        try {
          await label.$query().delete();
          req.flash('success', i18next.t('flash.labels.delete.success'));
        } catch (err) {
          console.error(err);
          req.flash('error', i18next.t('flash.labels.delete.error'));
        }

        return reply.redirect(app.reverse('labels'));
      },
    );
};
