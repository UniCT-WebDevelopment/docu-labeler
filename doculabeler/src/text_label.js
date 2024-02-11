import { blendWithWhite } from "./right_task_toolbar_item";

import xmark from "./img/x-mark.png"

function darkenColor(hex, factor) {
    // Parse the hexadecimal color code
    let newHex = hex.replace(/^#/, '');
    const r = parseInt(newHex.slice(0, 2), 16);
    const g = parseInt(newHex.slice(2, 4), 16);
    const b = parseInt(newHex.slice(4, 6), 16);
    if(r>200 && g>200 && b>200) {
        // Calculate the new RGB values with reduced brightness
        const newR = Math.max(0, Math.min(255, r - (factor*r)));
        const newG = Math.max(0, Math.min(255, g - (factor*r)));
        const newB = Math.max(0, Math.min(255, b - (factor*r)));
        // Convert the new RGB values back to hexadecimal
        newHex = `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`;
        return newHex;
    }
    return hex;
}

function darkenRGBColor(rgb, factor) {
    // Extract the individual RGB values
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
  
      // Calculate the new RGB values with reduced brightness
      const newR = parseInt((Math.max(0, Math.min(255, r - factor * r))));
      const newG = parseInt(Math.max(0, Math.min(255, g - factor * g)));
      const newB = parseInt(Math.max(0, Math.min(255, b - factor * b)));
  
      // Convert the new RGB values back to the "rgb(r, g, b)" format
      return `rgb(${newR}, ${newG}, ${newB})`;
    }
  
    // If the input is not in the expected format, return it as is
    return rgb;
  }

export function addAlphaToRGB(rgbString, alpha) {
    // Extract the RGB values from the input string
    const match = rgbString.match(/\((\d+),\s*(\d+),\s*(\d+)\)/);
    
    if (!match) {
        throw new Error('Invalid RGB string format');
    }
  
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
  
    // Ensure the alpha value is between 0 and 1
    const validAlpha = Math.min(Math.max(alpha, 0), 1);
  
    // Create the rgba string
    const rgbaString = `rgba(${r},${g},${b},${validAlpha})`;
  
    return rgbaString;
  }

export const TextLabel = ({label_name, label_color, label_type, onClick, isActive, isDeletable, onDelete}) => {
    let handleLabelDelete = () => {return;}
    if (isDeletable!==undefined && isDeletable) {
        handleLabelDelete = () => (onDelete(label_name)); 
    }
    if(onClick===undefined) {
        onClick = ()=> {return;}
    }
    let label_bg_color = ""
    let delete_bg_color = ""
    if(label_color.startsWith("#")) {
        let transparency_value = isActive==true ? "55" : "33"
        label_bg_color = label_color + transparency_value;
        label_color = darkenColor(label_color, 0.4);
        delete_bg_color = label_color + "33";
    } 
    if(label_color.startsWith("rgb(")) {
        //label_bg_color = addAlphaToRGB(label_color, isActive==true ? 0.45 : 0.2);
        label_bg_color = blendWithWhite(label_color, isActive==true ? 0.85 : 0.4);
        delete_bg_color = blendWithWhite(label_color, 0.2);

    }
    let classN = ""
    if (label_type=="create-project") {
        classN = "create-project-label"
    }
    else {
        classN = "task-annotation-label"
    }

    return (
        <div style={{borderColor:label_color, 
                     backgroundColor:label_bg_color}}
            className={classN + " prevent-select"}
            onClick={() => onClick(label_name, darkenRGBColor(label_color, 0.4))}> 
            {label_name}
            {isDeletable===true && 
                <img
                    src={xmark}
                    width="16px"
                    className="delete-label-btn" 
                    onClick={handleLabelDelete}
                    style={{backgroundColor: delete_bg_color}}/>
            }
        </div>
    );
};