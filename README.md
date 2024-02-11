# DocuLabeler
**DocuLabeler** is an open-source labeling and annotation tool designed for efficiently labeling document images. With its user-friendly interface and integration with the **Tesseract OCR Engine**, it streamlines text detection and recognition, making the annotation 
process both fast and precise. Beyond its primary function, DocuLabeler can be utilized to prepare datasets for tasks such as object detection and recognition. Raw data can then be exported and used to train or finetune your ML models.

## Features
The workflow in DocuLabeler is straightforward. When you first launch the application, you will be prompted to either register as a new user or log in as a guest. The primary distinction between the two is that guest users do not have the ability to create their personal 
projects. <br>

Once you've logged in for the first time, you can create a project by clicking the **Create** button located in the upper right corner. You'll be prompted to provide a project name and, if desired, a list of labels.  Each project consists of smaller tasks, and each newly created task must include at least one image. Furthermore, task names within the same project must be unique. Once a task is created, you can click the **Open** button to begin annotating the images.<br>
### Annotation
Once inside the annotation component, you can navigate through the task images by using the left and right arrows on the top of the screen or the left and right arrow keys. Annotations are **automatically saved** each time you move to a different image, so don't worry too much about saving constantly! <br>

Doculaber offers **four main** annotation modes:

- *Selection Mode*
- *Movement Mode*
- *Drawing Mode*
- *Labeling Mode*

#### Selection Mode
In *Selection Mode*  you can select and resize existing rectangles by using the left mouse button. Hold down CTRL to select multiple rectangles simultaneously. To delete all selected rectangles press DELETE. You can also double-click on a rectangle to focus on the respective item in the right toolbar. To adjust the viewport's position or zoom click or scroll the mouse wheel, respectively.

#### Movement Mode
In *Movement Mode* you can freely adjust the viewport's position and zoom by holding down the left mouse or mouse wheel while dragging.

#### Drawing Mode
In *Drawing Mode* you have the capability to create annotation rectangles. To start drawing a rectangle, simply click the left mouse button once, and click again to finalize it. If you've selected one of your labels, by clicking on it at the bottom of the screen, the rectangle will be labeled accordingly. If no label is currently selected, the rectangle will be marked as "Unlabeled."

#### Labeling Mode
In *Labeling Mode* you can quickly change your annotations' labels. Simply select one of your labels and left-click on the rectangles you want to re-label.
<br>
### Integrated OCR Engine
In addition to the previously discussed features, DocuLabeler includes seamless integration with the powerful **Tesseract OCR Engine**. Tesseract provides a swift and accurate way for automatically annotating textual content within documents. To utilize it, just click on the **Apply OCR** icon located in the left toolbar. It will rapidly *detect and recognize text* within the current image, streamlining the document annotation process. 

### Data Export
Once you've completed the annotation process for your dataset of images, it's time to export the data for your use. You can export the annotations of a single task by selecting the **Export** option from the task's dropdown menu. You'll have the option to include the task images in the export. Right now only two standard formats are supported:
- YOLOv1
- Raw JSON

#### YOLOv1
This format is the standard choice for training the popular YOLO family of models. For each image, a list of its annotations is saved in a .txt file bearing the image's name. Each annotation is defined by a class ID and four values, all normalized between 0 and 1. These values represent the x and y coordinates of the annotation's center, as well as its width and height, all relative to the image's dimensions.
#### Raw JSON
This format retains all information about the labels in its raw form, but it requires parsing to obtain the desired data format. 

## How To Install
#### Requirements
* Node.js version *18.16.1*
* NPM version *9.5.1*
* MongoDB version *7.0.1*
* Tesseract version *5.3.1*

#### 1 - Install the required Node.js dependencies
After cloning DocuLabeler's repository locally, you'll have to install the Node.js required packages for both the Client and Server components. To do so:
1. Run "npm install" from inside of the folder "docu-labeler/doculabeler"
2. Run "npm install" from inside of the folder "docu-labeler/server"

#### 2 - Initialize the MongoDB Database
In order to do so you can run the script **initialize_database.js** inside *"docu-labeler/server/scripts"* using Node.js. The script creates the database automatically, but assumes that your deployment can be accessed locally from MongoDB's standard port 27017. If that's not the case, the script should be modified accordingly.

#### 3 - Start the application
At this point everything should be ready. To start the server place yourself inside of the folder *"docu-labeler/server"* and run **"node main.js"**. To start the client application place yourself inside of the folder *"docu-labeler/doculabeler"* and run **"npm start"**.

### Notes
- In order to use Tesseract in your annotation workflow, you'll have to install it and add it to your system's PATH environment variable.
- If you want to allow multiple users to use the application you will have to change the value of the environment variable "DOCULABELER_API_ADDRESS", which can be found in the *"docu-labeler/doculabeler/.env"* file, so that it contains the IP address and port number of the server.





  



  
