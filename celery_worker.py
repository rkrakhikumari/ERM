from celery import Celery
import os
import config

celery_app = Celery(
    "notifications",
    broker=config.CELERY_BROKER_URL,
    backend=config.CELERY_RESULT_BACKEND
)

celery_app.autodiscover_tasks(["notification"])
