import { addAlphaToRGB } from "./text_label"
import down_arrow from "./img/down.png"
import up_arrow from "./img/up.png"
import visible from "./img/visible.png"
import invisible from "./img/invisible.png"
import { useState, useRef, useEffect } from "react";

export function blendWithWhite(rgbColor, alpha) {
    const [r, g, b] = rgbColor
      .match(/\d+/g)
      .map((value) => parseInt(value, 10));
  
    // Calculate the blended RGB color components
    const blendedR = Math.round((1 - alpha) * 255 + alpha * r);
    const blendedG = Math.round((1 - alpha) * 255 + alpha * g);
    const blendedB = Math.round((1 - alpha) * 255 + alpha * b);
  
    // Return the blended RGB color as "rgb(r, g, b)"
    return `rgb(${blendedR}, ${blendedG}, ${blendedB})`;
  }



export const RightTaskToolbarItem = ({rect, rectCollapse, onItemCollapse, isItemFocused, rectangles, onRectUpdate, onRectChange, saveSnapshot}) => {
  const [textAreaContent, setTextAreaContent] = useState(rect.textcontent);
  const textAreaRef = useRef(null);

  const setItemTextContent = (e) => {
    rect.textcontent = e.target.value;
    setTextAreaContent(e.target.value);
    onRectChange();
  }

  useEffect(() => {
    if (isItemFocused) {
      textAreaRef.current.focus();
    }
  }, [isItemFocused]);

  useEffect(() => {
    setTextAreaContent(rect.textcontent);
  }, [rect.textcontent])

  const onVisibilityChange = () => {
    let currRect = rectangles[rect.index-1];
    let updatedRects = [...rectangles];
    updatedRects[rect.index-1].hidden = !updatedRects[rect.index-1].hidden
    onRectUpdate(updatedRects);
  }

  const itemContentClassName = `right-toolbar-item-content ${(rectCollapse || rectCollapse==undefined) ? 'closed' : 'open'}`;
    
    return (
      <div>
        <div className="right-toolbar-item"
            style={{backgroundColor:blendWithWhite(rect.color, 0.5),
                    borderColor:addAlphaToRGB(rect.color, 0.9)}}>
           <div className="left-flex-content">
              <span style={{backgroundColor:addAlphaToRGB(rect.color, 0.35)}} >{rect.index}</span>          
              <div style={{backgroundColor:"rgba(255,255,255,0.5)"}}>
                    {rect.label!="" ? rect.label : "Unlabeled"}
              </div>
           </div>
           <div className="right-flex-content">
            <img onClick={onVisibilityChange} className="hide-toolbar-item" src={rect.hidden ? invisible : visible} width="22px"/>
            <img onClick={onItemCollapse} className="expand-toolbar-item" src={(rectCollapse || rectCollapse==undefined) ? down_arrow : up_arrow} width="18px"/>
           </div>
        </div>
        <div className={itemContentClassName} style={{backgroundColor:blendWithWhite(rect.color, 0.2)}}>
            <textarea 
              ref={textAreaRef}
              onChange={(e) => setItemTextContent(e)}
              onFocus={saveSnapshot}
              value={textAreaContent}
              spellCheck="false">
            </textarea>
        </div>
      </div>
    )
}