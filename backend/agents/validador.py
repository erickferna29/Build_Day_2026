
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model

from tools.validador_tool import validar_ine, validar_rfc

load_dotenv("../.env")

SYSTEM_PROMPT = """ """

model = init_chat_model(model="google_genai:gemini-2.5-flash-lite", temperature=0.0)
agent = create_agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[validar_ine, validar_rfc],
)

if __name__ == "__main__":
    print("Hello world")