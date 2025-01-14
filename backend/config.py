class Config():
    DEBUG=False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI="sqlite:///IESCP2.sqlite3"
    DEBUG=True
    SECURITY_PASSWORD_HASH= 'bcrypt'
    SECURITY_PASSWORD_SALT= 'secret'
    SECRET_KEY="ABC1234"
    SECURITY_TOKEN_AUTHENTICATION_HEADER='Auth-Token'
    CACHE_TYPE="RedisCache"
    CACHE_DEFAULT_TIMEOUT= 30
    CACHE_REDIS_PORT= 6379
    WTF_CSRF_ENABLED= False