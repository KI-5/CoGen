from flask import Flask, request, jsonify,make_response
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
from flask_cors import CORS
import json
import os 
import re

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})  
CORS(app)


#model path
model_dir = os.path.join(os.path.dirname(__file__), 'saved_model')

#check if model directory exists
if not os.path.exists(model_dir):
    raise ValueError(f"Model directory {model_dir} does not exist")


# model_dir = "server/saved_model"
#tokenzer
tokenizer = T5Tokenizer.from_pretrained(model_dir)
#model
model = T5ForConditionalGeneration.from_pretrained(model_dir)
#device setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)


@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        if data is None:
            raise ValueError("No JSON data received")
        print(f"Received data: {data}")

        #prompt
        prompt = data.get('prompt', '')
        #color
        color = data.get('color', '#3357FF') 
        #font color
        fontColor = data.get('fontColor', '#000000')
        #font family
        fontFamily = data.get('fontFamily', 'Roboto')
        #font weight
        fontWeight = data.get('fontWeight', 'Regular')
        #if no prompt
        if not prompt:
            raise ValueError("No prompt provided")

        #model output
        generated_json = generate_json_from_prompt(prompt,color,fontColor)
        print(f"Generated JSON: {generated_json}")
        
        #mapping and getting json fr figma
        figma_json = map_to_figma_json(generated_json,fontFamily,fontWeight)
        print(f"Figma JSON: {figma_json}")
        
        #response
        response = make_response(jsonify(figma_json))
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'

        return response

    except Exception as e:
        response = make_response(jsonify({"error": str(e)}))
        response.headers['Access-Control-Allow-Origin'] = '*'
        print(f"Error: {str(e)}")
        return response, 500

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/')
def home():
    return "Flask server is running"


def generate_json_from_prompt(prompt,color,fontColor):
    """method to generate json from prompt
    Args:
        prompt (str): prompt text
        color (str): hex color code
        fontColor (str): hex font color code
    Returns:
        generated_json (dict): generated json
    """
    model.eval()
    #tokenize inputs
    inputs = tokenizer(prompt, return_tensors="pt", padding='longest', truncation=True).to(device)
    with torch.no_grad():
        outputs = model.generate(inputs['input_ids'], max_length=512)
    generated_json_str = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print(f"Generated JSON string: {generated_json_str}")  # Log the generated JSON string

    #proper formatting check
    generated_json_str = format_generated_json(generated_json_str)
    print(f"Formatted JSON string: {generated_json_str}")  # Log the formatted JSON string

    try:
        generated_json = json.loads(generated_json_str)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        raise ValueError(f"Invalid JSON format: {generated_json_str}")
     
     #inject colour to json
    generated_json['variant_properties']['color'] = color
    generated_json['variant_properties']['textColor'] = fontColor
    
    return generated_json

def format_generated_json(generated_json_str):
    """method to postprocess generated json
    Args:
        generated_json_str (str): generated json string
    Returns:
        valid_json_str (str): formatted json string
    """
    #find start of "variant_properties" section
    start_index = generated_json_str.find('"variant_properties":')
    #error
    if start_index == -1:
        raise ValueError("Invalid JSON format: 'variant_properties' not found")

    #check if properly enclosed in braces
    extracted_json_str = generated_json_str[start_index:]
    valid_json_str = "{" + extracted_json_str + "}"

    #proper formatting with nested structures. all keys in double quotes
    valid_json_str = re.sub(r'(\w+):', r'"\1":', valid_json_str)  
    #remove quotes from numbers
    valid_json_str = re.sub(r'": (\d+\.?\d*)"', r'": \1', valid_json_str)

    #effects as array of objects
    valid_json_str = re.sub(r'"effects": \[([^]]+)\]', lambda m: '"effects": [{}]'.format(
        ', '.join(
            '{{{}}}'.format(effect.strip()) for effect in m.group(1).split('}, {')
        )
    ), valid_json_str)
    #proper nesting for variant_properties and variant_details
    valid_json_str = re.sub(r'"variant_properties":\s*', r'"variant_properties": {', valid_json_str, count=1)
    valid_json_str = re.sub(r'"variant_details":\s*', r'"variant_details": {', valid_json_str, count=1)
    #close variant_details and variant_properties
    valid_json_str = re.sub(r'(\]})$', r'] } } }', valid_json_str, count=1)  

    #correct array and object brackets
    valid_json_str = re.sub(r'"\["', r'["', valid_json_str)
    valid_json_str = re.sub(r'"\]"', r']', valid_json_str)
    valid_json_str = re.sub(r'"\{"', r'{', valid_json_str)
    valid_json_str = re.sub(r'"\}"', r'}', valid_json_str)
    
    #border radius []
    # valid_json_str = re.sub(r'"borderRadius": \[\]', r'"borderRadius": 0', valid_json_str)
    valid_json_str = re.sub(r'"Condition":\s*\["([^"]*)"\]\]', r'"Condition": ["\1"]', valid_json_str)
    valid_json_str = re.sub(r'"\],\s*"', r'"], "', valid_json_str)

    #colon with comma between component_name and subtype
    valid_json_str = re.sub(r'("component_name":\s*"[^"]*")\s*:\s*("subtype":\s*"[^"]*")', r'\1,\2', valid_json_str)
    valid_json_str = re.sub(r'"component_name":\s*"([^"]*)"\s*:\s*"([^"]*)"', r'"component_name": "\1", "icon_name": "\2"', valid_json_str)
   
    return valid_json_str

def map_to_figma_json(generated_json,fontFamily,fontWeight):
    """method to map generated json to figma json
    Args:   
        generated_json (dict): generated json
        fontFamily (str): font family
        fontWeight (str): font weight
    Returns:
        figma_json (dict): figma json
    """
    #properties colelction
    variant_properties = generated_json.get("variant_properties", {})
    #name of component
    component_type = variant_properties.get("component_name", "Component")
    #style
    style = variant_properties.get("style", "Default")
    #subtype
    subtype = variant_properties.get("subtype", "Default")
    
    #naming: style/component_name/subtype
    component_name = f"{style}/{component_type}/{subtype}"

    # Figma JSON structure
    figma_json = {
        "type": variant_properties.get("component_name", "Component"),
        "name": component_name,
        "styles": {
            "fill": variant_properties["color"],
            "strokes": variant_properties["strokes"],
            "strokeWeight": variant_properties["strokeWeight"],
            "borderRadius": 0 if variant_properties.get("borderRadius", []) == [] else variant_properties["borderRadius"],
            # "fontFamily": variant_properties["fontFamily"],
            "fontFamily": fontFamily, # "Roboto
            "fontWeight": fontWeight,
            "fontSize": variant_properties["fontSize"],
            "textColor": variant_properties["textColor"],
            "effects": variant_properties.get("effects", []),
            "padding": variant_properties.get("padding", 0),
            "width": variant_properties["width"],
            "height": variant_properties["height"],
        },
        "children": [
            {
                "type": "TEXT",
                "content": variant_properties["text"],
                "styles": {
                    "color": variant_properties["textColor"],
                    # "fontFamily": variant_properties["fontFamily"],
                    # "fontWeight": variant_properties["fontWeight"],
                    "fontFamily": fontFamily, 
                    "fontWeight": fontWeight,
                    "fontSize": variant_properties["fontSize"]
                }
            }
        ],
        "x": variant_properties["x"],
        "y": variant_properties["y"]
    }

    # Apply the variant details to the component
    variant_details = variant_properties.get("variant_details", {})
    if "State" in variant_details:
        figma_json["variant"] = {"State": variant_details["State"]}
    


    return figma_json



if __name__ == '__main__':
    app.run(debug=True, port=5000)