// import './styles.css';

figma.showUI(__html__);
figma.ui.resize(1000, 500);

// figma.ui.onmessage = () => {
//   document.addEventListener('DOMContentLoaded', () => {
//     const promptInput = document.getElementById('prompt') as HTMLInputElement;
//     const generateButton = document.getElementById('generate') as HTMLButtonElement;
//     console.log('Styles loaded');
//     if (promptInput && generateButton) {
//       generateButton.addEventListener('click', () => {
//         const prompt = promptInput.value;
//         console.log('Prompt:', prompt);
//         // Additional logic here
//       });
//     } else {
//       console.error('Failed to find promptInput or generateButton elements.');
//     }
//   });
// };