from flask import Flask, request
import json
from ctransformers import AutoModelForCausalLM
from ctransformers import AutoModelForCausalLM

app = Flask(__name__)
@app.route('/llm_response', methods = ['POST']) 
def get_response():
  prompt = request.get_json()
  llm = AutoModelForCausalLM.from_pretrained(
    "K:/llama2_GGUF_cacheDir/models--TheBloke--Llama-2-7B-Chat-GGUF/TheBloke/Mistral-7B-OpenOrca-GGUF",
    model_file="mistral-7b-openorca.Q5_K_M.gguf",
    model_type="mistral",
    gpu_layers = 12                                                               
    )
  response = llm(prompt['p'])
  return json.dumps({"response" : response})

if __name__ == "__main__":  
    app.run(port=5000)
