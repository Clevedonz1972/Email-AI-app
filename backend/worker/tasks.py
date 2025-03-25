from backend.worker.celery import celery_app

@celery_app.task
def test_task():
    return "Hello from Celery!" 