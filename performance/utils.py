from reportlab.pdfgen import canvas
import os
from .models import Goal, Feedback

def generate_review_pdf(employee_id: int, goals: list[Goal], feedbacks: list[Feedback]) -> str:
    folder = "review_pdfs"
    os.makedirs(folder, exist_ok=True)
    filename = f"{employee_id}_review.pdf"
    filepath = os.path.join(folder, filename)

    c = canvas.Canvas(filepath)
    y = 800

    c.drawString(10, y, f"Employee ID: {employee_id}")
    y -= 20
    c.drawString(10, y, "Goals:")
    for goal in goals:
        y -= 15
        c.drawString(20, y, f"{goal.title} - Weight: {goal.weight}")

    y -= 25
    c.drawString(10, y, "Feedback:")
    for fb in feedbacks:
        y -= 15
        c.drawString(20, y, f"{fb.role} - Rating: {fb.rating}")
        y -= 15
        c.drawString(25, y, f"Comment: {fb.comments}")

    c.save()
    return filepath
