from sqlalchemy.orm import Session
from app.models.models import User

def update_user_profile(db: Session, user: User, full_name: str | None, description: str | None, image_path: str | None):
    if full_name is not None:
        user.full_name = full_name

    if description is not None:
        user.description = description

    if image_path is not None:
        user.profile_image = image_path

    db.add(user)
    db.commit()
    db.refresh(user)
    return user