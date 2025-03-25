from celery import Celery

celery_app = Celery(
    'backend',
    broker='redis://redis:6379/0',
    backend='redis://redis:6379/0',
    include=['backend.worker.tasks']
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