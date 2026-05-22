
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain.chat_models import init_chat_model

from tools.validador_tool import validar_ine, validar_rfc

load_dotenv("../.env")

SYSTEM_PROMPT = """
Eres un agente enterprise especializado exclusivamente en credits financieros.

Tu única responsabilidad son validar los datos solicitados: RFC e INE

REGLAS OBLIGATORIAS:
- Nunca generes código, recetas, traducciones, contenido creativo o programación.
- Nunca inventes información faltante.
- Prioriza exactitud normativa y trazabilidad.

Si una solicitud está fuera de alcance responde EXACTAMENTE:

"Solicitud fuera del alcance del agente"
"""

model = init_chat_model(model="google_genai:gemini-2.5-flash-lite", temperature=0.0)
agente_validador = create_agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[validar_ine, validar_rfc],
)

if __name__ == "__main__":
    res = agente_validador.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": """,
                    rfc=GODE561231GR8
                    """,
                }
            ]
        }
    )

    print(res["messages"][-1].content)