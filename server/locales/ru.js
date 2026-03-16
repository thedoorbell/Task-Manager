// @ts-check

export default {
  translation: {
    appName: 'Менеджер задач',
    placeholders: {
      email: 'Email',
      password: 'Пароль',
      firstName: 'Имя',
      lastName: 'Фамилия',
      name: 'Наименование',
      description: 'Описание',
      status: 'Статус',
      executor: 'Исполнитель',
      labels: 'Метки',
      statusId: 'Статус',
      executorId: 'Исполнитель',
    },
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        delete: {
          success: 'Пользователь успешно удалён',
          error: 'Не удалось удалить пользователя',
        },
        update: {
          success: 'Пользователь успешно изменён',
          error: 'Не удалось изменить пользователя',
        },
        notAllowed: 'Вы не можете редактировать или удалять другого пользователя',
      },
      statuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
        delete: {
          success: 'Статус успешно удалён',
          error: 'Не удалось удалить статус',
        },
        update: {
          success: 'Статус успешно изменён',
          error: 'Не удалось изменить статус',
        },
      },
      tasks: {
        create: {
          success: 'Задача успешно создана',
          error: 'Не удалось создать задачу',
        },
        update: {
          success: 'Задача успешно изменена',
          error: 'Не удалось изменить задачу',
        },
        delete: {
          success: 'Задача успешно удалена',
          error: 'Не удалось удалить задачу',
        },
        notAllowedTask: 'Задачу может удалить только её автор',
      },
      labels: {
        create: {
          success: 'Метка успешно создана',
          error: 'Не удалось создать метку',
        },
        update: {
          success: 'Метка успешно обновлена',
          error: 'Не удалось обновить метку',
        },
        delete: {
          success: 'Метка успешно удалена',
          error: 'Не удалось удалить метку',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        statuses: 'Статусы',
        labels: 'Метки',
        tasks: 'Задачи',
      },
      edit: 'Изменить',
      delete: 'Удалить',
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        email: 'Email',
        password: 'Пароль',
        firstName: 'Имя',
        lastName: 'Фамилия',
        fullName: 'Полное имя',
        createdAt: 'Дата создания',
        actions: 'Действия',
        editUser: 'Изменение пользователя',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
      statuses: {
        new: {
          submit: 'Создать',
          name: 'Наименование',
          create: 'Создать статус',
          title: 'Создание статуса',
        },
        id: 'ID',
        title: 'Статусы',
        name: 'Наименование',
        createdAt: 'Дата создания',
        edit: {
          title: 'Изменение статуса',
        },
      },
      tasks: {
        title: 'Задачи',
        new: {
          create: 'Создать задачу',
          submit: 'Создать',
          title: 'Создание задачи',
        },
        edit: {
          title: 'Изменение задачи',
          submit: 'Изменить',
        },
        ID: 'ID',
        name: 'Наименование',
        status: 'Статус',
        creator: 'Автор',
        executor: 'Исполнитель',
        createdAt: 'Дата создания',
      },
      labels: {
        title: 'Метки',
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
        new: {
          create: 'Создать метку',
          title: 'Создание метки',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение метки',
        },
      },
    },
  },
}
