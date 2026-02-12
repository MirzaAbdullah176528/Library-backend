from google import genai
from google.genai import types
import json
import random
import os

API_KEYS = [
    'AIzaSyCTxxXSUjo-GIKV3oLpJEjokL3Yl7QGVo8',
    'AIzaSyD2xDvDMBhUBWGi1LyqE_I4V2tvP2EYcho',
    'AIzaSyDXxdaRe4b6AOrkpGT6y9ZhBNyYNvSzRGA',
    'AIzaSyBHCkuBe8ZTEeqBeXjmVx7u21Ygn5F_XJg'
]

def prompt(detail):
    return f'''
    my name is {detail}
    '''

def get_model_response(detail):
    selected_key = random.choice(API_KEYS)
    client = genai.Client(api_key=selected_key)

    prompt_text = prompt(detail)

    response = client.models.generate_content(
        model='gemma-3-27b-it', 
        
        contents=prompt_text,
    )
    try:
        return response.text
    except json.JSONDecodeError:
        return {"variations": []}

    
if __name__ == "__main__":
    results = get_model_response('Abdullah')
    print(json.dumps(results, indent=2))