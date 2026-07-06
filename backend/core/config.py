import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv("/workspaces/practice/.env")


class Settings(BaseSettings):
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    GIGACHAT_AUTH_KEY: str = "MDE5ZjE3ZDctMWVhMi03NmFiLTgwMDEtZmMyZWM4NzQ1YzQ4OjViMDZlNzZmLWIzNDctNDY5ZC05YjVmLWY1MTQzODNiMWM4ZA=="

    model_config = SettingsConfigDict(extra="ignore")


settings = Settings()
