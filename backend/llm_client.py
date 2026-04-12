from openai import AsyncOpenAI

from config import Settings


class LLMClient:
    def __init__(self, settings: Settings) -> None:
        self._client = AsyncOpenAI(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_BASE_URL,
        )
        self._model = settings.LLM_MODEL
        self._app_title = settings.LLM_APP_TITLE
        self._extra_headers = {
            "HTTP-Referer": "http://localhost:5173",
            "X-OpenRouter-Title": self._app_title,
        }

    async def analyze(self, system_prompt: str, user_prompt: str) -> str:
        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            extra_headers=self._extra_headers,
        )
        return response.choices[0].message.content or ""

    async def generate_stream(self, system_prompt: str, user_prompt: str):
        stream = await self._client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            stream=True,
            extra_headers=self._extra_headers,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content
