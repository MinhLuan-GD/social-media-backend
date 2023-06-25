## Description

Social Media Backend
 - [Fontend](#)
 - [Fontend repository](https://github.com/HoangBaoPhuc369/Facebook_Clone_Frontend)

## The Package Features

- Application

    ![](https://img.shields.io/badge/-Nest-000?style=for-the-badge&logo=NestJs&logoColor=E0234E)
    ![](https://img.shields.io/badge/-TypeScript-2F74C0?style=for-the-badge&logo=TypeScript&logoColor=fff)

- DevOps

    ![](https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=fff)
    ![](https://img.shields.io/badge/-ESLint-4B32C3?style=for-the-badge&logo=ESLint&logoColor=fff)
    ![](https://img.shields.io/badge/-Prettier-1A2B34?style=for-the-badge&logo=Prettier&logoColor=fff)
    ![](https://img.shields.io/badge/-Jest-C21325?style=for-the-badge&logo=Jest&logoColor=fff)

- Database

    ![](https://img.shields.io/badge/-MongoDB-fff?style=for-the-badge&logo=MongoDB&logoColor=001E2B)
    ![](https://img.shields.io/badge/-Redis-E74C3C?style=for-the-badge&logo=Redis&logoColor=fff)

## Usage

### Docker

.env file:

```.env
# NETWORK
PORT = 
BACK_END_URL =
FONT_END_URL =

# DATABASE
DB_HOST = 
DB_PORT = 
DB_NAME =
DB_USERNAME = 
DB_PASSWORD = 
DB_MAX_POOL_SIZE = 
DB_MIN_POOL_SIZE = 
DB_SOCKET_TIMEOUT = 
DB_FAMILY = 

# CACHE
STORE_HOST = 
STORE_PORT = 
STORE_PASSWORD = 

# TOKEN
SECRET_KEY = 
EXPIRES_IN = 
ALGORITHM = 

# COR
ORIGIN = 

# Protection
THROTTLE_TTL = 
THROTTLE_LIMIT = 

# MAILER
EMAIL =
MAILING_ID =
MAILING_SECRET =
MAILING_REFRESH =

# RESOUCE
CLOUD_NAME =
CLOUD_API_KEY = 
CLOUD_API_SECRET = 

# TAG
REDIS_TAG =
MONGO_TAG =
```

Run app:

```bash
# start
$ docker compose -p <name> --env-file .env/docker.dev.env up -d

# stop
$ docker compose -p <name> down
```

## License

[MIT licensed](https://github.com/MinhLuan-GD/social-media-backend/blob/main/LICENSE)
