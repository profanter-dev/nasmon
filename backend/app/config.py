from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    truenas_host: str = "192.168.1.29"
    truenas_api_key: str = ""
    truenas_ws_port: int = 443
    fast_interval_seconds: float = 2.0
    process_interval_seconds: float = 5.0
    disk_temp_interval_seconds: float = 30.0
    pool_interval_seconds: float = 30.0
    smart_interval_seconds: float = 300.0
    docker_socket: str = "/var/run/docker.sock"
    sonarr_url: str | None = None
    sonarr_api_key: str | None = None
    radarr_url: str | None = None
    radarr_api_key: str | None = None
    prowlarr_url: str | None = None
    prowlarr_api_key: str | None = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
