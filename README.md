<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# StudyGem (BE)

StudyGem is a dynamic web application designed to empower users with advanced tools for task management, scheduling, and personal productivity. By combining intuitive features with cutting-edge AI insights, StudyGem offers a seamless and efficient way to stay on top of your goals, whether for work, study, or personal growth.

Here are instructions for deploying the Back-end:

## 1. Download the source code

Download the source code from this repository, then open a terminal in the folder and run:
```
$ npm install
```

## 2. Add an .env file

Configure your .env file following this template:
```
PORT=[Local host port number, e.g. 3000]
NODE_ENV=development
DATABASE_HOST=[Database host, e.g. localhost]
DATABASE_USER=[Database username, e.g. postgres]
DATABASE_PORT=[Database port, e.g. 5432]
DATABASE_PASSWORD=[Database password, e.g. 123456]
DATABASE_NAME=[Database name, e.g. study_gem]
PG_URL=[Public host database connection URL]
JWT_CONSTANT=[Json Web Token secret]
REDIS_HOST=[Redis host link, e.g. singapore-redis.render.com]
REDIS_PORT=[Redis host port, e.g. 6379]
REDIS_USERNAME=[Redis username, e.g. violet-abc123]
REDIS_PASSWORD=[Redis password]
GOOGLE_CLIENT_ID=[Google Client ID for Google OAuth, e.g. 1234-abcd.apps.googleusercontent.com]
EMAIL=[Email address to send activation request and new password to user, e.g. example@gmail.com]
PASS=[Google app password, configure here: https://myaccount.google.com/apppasswords]
```

## 3. Create a new database

Open pgAdmin and create a new database with the name matching the `DATABASE_NAME` environment variable you configured earlier.

## 4. Start the application

Run the following command and wait for the terminal to log `connected` and `ready`.
```
$ npm run start
```

## 5. Import data

Go back to pgAdmin and refresh the database. The tables `users`, `tasks` and `progress` will have been automatically created.
You can now import the data from the provided csv files onto the tables. Import in order of users > tasks > progress to avoid violating foreign key constraints:
- Right click the table.
- Click "Import/Export Data..."
- On "Filename", select the csv file.
- Go to "Options" and toggle "Header" on.
- Go to "Columns" and remove the identity column ("id" for users, "taskId" for tasks, and "progressId" for progress) from the list, as they will be automatically generated.
- Click "OK" and wait for the process to finish.

## 6. Deploy the front-end

Now go to the Front-end repository and follow the instructions there to deploy the Front-end.