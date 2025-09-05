from fastapi import FastAPI # type: ignore
from database import engine, Base
from fastapi.middleware.cors import CORSMiddleware # type: ignore

from auth_user import auth_routes, user_routes
from emply_mng import routes as employee_routes
from attndnce_timesheet import timesheet_routes, atndnce_routes
from payroll import routes as payroll_routes
from leave.routes import router as leave_router
from project_team.routes import router as project_router
from project_team.teams_routes import router as team_router
from notification.routes import router as notif_router
from admin.routes import router as admin_router
from assets.routes import router as asset_router
from performance.routes import router as performance_router

app = FastAPI(title="ERM System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(employee_routes.router)
app.include_router(atndnce_routes.router)
app.include_router(timesheet_routes.router)
app.include_router(payroll_routes.router)
app.include_router(leave_router)
app.include_router(project_router)
app.include_router(team_router)
app.include_router(notif_router)
app.include_router(admin_router)
app.include_router(asset_router)
app.include_router(performance_router)
