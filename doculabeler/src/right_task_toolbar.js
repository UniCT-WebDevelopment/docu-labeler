import { RightTaskToolbarItem } from "./right_task_toolbar_item";
import expand_all from "./img/expand-all.png"
import collapse_all from "./img/collapse-all.png"
import save_items from "./img/save_white.png"
import { useState, useEffect } from "react";

export const RightTaskAnnotationToolbar = (params) => {
    const rectangles = params.rectangles;
    const onRectUpdate = params.onRectUpdate;
    const onRectChange = params.onRectChange;
    const saveSnapshot = params.saveSnapshot;

    const [rectanglesCollapsedStates, setRectanglesCollapsedStates] = useState(
        rectangles.map((rect) => rect.collapsed)
    );

    const handleCollapseAllObjects = (e) => {
        const newState = rectangles.map(() => true);
        setRectanglesCollapsedStates(newState);
        for(let i=0; i<rectangles.length; i++) {
            rectangles[i].collapsed = true;
        };
    }

    const handleExpandAllObjects = (e) => {
        const newState = rectangles.map(() => false);
        setRectanglesCollapsedStates(newState);
        for(let i=0; i<rectangles.length; i++) {
            rectangles[i].collapsed = false;
        };
    }

    const handleItemCollapse = (index) => {
        const newStates = [...rectanglesCollapsedStates];
        newStates[index] = !newStates[index];
        setRectanglesCollapsedStates(newStates);
        rectangles[index].collapsed = !newStates[index]
      };

    useEffect( () => {
        const newState = rectangles.map((rectangle) => rectangle.collapsed);
        setRectanglesCollapsedStates(newState);
    }, [rectangles]);
    return (
        <div id="right-task-annotation-toolbar">
            <div id="right-task-annotation-icon-container"> 
                <div id="right-task-annotation-icon-container-l">
                    <img src={save_items} 
                        width="0px" 
                        title="Save objects"
                        onClick={()=> {console.log("Salva!")}}>
                    </img>
                </div>
                <div id="right-task-annotation-icon-container-r">
                    <img src={expand_all} 
                        width="30px" 
                        title="Expand all objects"
                        onClick={handleExpandAllObjects}>
                    </img>
                    <img src={collapse_all} 
                        width="30px" 
                        title="Collapse all objects"
                        onClick={handleCollapseAllObjects}>
                    </img>
                </div>
            </div>
            <div id="right-task-toolbar-navbar">
                {
                    rectangles.map((rect, index) => (
                        <RightTaskToolbarItem 
                            rect={rect}
                            rectCollapse={rectanglesCollapsedStates[rect.index-1]}
                            onItemCollapse={()=> handleItemCollapse(index)}
                            isItemFocused={rect.textfocused}
                            rectangles={rectangles}
                            onRectUpdate={onRectUpdate}
                            onRectChange={onRectChange}
                            saveSnapshot={saveSnapshot}
                        />
                    ))
                }
            </div>
        </div>
    );
}