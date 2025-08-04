from fastapi import FastAPI
from database import engine, Base
from auth_user import auth_routes, user_routes
from emply_mng import routes as employee_routes
from attndnce_timesheet import timesheet_routes,atndnce_routes
from payroll import models as payroll_models
from payroll import routes as payroll_routes
from leave.routes import router as leave_router
from leave import models as leave_models
from project_team import models as project_models
from project_team.routes import router as project_router
from project_team.teams_routes import router as team_router
from notification import models as notif_model
from notification import routes as notif_router
from admin import routes as admin_router
from admin import models as admin_models
from assets import models as asset_models
from assets.routes import router as asset_router
from performance import models as performance_models
from performance.routes import router as performance_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="ERM System")

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(employee_routes.router)
app.include_router(atndnce_routes.router)
app.include_router(timesheet_routes.router)
app.include_router(payroll_routes.router)
app.include_router(leave_router)
app.include_router(project_router)
app.include_router(team_router)
app.include_router(notif_router.router)
app.include_router(admin_router.router)


app.include_router(payroll_routes.router)
app.include_router(leave_router)
app.include_router(asset_router)
app.include_router(performance_router)


