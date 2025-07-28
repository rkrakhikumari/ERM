from fastapi import FastAPI
from database import engine, Base
from auth_user import auth_routes, user_routes
from emply_mng import routes as employee_routes
from attndnce_timesheet import timesheet_routes,atndnce_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ERM System")

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(employee_routes.router)
app.include_router(atndnce_routes.router)
app.include_router(timesheet_routes.router)
