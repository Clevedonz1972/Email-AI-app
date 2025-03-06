from celery import Celery
from backend.config import settings

celery_app = Celery(
    'backend',
    broker=f'redis://{settings.REDIS_HOST}:6379/0',
    backend=f'redis://{settings.REDIS_HOST}:6379/0',
    include=['backend.tasks']
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

if __name__ == '__main__':
    celery_app.start() 