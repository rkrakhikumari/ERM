from fastapi import FastAPI
import auth_user.auth_routes as auth_routes
import auth_user.user_routes as user_routes
import auth_user.models as user_models
import emply_mng.models as emply_models
from database import engine
from emply_mng.models import Employee
from emply_mng import routes

user_models.Base.metadata.create_all(bind=engine)
emply_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ERM System")

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(routes.router)