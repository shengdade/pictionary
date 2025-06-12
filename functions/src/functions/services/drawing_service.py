import openai
from sst import Resource
from functions.config.settings import settings

# Initialize OpenAI client
openai_client = openai.OpenAI(
    api_key=Resource.OpenAIApiKey.value,
    base_url="https://gateway.ai.cloudflare.com/v1/c5b793f894444f1cc7aaac929176106d/pictionary/openai",
)


def generate_ai_drawing(word: str) -> str:
    """Generate an SVG drawing using OpenAI for the given word."""
    try:
        response = openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"You are an AI that creates simple SVG drawings for a Pictionary game. Create a simple, clear SVG that represents the given word. The SVG should be {settings.SVG_WIDTH}x{settings.SVG_HEIGHT} pixels and use basic shapes and lines. Return ONLY the SVG code, no explanations.",
                },
                {
                    "role": "user",
                    "content": f"Draw a simple SVG representation of: {word}",
                },
            ],
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
        )

        svg_content = response.choices[0].message.content.strip()

        # Ensure it's proper SVG format
        if not svg_content.startswith("<svg"):
            svg_content = f'<svg width="{settings.SVG_WIDTH}" height="{settings.SVG_HEIGHT}" viewBox="0 0 {settings.SVG_WIDTH} {settings.SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">{svg_content}</svg>'

        return svg_content
    except Exception as e:
        print(f"Error generating AI drawing: {e}")
        return _get_fallback_svg(word)


def _get_fallback_svg(word: str) -> str:
    """Fallback simple SVG if OpenAI fails."""
    return f"""<svg width="{settings.SVG_WIDTH}" height="{settings.SVG_HEIGHT}" viewBox="0 0 {settings.SVG_WIDTH} {settings.SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="{settings.SVG_WIDTH-20}" height="{settings.SVG_HEIGHT-20}" fill="none" stroke="black" stroke-width="2"/>
        <text x="{settings.SVG_WIDTH//2}" y="{settings.SVG_HEIGHT//2}" text-anchor="middle" font-size="20" fill="black">AI Drawing</text>
        <text x="{settings.SVG_WIDTH//2}" y="{settings.SVG_HEIGHT//2 + 30}" text-anchor="middle" font-size="16" fill="gray">Word: {word}</text>
    </svg>"""
