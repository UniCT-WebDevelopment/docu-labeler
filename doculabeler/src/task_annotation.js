import image from "./img/thumb_placeholder.jpg"
import { useState, useRef, useEffect} from "react";
import { NavBar } from "./navbar";
import { LeftTaskAnnotationToolbar } from "./left_task_toolbar";
import { RightTaskAnnotationToolbar } from "./right_task_toolbar";
import { useParams } from 'react-router-dom';
import { TextLabel, addAlphaToRGB} from "./text_label";
import { BottomTaskAnnotationBar } from "./bottom_task_annotation_bar";
import Cookies from 'universal-cookie';
import leftArrow from "./img/left_white.png";
import rightArrow from "./img/right_white.png";
import saveImg from "./img/save_white.png";
import load_icon from "./img/loader.png"

const apiAddress = process.env.REACT_APP_.DOCULABELER_API_ADDRESS;
const cookies = new Cookies();

var globalSvgHeight = 900;
var rectLabelFontSize = 11;
var maxHistoryLength = 20;

const uid = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

let imageZoomFactor = 1
export const TaskAnnotator = () => {

    //Da implementare per evitare che si rompa tutto
    const [requestsQueue, setRequestsQueue] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [rectChange, setRectChange] = useState(false);

    const [keyState, setKeyState] = useState({});

    const [snapshotList, setSnapshotList] = useState([]);

    const { project_id, task_id } = useParams();

    // StateVar per gestire zoom e pan dell'elemento SVG
    const [viewBox, setViewBox] = useState({ x: -200, y: 0, width: 1000, height: 600 });

    // StateVar per gestire la modalità di utilizzo dell'SVG
    const [currentMode, setCurrentMode] = useState('selectMode');

    //StateVar che indica se il mouse è dentro o fuori l'SVG
    const [isMouseOver, setMouseOver] = useState(false);

    // StateVars per gestire il drag del mouse nell'SVG
    const [isDragging, setIsDragging] = useState(false);
    const [startDragX, setStartDragX] = useState(0);
    const [startDragY, setStartDragY] = useState(0);

    const [isDrawingSelection, setIsDrawingSelection] = useState(0)

    // StateVars per gestire il ridimensionamento dei rettangoli
    const [isResizingRectangle, setIsResizingRectangle] = useState(false);
    const [resizeAngle, setResizeAngle] = useState("");
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartY, setResizeStartY] = useState(0);

    // StateVar per track della posizione del mouse nell'SVG
    const [mousePosition, setMousePosition] = useState({});

    //StateVars usate per il disegno di rettangoli
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });

    // StateVar che contiene i rettangoli creati sull'immagine
    const [rectangles, setRectangles] = useState([]);
    const [deletedRectUids, setDeletedRectUids] = useState([]);

    const [imageRectanglesDict, setImageRectanglesDict] = useState({});

    // StateVar che contiene l'ultimo rettangolo selezionato dall'utente
    const [focusedRect, setFocusedRect] = useState({x:-100000, y:-100000, width:0, height:0})

    // StateVar che contiene info del progetto
    const [projectInfo, setProjectInfo] = useState([]);
    // StateVar che contiene l'etichetta di default selezionata per l'annotazione
    const [activeLabel, setActiveLabel] = useState(["", "rgb(0,0,0)"])

    const [taskImagesTotal, setTaskImagesTotal] = useState(0);

    // L'ID dell'immagine da caricare per prima viene impostato a 0 di default. Se trovo un cookie relativo all'ID dell'ultima immagine annotata e il task ID ad
    // esso associato è uguale all'ID del task corrente uso quest'ultimo invece.
    const [currentImageId, setCurrentImageId] = useState(cookies.get("lastTaskId") == task_id && cookies.get("lastImageId") !== undefined ? cookies.get("lastImageId"):0);

    function saveSnapshot() {
        const snapshot = {
            rectangles: JSON.stringify(rectangles),
        }
        console.log("Salvo snapshot", snapshot);
        const updSnapshotList = [...snapshotList];
        if(updSnapshotList.length>maxHistoryLength)
            updSnapshotList.shift();
        updSnapshotList.push(snapshot);
        setSnapshotList(updSnapshotList);
    }


    const get_project_info = async () => {
        await fetch(`http://${apiAddress}/project/get_project_info`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id})
            //body: formData.toString()
        })
        .then(async response => await response.json())
        .then(data => {
            setProjectInfo(data.project_info);
        });
    }

    const get_task_images_len = async () => {
        console.log("Richiesto numero di immagini per il task");
        await fetch(`http://${apiAddress}/task/get_task_images_len`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, task_id})
            //body: formData.toString()
        })
        .then(async response => await response.json())
        .then(data => {
            setTaskImagesTotal(data.task_images);
        });
    }

    const get_task_image = async () => {
        console.log("Richiesta immagine task numero", currentImageId);
        await fetch(`http://${apiAddress}/task/get_task_image`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, task_id, currentImageId})
            //body: formData.toString()
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error("Error on images retrieval");
            }
            return response.blob();
        })
        .then((blob) => {
            const imgElement = document.getElementById('main-img');
            const imageUrl = URL.createObjectURL(blob);
            imgElement.setAttribute("href", imageUrl);
        });
    }

    const get_task_annotations = async () => {
        console.log("GET TASK ANNOTATIONS")
        await fetch(`http://${apiAddress}/annotation/get_task_annotations`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, task_id})
            //body: formData.toString()
        })
        .then(async response => await response.json())
        .then(data => {
            console.log("Data task", data);
            if(data.annotations!=null || data.annotations!=undefined) {
                setImageRectanglesDict(data.annotations);
                setRectangles(data.annotations[currentImageId])
            }
            console.log("Retrieved labels:", data.annotations);
            console.log("Current ID image", currentImageId);
        });
    }

    const init_image_rect_dict = () => {
        let imgRectDict = {};
        for(let i=0; i<taskImagesTotal; i++) {
            imgRectDict[i] = []
        }
        setImageRectanglesDict(imgRectDict);
    }

    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
          ref.current = value;
        }, [value]);
        return ref.current;
    }

    const sendRequest = async (requestFunction) => {
        try {
            // console.log(requestFunction)
            await requestFunction();
        } catch (error) {
            // Handle errors here
            console.error('Request error:', error);
        }
    };

    const enqueueRequest = (requestFunction) => {
        setRequestsQueue((prevQueue) => [...prevQueue, requestFunction]);
    };

    useEffect(() => {
        // Process requests in the queue when not already processing
        if (!isProcessing && requestsQueue.length > 0) {

          setIsProcessing(true);
    
          // Dequeue the next request and send it to the server
          const nextRequest = requestsQueue.shift();
          // console.log("Processo richiesta in coda", nextRequest)

          sendRequest(nextRequest)
            .then(() => {
              // Request completed successfully
              setIsProcessing(false);
            })
            .catch((error) => {
              // Handle errors here
              setIsProcessing(false);
            });
        }
      }, [requestsQueue, isProcessing]);

    useEffect(()=> {
        get_task_images_len();
        //get_task_image();
        setIsLoading(true);
        enqueueRequest(get_task_annotations);
        enqueueRequest(get_project_info);
        enqueueRequest(() => setIsLoading(false));
        enqueueRequest(() => get_task_image())
    }, [])

    useEffect(() => {
        const handleKeyDown = (e) => {
          setKeyState((prevState) => ({
            ...prevState,
            [e.keyCode]: true,
          }));
        };
    
        const handleKeyUp = (e) => {
          setKeyState((prevState) => ({
            ...prevState,
            [e.keyCode]: false,
          }));
        };
    
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.removeEventListener('keyup', handleKeyUp);
        };
      }, []);

    useEffect(() => {
        if (keyState[17] && keyState[90]) {
            if(snapshotList.length>0) {
                const updSnapshotList = [...snapshotList];

                const prevSnapshot = updSnapshotList.pop();

                setRectangles(JSON.parse(prevSnapshot.rectangles));
                setSnapshotList(updSnapshotList);
            }
        }
    }, [keyState]);

    var prevImageId = usePrevious(currentImageId);

    useEffect(() => {
        init_image_rect_dict();
    }, [taskImagesTotal])

    useEffect(() => {
        if(prevImageId!==undefined) {
            setSnapshotList([]);
            console.log("USEEFFECT: Cerco di recuperare l'immagine", currentImageId)
            enqueueRequest(get_task_image());
            // Se è stata modificata qualcosa nelle annotazioni le salvo a DB

            let updatedRectDict = imageRectanglesDict
            updatedRectDict[prevImageId] = rectangles;
            setRectangles(updatedRectDict[currentImageId]);
            setImageRectanglesDict(updatedRectDict);
            
            setFocusedRect({x:-100000, y:-100000, width:0, height:0})
            if (rectChange) {
                enqueueRequest(handleAutoSaveTaskLabels(prevImageId));
                setRectChange(false);
            }
        }
        //
    }, [currentImageId])

    const handleWheel = (e) => {
        let svgWidth = window.innerWidth*0.94736; 
        let svgHeight = globalSvgHeight;
        //console.log(window.innerWidth*0.66666)
        console.log("Valore deltaY: ", e.deltaY)
        const scaleFactor = (imageZoomFactor < 0.10 && e.deltaY < 0) || (imageZoomFactor > 3 && e.deltaY > 0) || e.deltaY == 0 ? 1 : 1.1 
        imageZoomFactor = e.deltaY > 0 ? imageZoomFactor * scaleFactor : imageZoomFactor / scaleFactor
        const mouseX = e.nativeEvent.offsetX;
        const mouseY = e.nativeEvent.offsetY;

        const fixedX = viewBox.x + mouseX * (viewBox.width / svgWidth);
        const fixedY = viewBox.y + mouseY * (viewBox.height / svgHeight);
        //console.log("mouse", mouseX, mouseY);

        // Calculate new dimensions for viewBox
        const newWidth = e.deltaY > 0 ? viewBox.width * scaleFactor : viewBox.width / scaleFactor;
        const newHeight = e.deltaY > 0 ? viewBox.height * scaleFactor : viewBox.height / scaleFactor;

        // Calculate new x and y values to keep the mouse pointer centered
        const newX = e.deltaY > 0 ? fixedX - (fixedX - viewBox.x) * scaleFactor : fixedX - (fixedX - viewBox.x) / scaleFactor;
        const newY = e.deltaY > 0 ? fixedY - (fixedY - viewBox.y) * scaleFactor : fixedY - (fixedY - viewBox.y) / scaleFactor;

        const deltaX = (mouseX / svgWidth) * viewBox.width;
        const deltaY = (viewBox.height - newHeight) * (mouseY / globalSvgHeight);


        //console.log("new w/h", newWidth, newHeight)
        // Update the viewBox
        setViewBox({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        });
    }

    const handleMouseDown = (e) => {
        if((["moveMode"].includes(currentMode) && [0,1].includes(e.button)) ||
            (["selectMode", "drawRectMode", "labelMode"].includes(currentMode) && e.button === 1)) {
            setIsDragging(true);
            setStartDragX(e.clientX);
            setStartDragY(e.clientY);
        } else if (currentMode === 'drawRectMode' && e.button==0) {
            handleCanvasClick(e);
        } else if (currentMode === 'selectMode') {
            if (e.target.tagName === 'circle') {
                //console.log("Click su vertice");
                saveSnapshot();
                const cornerClass = e.target.getAttribute('class').split(" ")[1];
                setResizeAngle(cornerClass);
                setIsResizingRectangle(true);
                setResizeStartX(mousePosition.x);
                setResizeStartY(mousePosition.y);
            }
            else if (e.target.tagName == 'image' && e.button == 0) {
                console.log("Ho cliccato sul canvas, ma su nessun oggetto")
                console.log(e.button);
                if(!isDrawingSelection) {
                    const svgPoint = mousePosition;
                    setStartPoint({ x: svgPoint.x, y: svgPoint.y });
                    setIsDrawingSelection(true);
                }
            }
        }

    };

    const handleMouseMove = (e) => {
        if (isDragging) {
        const deltaX = (e.clientX - startDragX) * imageZoomFactor;
        const deltaY = (e.clientY - startDragY) * imageZoomFactor;
        
        // Update the viewBox based on the mouse drag
        setViewBox({
        x: viewBox.x - deltaX,
        y: viewBox.y - deltaY,
        width: viewBox.width,
        height: viewBox.height,
        });

        // Update the start position for the next move event
        setStartDragX(e.clientX);
        setStartDragY(e.clientY);
        }
        else if(isResizingRectangle) {
            // NOOOO!! non funziona

            const svg = e.currentTarget;
            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
            const deltaX = svgPoint.x - resizeStartX;
            const deltaY = svgPoint.y - resizeStartY;
            switch(resizeAngle) {
            case "one": 
                if(focusedRect.width + deltaX > 0) {
                    focusedRect.x += deltaX;
                    focusedRect.width -= deltaX;
                    setResizeStartX(svgPoint.x);
                }
                if(focusedRect.height + deltaY >0) {
                    focusedRect.y += deltaY;
                    focusedRect.height -= deltaY;
                    setResizeStartY(svgPoint.y);   
                }
                break;   
            case "two":
                if(focusedRect.width + deltaX > 0) {
                    focusedRect.width += deltaX;
                    setResizeStartX(svgPoint.x);
                }
                if(focusedRect.height + deltaY >0) {
                    focusedRect.y += deltaY;
                    focusedRect.height -= deltaY;
                    setResizeStartY(svgPoint.y);   
                }
                break;  
            case "three":
                if(focusedRect.width + deltaX > 0) {
                    focusedRect.width += deltaX;
                    setResizeStartX(svgPoint.x);
                }
                if(focusedRect.height + deltaY >0) {
                    focusedRect.height += deltaY;
                    setResizeStartY(svgPoint.y);   
                }
                break;   
            case "four": 
                if(focusedRect.width + deltaX > 0) {
                    focusedRect.x += deltaX;
                    focusedRect.width -= deltaX;
                    setResizeStartX(svgPoint.x);
                }
                if(focusedRect.height + deltaY >0) {
                    focusedRect.height += deltaY;
                    setResizeStartY(svgPoint.y);   
                }
                break; 
            
            }

        }
        else if(currentMode=="drawRectMode" || currentMode=="selectMode" || currentMode=="labelMode") {
            const svg = e.currentTarget;
            const point = svg.createSVGPoint();
            point.x = e.clientX;
            point.y = e.clientY;
            const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
            setMousePosition({ x: svgPoint.x, y: svgPoint.y });
            //console.log(mousePosition);
        }
    
    };

    //const rectanglesIntersect = (left1, top1, right1, bottom1, left2, top2, right2, bottom2) =>{
    //    return !(left2 > right1 ||
    //            right2 < left1 ||
    //            top2 > bottom1 ||
    //            bottom2 < top1);
    //}

    const rectanglesIntersect = (rectangle1, rectangle2) => {
        // Extract coordinates from rectangles
        let [x1_1, y1_1, x2_1, y2_1] = rectangle1
        let [x1_2, y1_2, x2_2, y2_2] = rectangle2

        // Check for no overlap
        if (x2_1 <= x1_2 || x2_2 <= x1_1 || y2_1 <= y1_2 || y2_2 <= y1_1)
            return false  // No overlap, return 0%

        // Calculate intersection coordinates
        let x_intersection = Math.max(0, Math.min(x2_1, x2_2) - Math.max(x1_1, x1_2))
        let y_intersection = Math.max(0, Math.min(y2_1, y2_2) - Math.max(y1_1, y1_2))

        // Calculate areas of rectangles and intersection
        let area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
        let area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
        let intersection_area = x_intersection * y_intersection
        // Calculate union area
        let union_area = area1 + area2 - intersection_area

        // Check for no overlap
        if (union_area == 0)
            return false  // No overlap, return 0%
        return true
    }
    

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizingRectangle(false);
        if(isDrawingSelection) {
            const svgPoint = mousePosition;
            setEndPoint({ x: svgPoint.x, y: svgPoint.y });
            let tmp = []
            if (svgPoint.x < startPoint.x || svgPoint.y < startPoint.y) {
                tmp = [startPoint.x, startPoint.y];
                startPoint.x = svgPoint.x;
                startPoint.y = svgPoint.y;
                svgPoint.x = tmp[0];
                svgPoint.y = tmp[1];
            }
            //console.log("start e endpoint del box di selezione", startPoint, { x: svgPoint.x, y: svgPoint.y });
            let selectedRectangles = [...rectangles]
            for(let rectangle of selectedRectangles) {
                let [x1, y1, x2, y2] = [rectangle.x - rectangle.width/2, rectangle.y - rectangle.height/2, 
                rectangle.x + rectangle.width/2, rectangle.y + rectangle.height/2];
                rectangle.selected = rectanglesIntersect([x1,y1,x2,y2], [startPoint.x, startPoint.y, svgPoint.x, svgPoint.y])
                //console.log(x1,y1,x2,y2,rectangle.selected)
            }
            setRectangles(selectedRectangles)
            setIsDrawingSelection(false);

        }
    }

    const handleMouseLeave = () => {
        setIsDragging(false);
        setMouseOver(false);
    };

    const handleMouseEnter = () => {
        setMouseOver(true);
    };

    const handleCanvasClick = (e) => {
        if (!isDrawing) {
            saveSnapshot();
            // First click to start drawing
            const svgPoint = mousePosition;
            setStartPoint({ x: svgPoint.x, y: svgPoint.y });
            setIsDrawing(true);
            //console.log("primo punto", svgPoint.x, svgPoint.y)

        } else {
            // Second click to finalize the rectangle
            const svgPoint = mousePosition;
            setEndPoint({ x: svgPoint.x, y: svgPoint.y });
            setIsDrawing(false);
            //console.log("secondo punto", svgPoint.x, svgPoint.y)            
            // Create a rectangle object and add it to the list
            const newRectangle = {
                index: rectangles.length+1,
                uid: uid(),
                x: Math.min(startPoint.x, svgPoint.x),
                y: Math.min(startPoint.y, svgPoint.y),
                width: Math.abs(startPoint.x - svgPoint.x),
                height: Math.abs(startPoint.y - svgPoint.y),
                label: activeLabel[0],
                color: activeLabel[1],
                textcontent: "",
                selected: false,
                hidden: false,
                collapsed: true,
                deleted: false,
                textfocused: false,
            };
            let newRectangles = rectangles
            rectangles.push(newRectangle);
            setRectangles(newRectangles);
            setRectChange(true);
        }
    };

    const handleRectClick = (e) => {
        if (currentMode!="selectMode" && currentMode!="labelMode") {
            return;
        }
        if (currentMode=="selectMode"){
            if(!e.ctrlKey) {
                setFocusedRect({x:-100000, y:-100000, width:0, height:0});
                for(let rect of rectangles) {
                    rect.selected = false;
                }
            }
            for(let rect of rectangles) {
                rect.textfocused = false;
            }
            if (e.target.tagName === 'rect') {
                // Find the corresponding rectangle object
                const clickedRectIdx = rectangles.findIndex(
                  (rect) =>
                    !rect.hidden &&
                    rect.x <= mousePosition.x &&
                    mousePosition.x <= rect.x + rect.width &&
                    rect.y <= mousePosition.y &&
                    mousePosition.y <= rect.y + rect.height
                );
                // If a rectangle was found, handle the click
                if (clickedRectIdx != -1) {
                    rectangles[clickedRectIdx].selected=true;
                    setFocusedRect(rectangles[clickedRectIdx])
                    if(e.detail==2) {
                        console.log("doppio click sul rett")
                        saveSnapshot();
                        let updatedRect = [...rectangles]
                        updatedRect[clickedRectIdx].collapsed=!updatedRect[clickedRectIdx].collapsed;
                        !updatedRect[clickedRectIdx].collapsed ? updatedRect[clickedRectIdx].textfocused=true : updatedRect[clickedRectIdx].textfocused=false;
                        setRectangles(updatedRect);
                    }
                }
            }
        }
        if (currentMode=="labelMode") {
            if(!e.ctrlKey) {
                setFocusedRect({x:-100000, y:-100000, width:0, height:0});
                for(let rect of rectangles) {
                    rect.selected = false;
                }
            }
            for(let rect of rectangles) {
                rect.textfocused = false;
            }
            if (e.target.tagName === 'rect') {
                const clickedRectIdx = rectangles.findIndex(
                    (rect) =>
                      !rect.hidden &&
                      rect.x <= mousePosition.x &&
                      mousePosition.x <= rect.x + rect.width &&
                      rect.y <= mousePosition.y &&
                      mousePosition.y <= rect.y + rect.height
                  );
                  if (clickedRectIdx != -1) {
                    console.log("Cliccato rettangolo", clickedRectIdx);
                    saveSnapshot();
                    let updatedRect = [...rectangles]
                    updatedRect[clickedRectIdx].selected=true;
                    updatedRect[clickedRectIdx].label = activeLabel[0];
                    updatedRect[clickedRectIdx].color = activeLabel[1];
                    setRectangles(updatedRect);
                    setRectChange(true);
                }
            }
        }
        
    }

    const handleKeyPress = (e) => {
        // Cancellazione annotazioni
        switch(e.key){
            //CANC
            case "Delete":
                saveSnapshot();
                setFocusedRect({x:-100000, y:-100000, width:0, height:0});

                let deletedRects = rectangles.filter((rect) => rect.selected==true);
                const updatedDeletedRectUids = deletedRectUids;
                const justDeletedRectUids = deletedRects.map((rect) => rect.uid);

                updatedDeletedRectUids.push(...justDeletedRectUids);
                console.log(updatedDeletedRectUids);
                setDeletedRectUids(updatedDeletedRectUids);

                let updatedRects = rectangles.filter((rect) => rect.selected==false);

                for(let i=1; i<=updatedRects.length; i++) {
                    //console.log(updatedRects[i], i)
                    updatedRects[i-1].index = i;
                    
                }
                //console.log(updatedRects);
                setRectangles(updatedRects);
                setRectChange(true);
                break;
            //LEFT ARROW
            case "ArrowLeft":
                console.log("leftarr")
                onPrevClick();
                break;
            // RIGHT ARROW
            case "ArrowRight":
                onNextClick();
                break;
        }
    }

    // Function to handle next image button click
    const onNextClick = () => {
        let imageSlider = document.getElementById("carousel-slider")

        if(imageSlider.value < taskImagesTotal-1) {
            imageSlider.value = parseInt(imageSlider.value) + 1
            setCurrentImageId(imageSlider.value);
            cookies.set("lastImageId", imageSlider.value, { path: '/' })
            cookies.set("lastTaskId", task_id, { path: '/' })
            imageZoomFactor = 1
            setViewBox({ x: -200, y: 0, width: 1000, height: 600 });
        } 
    }

    const applyTesseractOcr = async () => {
        saveSnapshot();
        function blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
        let base64Image = "";
        await fetch(`http://${apiAddress}/task/get_task_image`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, task_id, currentImageId})
            //body: formData.toString()
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error("Error on images retrieval");
            }
            return response.blob();
        })
        .then(async (blob) => {
            base64Image = await blobToBase64(blob);
        });

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        let raw = {
            "image": base64Image,
            "flags": {
                "viewportSize": 400,
                "offsetX": 100,
            }
        }
        
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(raw),
            redirect: 'follow',
            mode: 'cors', // Allow cross-origin requests
            credentials: 'same-origin',
          };
          
        await fetch("http://127.0.0.1:8081/apply_tesseract_ocr", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result)
            let ocrResult = result["result"];
            console.log(ocrResult);
            let newRectangles = rectangles
            for(let item of ocrResult) {
                const newRectangle = {
                    index: rectangles.length+1,
                    uid: uid(),
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    label: "",
                    color: "rgb(0,0,0)",
                    textcontent: item.textcontent,
                    selected: false,
                    hidden: false,
                    collapsed: true,
                    deleted: false,
                    textfocused: false,
                };
                console.log(newRectangle);
                rectangles.push(newRectangle);
            }
            setRectangles(newRectangles);
            setRectChange(true);
        
        })
        .catch(error => console.log('error', error));
    }

    const applyTesseractOcrNode = async() => {
        saveSnapshot();
        await fetch(`http://${apiAddress}/annotation/get_image_ocr`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, task_id, currentImageId})
            //body: formData.toString()
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error("Error on OCR application");
            }
            return response.json()
        })
        .then(async (data) => {
            console.log(data)
            let ocrResult = data["result"];
            console.log(ocrResult);
            let newRectangles = rectangles
            for(let item of ocrResult) {
                const newRectangle = {
                    index: rectangles.length+1,
                    uid: uid(),
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    label: "",
                    color: "rgb(0,0,0)",
                    textcontent: item.textcontent,
                    selected: false,
                    hidden: false,
                    collapsed: true,
                    deleted: false,
                    textfocused: false,
                };
                console.log(newRectangle);
                rectangles.push(newRectangle);
            }
            setRectangles(newRectangles);
            setRectChange(true);
        });
    }

      // Function to handle previous image button click
    const onPrevClick = () => {
        let imageSlider = document.getElementById("carousel-slider")

        if(imageSlider.value > 0) {
            imageSlider.value= parseInt(imageSlider.value) - 1
            setCurrentImageId(imageSlider.value);
            cookies.set("lastImageId", imageSlider.value, { path: '/' })
            cookies.set("lastTaskId", task_id, { path: '/' })
            imageZoomFactor = 1
            setViewBox({ x: -200, y: 0, width: 1000, height: 600 });
        } 
    }

    const handleSaveTaskLabels = async () => {
        let updatedRectDict = imageRectanglesDict;
        updatedRectDict[currentImageId] = rectangles;
        for(let [key, _] of Object.entries(updatedRectDict)) {
            updatedRectDict[key].hidden=false;
            updatedRectDict[key].selected = false;
            updatedRectDict[key].hidden = false;
            updatedRectDict[key].collapsed = true;
            updatedRectDict[key].textfocused = false;
        }
        setImageRectanglesDict(updatedRectDict)
        setIsSavingAll(true);
        await fetch(`http://${apiAddress}/annotation/save_task_annotations`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, task_id, imageRectanglesDict, deletedRectUids})
            //body: formData.toString()
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error("Error on task labels save");
            }
            console.log("Salvato tutto");
        })
        .finally(() => {
            setIsSavingAll(false);
        })
    }

    const handleAutoSaveTaskLabels = async (imageID) => {
        let updatedRectDict = imageRectanglesDict;
        updatedRectDict[imageID] = rectangles;
        for(let [key, _] of Object.entries(updatedRectDict)) {
            updatedRectDict[key].hidden="false";
            updatedRectDict[key].selected = "false";
            updatedRectDict[key].hidden = "false";
            updatedRectDict[key].collapsed = "true";
            updatedRectDict[key].textfocused = "false";
        }
        setImageRectanglesDict(updatedRectDict)
        setIsSavingAll(true);
        await fetch(`http://${apiAddress}/annotation/save_task_annotations`, {
            method: 'POST',
            headers: {
                //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({project_id, task_id, imageRectanglesDict, deletedRectUids})
            //body: formData.toString()
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error("Error on task labels save");
            }
            console.log("Salvato tutto");
        })
        .finally(() => {
            setIsSavingAll(false);
        })
    }

    const handleImageSlider = (e) => {
        console.log(e.target.value);
        setCurrentImageId(e.target.value);
        cookies.set("lastImageId", e.target.value, { path: '/' });
        cookies.set("lastTaskId", task_id, { path: '/' })
        imageZoomFactor = 1
        setViewBox({ x: -200, y: 0, width: 1000, height: 600 });
    }

    return (
        <div id="task-annotation-main">
            <NavBar hasCreateButton={false}/>
            {isLoading && 
                <div id="annotation-loading-div"> 
                    <img src={load_icon} id="annotation-loading-icon">
                    </img>
                </div>
            }
            {!isLoading &&
                <LeftTaskAnnotationToolbar 
                    currentMode={currentMode} 
                    modeSetter={setCurrentMode}
                    applyTesseractOcr={applyTesseractOcrNode}
                    projectId={project_id}>
                </LeftTaskAnnotationToolbar>
            }
            {!isLoading &&
                <RightTaskAnnotationToolbar 
                    currentMode={currentMode} 
                    rectangles={rectangles}
                    onRectUpdate={setRectangles}
                    onRectChange={() => setRectChange(true)}
                    saveSnapshot={() => saveSnapshot()}>
                </RightTaskAnnotationToolbar>}
            
            { !isLoading &&
                    //isSavingAll

                <div id="carousel-task-annotation" className="prevent-select">
                    <div id="save-task-div">
                        <img title="Save task labels" src={saveImg} width="33px" onClick={handleSaveTaskLabels}></img>
                        {isSavingAll && <img src={load_icon}  id="saving-task-data-icon" width="40px"></img>}
                    </div>
                    <img title="Previous Image" id="carousel-previous-arrow" src={leftArrow} width="40px" onClick={onPrevClick}/>
                    <input id="carousel-slider" type="range" min="0" max={taskImagesTotal-1} value={currentImageId} className="slider" onChange={handleImageSlider}></input>
                    <img title="Next Image" id="carousel-next-arrow" src={rightArrow} width="40px" onClick={onNextClick}/>
                    <input id="carousel-slider-value" value={parseInt(currentImageId)+1}></input>
                </div>
            }
            { !isLoading &&
                <svg id="task-annotation-svg" 
                    width="85%" 
                    height={globalSvgHeight+"px"}
                    tabIndex="0"
                    viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    onClick={handleRectClick}
                    onKeyDown={handleKeyPress}
                    style={{ cursor: currentMode === 'drawRectMode' ? 'crosshair' : 'default' }}
                >
                {/* OCCHIO ALLA WIDTH! NON DEVE CAMBIARE! SE SUCCEDE BISOGNA CAMBIARE IL VALORE PER L'EXPORT DI ETICHETTE*/}
                <image id="main-img" x="100" y="0" width="400px" href="" style={{ filter: "drop-shadow(3px 3px 2px rgba(0, 0, 0, 0.75))" }}/>
                {currentMode === 'drawRectMode' && 
                 isMouseOver && !isDrawing && (
                    <g>
                        {/* Vertical line */}
                        <line
                            x1={mousePosition.x}
                            y1="-1000"
                            x2={mousePosition.x}
                            y2="1000%"
                            stroke="red"
                            strokeWidth={1*imageZoomFactor}
                        />
                        {/* Horizontal line */}
                        <line
                            x1="-1000"
                            y1={mousePosition.y}
                            x2="1000%"
                            y2={mousePosition.y}
                            stroke="red"
                            strokeWidth={1*imageZoomFactor}

                        />
                    </g>
                )}
                {/* Disegna rettangoli*/}
                {rectangles.map((rect, index) => {
                    if(rect.hidden===false) 
                        return (
                            <g key={index} className=".svgText">
                                <rect
                                    x={rect.x}
                                    y={rect.y}
                                    width={rect.width}
                                    height={rect.height}
                                    fill={rect.selected ? addAlphaToRGB(rect.color, 0.2) : "rgba(0,0,0,0)"}
                                    stroke={rect.color}
                                    strokeWidth={0.8 * imageZoomFactor}
                                />
                                <rect
                                    className=".svgText"
                                    x={rect.x}  // Adjust this value to position the background rectangle as desired
                                    y={rect.y-rectLabelFontSize*1.2*imageZoomFactor}  // Adjust this value to position the background rectangle as desired
                                    width={rect.selected ? (rectLabelFontSize*rect.label.length*0.75*imageZoomFactor) : 0}   // Adjust the width of the background rectangle as needed
                                    height={rectLabelFontSize*1.2*imageZoomFactor} // Adjust the height of the background rectangle as needed
                                    fill={addAlphaToRGB(rect.color, 0.8)}// Set the background color to orange
                                    pointerEvents="none"
                                />
                                <text
                                    className=".svgText"
                                    x={rect.x+(rectLabelFontSize/4)*imageZoomFactor}  // Adjust this value to position the label as desired
                                    y={rect.y-(rectLabelFontSize/4)*imageZoomFactor}  // Adjust this value to position the label as desired
                                    fontSize={rect.selected ? rectLabelFontSize*imageZoomFactor : 0} // Adjust the font size as needed
                                    fill="black"  // Adjust the font color as needed
                                    fontFamily="ReadexPro Light"
                                    pointerEvents="none"
                                    style={{ userSelect: 'none' }}
                                    >
                                    {rect.label}
                                </text>
                            </g>
                        )
                })}
                {(focusedRect.hidden===false) && <g>
                    <circle className="focus-vertex one" fill={focusedRect.color} cx={focusedRect.x} cy={focusedRect.y} r={3.7*imageZoomFactor}/>
                    <circle className="focus-vertex two" fill={focusedRect.color} cx={focusedRect.x+focusedRect.width} cy={focusedRect.y} r={3.7*imageZoomFactor}/>
                    <circle className="focus-vertex three" fill={focusedRect.color} cx={focusedRect.x+focusedRect.width} cy={focusedRect.y+focusedRect.height} r={3.7*imageZoomFactor}/>
                    <circle className="focus-vertex four" fill={focusedRect.color} cx={focusedRect.x} cy={focusedRect.y+focusedRect.height} r={3.7*imageZoomFactor}/>
                </g>}
                {/* Preview del rettangolo che sto disegnando correntemente*/}
                {currentMode === 'drawRectMode' && isDrawing && (
                    <rect
                        x={Math.min(startPoint.x, mousePosition.x)}
                        y={Math.min(startPoint.y, mousePosition.y)}
                        width={Math.abs(startPoint.x - mousePosition.x)}
                        height={Math.abs(startPoint.y - mousePosition.y)}
                        fill={addAlphaToRGB(activeLabel[1], 0.3)}
                        stroke={activeLabel[1]}
                        strokeWidth={1.2*imageZoomFactor}
                        strokeDasharray="1" // Add dashes for preview effect
                    />
                )}
                {currentMode === 'selectMode' && isDrawingSelection && (
                    <rect
                        x={Math.min(startPoint.x, mousePosition.x)}
                        y={Math.min(startPoint.y, mousePosition.y)}
                        width={Math.abs(startPoint.x - mousePosition.x)}
                        height={Math.abs(startPoint.y - mousePosition.y)}
                        fill={addAlphaToRGB(activeLabel[1], 0.3)}
                        stroke={activeLabel[1]}
                        strokeWidth={1.2*imageZoomFactor}
                        strokeDasharray="1" // Add dashes for preview effect
                    />
                )}
            </svg>
            }
            {!isLoading && 
            <BottomTaskAnnotationBar 
                labels_list={projectInfo.labels}
                activeLabel={activeLabel}
                setActiveLabel={setActiveLabel}>
            </BottomTaskAnnotationBar>}
        </div>
    )
}