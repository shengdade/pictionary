class AppSettings:
    TITLE = "AI Pictionary Game API"
    VERSION = "2.0.0"

    # CORS settings
    ALLOW_ORIGINS = ["*"]
    ALLOW_CREDENTIALS = True
    ALLOW_METHODS = ["*"]
    ALLOW_HEADERS = ["*"]

    # Game settings
    MAX_ATTEMPTS = 5
    TIME_LIMIT_SECONDS = 120

    # OpenAI settings
    OPENAI_MODEL = "gpt-4o-mini"
    OPENAI_TEMPERATURE = 0.7
    OPENAI_MAX_TOKENS = 1000

    # SVG settings
    SVG_WIDTH = 400
    SVG_HEIGHT = 400


settings = AppSettings()
