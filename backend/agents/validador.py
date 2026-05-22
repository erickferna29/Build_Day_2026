
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model

load_dotenv("../.env")

SYSTEM_PROMPT = """ """

model = init_chat_model(model="google_genai:gemini-2.5-flash-lite", temperature=0.0)
agent = create_agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[],
)

if __name__ == "__main__":
    print("Hello world")