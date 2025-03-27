class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True 