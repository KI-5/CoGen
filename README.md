# CoGen: Creation of reusable UI components for building the foundation of user interface designs

UI design involves the whole process of designing for relevant projects based on the requirements; from the smallest element to the concluding design screens. Due to the importance of UI design authors have come up with a multitude of systems and projects to reduce the time and burden when building UI designs. CoGen enables users to generate components in Figma based on textual descriptions of their requirements. 

## Overview of CoGen's technologies
The project involves two major components;  and JSON generation. 
  - description generation: 
1 For description generation the author used a combination of three models; LSTM based Seq2Seq model, GRU based Seq2Seq model and a fine tuned T5 model.
2 For JSON generation the author used two variations of a fine-tuned T5 model. One was with a basic T5 model and the other was a fine-tuned T5 model with cross mechanism and BERT embeddings.

## Usage instructions
- 
