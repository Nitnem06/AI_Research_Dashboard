import secrets
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User, Organization, UserRole
from app.schemas import UserSignup, UserLogin, Token, UserOut, OrgOut
from app.utils.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=Token, status_code=201)
async def signup(payload: UserSignup, db: AsyncSession = Depends(get_db)):
    # Check email uniqueness
    try:
        existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    if not payload.org_name and not payload.invite_code:
        raise HTTPException(status_code=422, detail="Provide org_name (new org) or invite_code (join existing)")

    # Resolve organization
    if payload.invite_code:
        # Join existing org
        result = await db.execute(select(Organization).where(Organization.invite_code == payload.invite_code))
        org = result.scalar_one_or_none()
        if not org:
            raise HTTPException(status_code=404, detail="Invalid invite code")
        role = UserRole.ANALYST
    else:
        # Create new org — first user becomes admin
        org = Organization(
            name=payload.org_name,
            invite_code=secrets.token_urlsafe(8)[:12],
        )
        db.add(org)
        await db.flush()  # get org.id
        role = UserRole.ADMIN

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        role=role,
        org_id=org.id,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "org_id": str(org.id), "role": role.value})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({
        "sub": str(user.id),
        "org_id": str(user.org_id),
        "role": user.role.value,
    })
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/org", response_model=OrgOut)
async def get_org(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Organization).where(Organization.id == current_user.org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org
