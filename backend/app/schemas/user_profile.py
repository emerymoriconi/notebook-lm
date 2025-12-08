from pydantic import BaseModel


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    description: str | None = None


class UserProfileOut(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    description: str | None
    profile_image: str | None

    class Config:
        from_attributes = True