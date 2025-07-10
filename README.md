# CoGen: Creation of reusable UI components for building the foundation of user interface designs

UI design involves the whole process of designing for relevant projects based on the requirements; from the smallest element to the concluding design screens. Due to the importance of UI design authors have come up with a multitude of systems and projects to reduce the time and burden when building UI designs. CoGen enables users to generate components in Figma based on textual descriptions of their requirements. For example you can create a simple list by typing 'Generate a list item.'

## Overview of CoGen's technologies
The project involves two major components;  and JSON generation.

  - Description generation: There was no existing Figma component dataset consisting of JSON and description pairs. Therefore there was a need for description generation for each Figma UI component. The first step involved the creation of synthetic descriptions for the Figma UI component JSON. This was then used as an input to the ML models. After training and comparing an LSTM based Seq2Seq model, a GRU based Seq2Seq model and a fine-tuned T5 model, we chose the fine-tuned T5 model as it was the best performing model.
  - JSON generation: The T5 model was used to generate descriptions for the UI component JSON. These JSON-description pairs were then used to train two fine-tuned T5 models; a basic T5 model and a T5 model with cross mechanism and BERT embeddings.
    

## Usage instructions
Pre-requisites: [Figma web application](https://www.figma.com/downloads/), [ngrok](https://download.ngrok.com/windows), [VSCode](https://code.visualstudio.com/download), [Python](https://www.python.org/downloads/).

The repository consists of the models and the front-end code used in VSCode. 

Once downloaded please follow the following steps:

1. Run the server, by using the command `py app.py` This is required to start your Flask app on the local machine.  
2. Open ngrok and enter `ngrok http 5000` (5000 might change and this will be according to your app's port). This step is to get a public URL.  
3. Copy the ngrok URL and test whether it is working on a browser.  
4. Update the manifest json code and include the ngrok URL.  
5. Open Figma > Plugins > Development > Import plugin from manifest > Point to the exact file location.  
6. Open the plugin on Figma and type the needed component requirements, e.g., 'Generate a basic input-field with a state of hover.','Generate a list item.','Generate an input-field.'  
CoGen allows for the creation of the following UI components: buttons, labels, input fields, menu items, list items, and icon buttons.   

(Note that the application is still at a basic level of implementation. Therefore nested component creation is not yet supported.)  
