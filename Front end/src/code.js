console.log('Hello from code.js!');

"use strict";

figma.showUI(__html__);
//size
figma.ui.resize(900, 600);

//receive message from the ui
figma.ui.onmessage = msg => {
    console.log('Received message:', msg);
    //when click on button and this appears - receive json and trigger that creation
    if (msg.type === 'create-component') {
        try {
            const data = msg.data;
            console.log('Data:', data);
            if (!data || !data.type) {
                throw new Error('Invalid data format: Missing variant_properties');
            }
            //method to create component
            createComponent(data);
        } catch (error) {
            console.error('Error creating component:', error);
            figma.notify('Error creating component: ' + error.message);
        }
    }
    if (msg.type === 'fetch-color-styles') {
        fetchColorStyles();
    }
};

//method to get fonts
async function fetchFonts() {
    //get figma fonts
    const availableFonts = await figma.listAvailableFontsAsync();
    figma.ui.postMessage({ type: 'fonts', fonts: availableFonts });
  }
  
  fetchFonts();
  
//fetch color styles
async function fetchColorStyles() {
    //get font colours
    const styles = await figma.getLocalPaintStylesAsync();
    const colorStyles = styles.map(style => {
        const color = style.paints[0].color;
        return {
            name: style.name,
            color: {
                r: Math.round(color.r * 255),
                g: Math.round(color.g * 255)
            }
        };
    });
    figma.ui.postMessage({ type: 'color-styles', styles: colorStyles });
}

//method to choose component
function createComponent(data) {

    const { type } = data;
    console.log('Component type:', type);
    switch (type.toLowerCase()) {
        //button
        case 'button':
            createButton(data);
            break;
            //label
        case 'label':
            createLabel(data);
            break;
            //input
        case 'inputfield':
        case 'input field':
        case 'input-field':
            createInputField(data);
            break;
            //list
        case 'listitem' :
        case 'list item':
        case 'list-item':
            createListItem(data);
            break;
            //menu
        case 'menulist':
        case 'menu':
        case 'menu list':
        case 'menu-list ':
            createMenuItem(data);
            break;
            //icon
        case 'iconbutton':
        case 'icon':
        case 'icon button':
            createIconButton(data);
            break;
        default:
            figma.notify('Unknown component type');
    }
}



//method to create button
async function createButton(data) {
    //load the font from the input of the user
    await loadFont(data.styles.fontFamily, data.styles.fontWeight);
    //create the frame
    const buttonFrame = createAutoLayoutFrame(data.styles);

    //initiailise text node
    const textNode = figma.createText();
    // textNode.fontName = { family: 'Roboto', style: 'Regular' };
    //font details
    textNode.fontName = { family: data.styles.fontFamily, style: data.styles.fontWeight };

    //characters
    textNode.characters = "Button";
    applyTextStyles(textNode, data.children[0].styles);

    //add to the frame
    buttonFrame.appendChild(textNode);

    //make it a compoennent
    wrapComponentWithFrame(buttonFrame, data.name);
}



//method to create lable
async function createLabel(data) {
    //load the font from the input of the user
    await loadFont(data.styles.fontFamily, data.styles.fontWeight);
    //create the frame
    const labelFrame = createAutoLayoutFrame(data.styles);
    //initiailise text node
    const textNode = figma.createText();
    // textNode.fontName = { family: 'Roboto', style: 'Regular' };
    //font details
    textNode.fontName = { family: data.styles.fontFamily, style: data.styles.fontWeight };

    //characters
    textNode.characters = "Label";
    applyTextStyles(textNode, data.children[0].styles);

    //add to the frame
    labelFrame.appendChild(textNode);
    //make it a compoennent
    wrapComponentWithFrame(labelFrame, data.name);
}



//method to create input field
async function createInputField(data) {
    // Load the font from the input of the user
    await loadFont(data.styles.fontFamily, data.styles.fontWeight);

    //Outer frame with minimal styling
    const outerFrame = figma.createFrame();
    outerFrame.layoutMode = 'VERTICAL';
    outerFrame.primaryAxisSizingMode = 'AUTO';
    outerFrame.counterAxisSizingMode = 'AUTO';
    outerFrame.itemSpacing = 10;
    outerFrame.fills = [];
    outerFrame.strokes = [];
    outerFrame.strokeWeight = 0;
    outerFrame.effects = [];
  

    //Label text node with auto layout
    const labelTextNode = figma.createText();
//   labelTextNode.fontName = { family: 'Roboto', style: 'Regular' };
    //font details
    labelTextNode.fontName = { family: data.styles.fontFamily, style: data.styles.fontWeight };

    //characters
    labelTextNode.characters = "Enter your data";
    applyTextStyles(labelTextNode, data.children[0].styles);

  // Input frame with auto layout
  const inputFrame = createAutoLayoutFrame({
      fill: data.styles.fill,
      borderRadius: data.styles.borderRadius,
      strokes: data.styles.strokes,
      strokeWeight: data.styles.strokeWeight,
      effects: data.styles.effects
  });

  const inputTextNode = figma.createText();
//   inputTextNode.fontName = { family: 'Roboto', style: 'Regular' };
    //font details
    inputTextNode.fontName = { family: data.styles.fontFamily, style: data.styles.fontWeight };
    //characters
    inputTextNode.characters = "Placeholder input data";
    applyTextStyles(inputTextNode, data.children[0].styles);

    //add to frame
    inputFrame.appendChild(inputTextNode);

  //append label and input frame to the outer frame
  outerFrame.appendChild(labelTextNode);
  outerFrame.appendChild(inputFrame);

  //make component
  wrapComponentWithFrame(outerFrame, data.name);
}



//method to create list item
async function createListItem(data) {

    //load font
    await loadFont(data.styles.fontFamily, data.styles.fontWeight);
    //autolayout
    const listItemFrame = createAutoLayoutFrame(data.styles);

    //font details
    const listItemTextNode = figma.createText();
    // listItemTextNode.fontName = { family: 'Roboto', style: 'Regular' };
    listItemTextNode.fontName = { family: data.styles.fontFamily, style: data.styles.fontWeight };

    //characters
    listItemTextNode.characters = "List Item";
    applyTextStyles(listItemTextNode, data.children[0].styles);

    //icon details- default rectangle for now
    const iconNode = figma.createRectangle();
    iconNode.resize(24, 24); 
    iconNode.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

    //add to frame
    listItemFrame.appendChild(iconNode);
    listItemFrame.appendChild(listItemTextNode);

    wrapComponentWithFrame(listItemFrame, data.name);
}

//create menu item
async function createMenuItem(data) {
    //load fonts
    await loadFont(data.styles.fontFamily, data.styles.fontWeight);
    //frame
    const menuItemFrame = createAutoLayoutFrame(data.styles);

    //create rectangle
    const iconNode = figma.createRectangle();
    iconNode.resize(24, 24); //24x24
    iconNode.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

    //text node
    const menuItemTextNode = figma.createText();
    // menuItemTextNode.fontName = { family: 'Roboto', style: 'Regular' };
    //font details
    menuItemTextNode.fontName = { family: data.styles.fontFamily, style: data.styles.fontWeight };
    //characters
    menuItemTextNode.characters = "Menu Item";
    applyTextStyles(menuItemTextNode, data.children[0].styles);

    //add to frame
    menuItemFrame.appendChild(menuItemTextNode);
    menuItemFrame.appendChild(iconNode);
    wrapComponentWithFrame(menuItemFrame, data.name);
}



//create icon button
async function createIconButton(data) {
    //load fonts
    await loadFont(data.styles.fontFamily, data.styles.fontWeight);
    //frame
    const iconButtonFrame = createAutoLayoutFrame(data.styles);

    //default rectangle
    const iconNode = figma.createRectangle();
    iconNode.resize(24, 24); //24x24
    iconNode.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    //add to frame
    iconButtonFrame.appendChild(iconNode);

    wrapComponentWithFrame(iconButtonFrame, data.name);
}

// async function fetchDocument(fileKey) {
//     const token = '{token}';
//     const url = `https://api.figma.com/v1/files/${fileKey}`;

//     const response = await fetch(url, {
//         headers: {
//             'X-Figma-Token': token
//         }
//     });

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data;
// }

// async function fetchVariantInstance(fileKey, nodeId) {
//     const token = '{token}';
//     const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;

//     const response = await fetch(url, {
//         headers: {
//             'X-Figma-Token': token
//         }
//     });

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Variant instance fetched successfully:', data);
//     const component = data.nodes[nodeId].document;
//     return component;
// }

// async function createIconButton(data) {
//     await loadFont();
//     const iconButtonFrame = createAutoLayoutFrame(data.styles); // Create a simple frame for the icon button

//     const fileKey = 'nxkwZD7obg98Y6QCkxGDf0'; // File key for 'Material Design Icons'
//     const variantNodeId = '2403:5302'; // Manually obtained node ID for the desired variant

//     try {
//         const variantComponent = await fetchVariantInstance(fileKey, variantNodeId);

//         // const instanceNode = figma.createComponent(); // Create a component node
        
//         instanceNode.fills = variantComponent.fills.map(fill => {
//             if (fill.type === 'SOLID' && fill.color.a !== undefined) {
//                 return {
//                     type: fill.type,
//                     color: {
//                         r: fill.color.r,
//                         g: fill.color.g,
//                         b: fill.color.b
//                     },
//                     blendMode: fill.blendMode
//                 };
//             }
//             return fill;
//         });

//         instanceNode.resize(24, 24); // Resize as needed

//         iconButtonFrame.appendChild(instanceNode);

//         figma.currentPage.appendChild(iconButtonFrame);
//         figma.viewport.scrollAndZoomIntoView([iconButtonFrame]);
//     } catch (error) {
//         console.error('Error fetching icon:', error);
//         figma.notify('Error fetching icon: ' + error.message);
//     }
    
// }



//method to create autolayout
function createAutoLayoutFrame(styles) {
    //frame creation
    const frame = figma.createFrame();
    //alignment
    frame.layoutMode = 'HORIZONTAL';
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    //padding
    frame.paddingLeft = 10;
    frame.paddingRight = 10;
    frame.paddingTop = 5;
    frame.paddingBottom = 5;
    frame.itemSpacing = 5;
    //colour
    frame.fills = [{ type: 'SOLID', color: parseColor(styles.fill) }];
    frame.cornerRadius = styles.borderRadius || 0;
    frame.strokes = (styles.strokes || []).map(strokeColor => ({ type: 'SOLID', color: parseColor(strokeColor) }));
    frame.strokeWeight = styles.strokeWeight || 1;
    // frame.effects = styles.effects || [];
    frame.effects = (styles.effects || []).map(effect => {
        const color = parseColor(effect.color);
        //manage alpha values
        color.a = color.a !== undefined ?  color.a : 1.0; 
        return {
            type: effect.type,
            color: color,
            offset: effect.offset || { x: 0, y: 0 },
            radius: effect.radius || 0,
            spread: effect.spread || 0,
            visible: effect.visible !== undefined ? effect.visible : true,
            blendMode: effect.blendMode || 'NORMAL'
        };
    });

    
    return frame;
}

//method to make a componenset
function wrapComponentWithFrame(frame, name) {
    //create component method
    const component = figma.createComponent();
    component.layoutMode = 'VERTICAL';
    component.primaryAxisSizingMode = 'AUTO';
    component.counterAxisSizingMode = 'AUTO';
    component.appendChild(frame);
    component.name = name;
    //add to figma canvas
    figma.currentPage.appendChild(component);
    figma.viewport.scrollAndZoomIntoView([component]);
}

//use text styles
function applyTextStyles(textNode, styles) {
    textNode.fills = [{ type: 'SOLID', color: parseColor(styles.color) }];
    textNode.fontSize = styles.fontSize;
    textNode.fontName = { family: styles.fontFamily, style: styles.fontWeight };

}

//method to load font
async function loadFont(family, style) {
    try {
        await figma.loadFontAsync({ family: family, style: style });
        return { family: family, style: style };
    } catch (e) {
        // console.warn(`Font Roboto Regular could not be loaded`);
        console.warn(`Font ${family} ${style} could not be loaded`);
        
        throw new Error('Failed to load default font');
    }
}

//parse the colour method
function parseColor(color) {
    if (color.startsWith('rgb')) {
        const rgb = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        return {
            r: parseFloat(rgb[0]) / 255,
            g: parseFloat(rgb[1]) / 255,
            b: parseFloat(rgb[2]) / 255
        };
    } else if (color.startsWith('#')) {
        return hexToRgb(color);
    }
    return { r: 1, g: 1, b: 1 }; // default white
}

//methdo to convert to rgb
function hexToRgb(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    return {
        r: ((bigint >> 16) & 255) / 255,
        g: ((bigint >> 8) & 255) / 255,
        b: (bigint & 255) / 255
    };
}
