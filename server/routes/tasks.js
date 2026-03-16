import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const {
        status,
        executor,
        label,
        isCreatorUser,
      } = req.query;
      let query = app.objection.models.task.query()
        .withGraphJoined('[status, creator, executor, labels]');

      if (status && status !== '') {
        query = query.where('statusId', parseInt(status, 10));
      }

      if (executor && executor !== '') {
        query = query.where('executorId', parseInt(executor, 10));
      }

      if (label && label !== '') {
        query = query.whereExists(
          app.objection.models.task.relatedQuery('labels')
            .where('labels.id', parseInt(label, 10)),
        );
      }

      if (isCreatorUser === 'on' && req.user) {
        query = query.where('creatorId', req.user.id);
      }

      const tasks = await query.orderBy('id', 'desc');
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      const userNames = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));

      return reply.render('tasks/index', {
        tasks,
        statuses,
        users: userNames,
        labels,
        filters: {
          status: status || '',
          executor: executor || '',
          label: label || '',
          isCreatorUser: isCreatorUser === 'on',
        },
      });
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const task = new app.objection.models.task();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      const users = await app.objection.models.user.query();
      const userNames = users.map((user) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
      const usersForSelect = [{ id: '', name: '' }, ...userNames];
      const statusesForSelect = [{ id: '', name: '' }, ...statuses];
      return reply.render('tasks/new', {
        task,
        statuses: statusesForSelect,
        labels,
        users: usersForSelect,
      });
    })
    .get(
      '/tasks/:id',
      { name: 'showTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const task = await app.objection.models.task.query().findById(id)
          .withGraphJoined('[status, creator, executor, labels]');
        return reply.render('tasks/show', { task });
      },
    )
    .get(
      '/tasks/:id/edit',
      { name: 'editTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const task = await app.objection.models.task.query().findById(id)
          .withGraphJoined('labels');
        const statuses = await app.objection.models.taskStatus.query();
        const labels = await app.objection.models.label.query();
        const users = await app.objection.models.user.query();
        const userNames = users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));
        const usersForSelect = [{ id: '', name: '' }, ...userNames];
        const selectedLabelsIds = task.labels ? task.labels.map((l) => l.id) : [];
        return reply.render('tasks/edit', {
          task: { ...task, labels: selectedLabelsIds },
          statuses,
          labels,
          users: usersForSelect,
        });
      },
    )
    .post(
      '/tasks',
      { preValidation: app.authenticate },
      async (req, reply) => {
        const taskData = req.body.data;
        const updateData = { ...req.body.data };

        if (updateData.executorId === '') {
          updateData.executorId = null;
        } else {
          updateData.executorId = parseInt(updateData.executorId, 10);
        }

        updateData.statusId = parseInt(updateData.statusId, 10);
        updateData.creatorId = req.user.id;

        let labelIds = [];
        if (updateData.labels !== undefined) {
          const labels = Array.isArray(updateData.labels) ? updateData.labels : [updateData.labels];
          labelIds = labels.filter((id) => id && id !== '').map((id) => parseInt(id, 10));
          delete updateData.labels;
        }

        const task = new app.objection.models.task();
        task.$set(updateData);

        try {
          const validTask = await app.objection.models.task.fromJson(updateData);
          const createdTask = await app.objection.models.task.query().insert(validTask);

          if (labelIds.length > 0) {
            const relatePromises = labelIds.map((labelId) =>
              createdTask.$relatedQuery('labels').relate(labelId),
            );
            await Promise.all(relatePromises);
          }

          req.flash('info', i18next.t('flash.tasks.create.success'));
          return reply.redirect(app.reverse('tasks'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.tasks.create.error'));
          const statuses = await app.objection.models.taskStatus.query();
          const labels = await app.objection.models.label.query();
          const users = await app.objection.models.user.query();
          const userNames = users.map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
          }));
          const usersForSelect = [{ id: '', name: '' }, ...userNames];
          const statusesForSelect = [{ id: '', name: '' }, ...statuses];
          const taskWithLabels = {
            ...taskData,
            labels: taskData.labels ? taskData.labels.filter((id) => id && id !== '') : [],
          };
          return reply.render('tasks/new', {
            task: taskWithLabels,
            labels,
            statuses: statusesForSelect,
            users: usersForSelect,
            errors: data,
          });
        }
      },
    )
    .patch(
      '/tasks/:id',
      { name: 'updateTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const task = await app.objection.models.task.query().findById(id);
        const taskData = req.body.data;
        const updateData = { ...req.body.data };

        if (updateData.executorId === '') {
          updateData.executorId = null;
        } else {
          updateData.executorId = parseInt(updateData.executorId, 10);
        }

        updateData.statusId = parseInt(updateData.statusId, 10);

        let labelIds = [];
        if (updateData.labels !== undefined) {
          const labels = Array.isArray(updateData.labels) ? updateData.labels : [updateData.labels];
          labelIds = labels
            .filter((labelId) => labelId && labelId !== '')
            .map((labelId) => parseInt(labelId, 10));
          delete updateData.labels;
        }

        try {
          const validTask = await app.objection.models.task.fromJson(updateData, { patch: true });
          await task.$query().patch(validTask);

          await task.$relatedQuery('labels').unrelate();
          if (labelIds.length > 0) {
            const relatePromises = labelIds.map((labelId) =>
              task.$relatedQuery('labels').relate(labelId),
            );
            await Promise.all(relatePromises);
          }

          req.flash('info', i18next.t('flash.tasks.update.success'));
          return reply.redirect(app.reverse('tasks'));
        } catch ({ data }) {
          req.flash('error', i18next.t('flash.tasks.update.error'));
          const statuses = await app.objection.models.taskStatus.query();
          const labels = await app.objection.models.label.query();
          const users = await app.objection.models.user.query();
          const userNames = users.map((user) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
          }));
          const usersForSelect = [{ id: '', name: '' }, ...userNames];
          const filteredLabels = taskData.labels
            ? taskData.labels.filter((labelId) => labelId && labelId !== '')
            : [];
          const taskWithId = {
            ...req.body.data,
            id,
            labels: filteredLabels,
          };
          return reply.render('tasks/edit', {
            task: taskWithId,
            statuses,
            labels,
            users: usersForSelect,
            errors: data,
          });
        }
      },
    )
    .delete(
      '/tasks/:id',
      { name: 'deleteTask', preValidation: app.authenticate },
      async (req, reply) => {
        const { id } = req.params;
        const task = await app.objection.models.task.query().findById(id);

        if (req.user.id !== task.creatorId) {
          req.flash('error', i18next.t('flash.tasks.notAllowedTask'));
          return reply.redirect(app.reverse('tasks'));
        }

        try {
          await task.$relatedQuery('labels').unrelate();
          await task.$query().delete();
          req.flash('success', i18next.t('flash.tasks.delete.success'));
        } catch (err) {
          console.error(err);
          req.flash('error', i18next.t('flash.tasks.delete.error'));
        }

        return reply.redirect(app.reverse('tasks'));
      },
    );
};
