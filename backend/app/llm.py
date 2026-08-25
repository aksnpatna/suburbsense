import base64
import json
from openai import OpenAI
from app.config import get_settings

# Initialize OpenAI client for local LLM (Ollama)
def get_llm_client():
    settings = get_settings()
    return OpenAI(
        base_url=settings.local_llm_url,
        api_key="local-test"
    )

def analyze_image(file_bytes: bytes, mime_type: str, prompt: str) -> dict:
    client = get_llm_client()
    
    base64_image = base64.b64encode(file_bytes).decode('utf-8')
    image_url = f"data:{mime_type};base64,{base64_image}"
    
    try:
        response = client.chat.completions.create(
            model=get_settings().local_llm_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url}
                        }
                    ]
                }
            ],
            max_tokens=1000,
            temperature=0.1
        )
        
        response_text = response.choices[0].message.content.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        return json.loads(response_text)
    except Exception as e:
        raise Exception(f"LLM analysis failed: {str(e)}")
