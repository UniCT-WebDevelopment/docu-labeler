const fs = require("fs");
const path = require("path");

function deleteFolderRecursiveSync(folderPath) {
    if (fs.existsSync(folderPath)) {
      fs.readdirSync(folderPath).forEach((file) => {
        const curPath = path.join(folderPath, file);
  
        if (fs.statSync(curPath).isDirectory()) {
          // Recursively call deleteFolderRecursiveSync for subdirectories
          deleteFolderRecursiveSync(curPath);
        } else {
          // Delete the file
          fs.unlinkSync(curPath);
        }
      });
  
      // Remove the empty directory
      fs.rmdirSync(folderPath);
    }
}

const storeTaskFiles = async(project_id, task_id, files) => {
  if (!Array.isArray(files)) {
      // Convert to an array if only one file is uploaded
      files = [files];
  }

  // Project folder
  const uploadPathProject = path.join(__dirname, 'storage/project_data', project_id);
  // Project/Task folder
  const uploadPathTask = path.join(uploadPathProject, task_id)
  // Create DIRs if they do not exist
  try {
      if (!fs.existsSync(uploadPathProject)) {
          fs.mkdirSync(uploadPathProject); 
          if (!fs.existsSync(uploadPathTask)) {
              fs.mkdirSync(uploadPathTask); 
          } 
      } else if(!fs.existsSync(uploadPathTask)) {
          fs.mkdirSync(uploadPathTask); 
      }
      // Save each file 
      const filePromises = files.map(async (file) => {
          const fileName = file.name;
          const filePath = path.join(uploadPathTask, fileName);
          //console.log("Path file!!", filePath);

          return new Promise((resolve, reject) => {
              file.mv(filePath, (err) => {
                  if (err) {
                      console.error('Error uploading file:', err);
                      reject(err);
                  } else {
                      console.log(`File ${fileName} uploaded successfully.`);
                      resolve(filePath);
                  }
              });
          });
      });
      await Promise.all(filePromises);
  } catch (error) {
      console.error(error);
      return "";
  }
  return uploadPathTask;
}

async function findDir(path, query) {
  fs.readdirSync(path).forEach((dir) => {
    console.log("query path", query, path);
      if(dir==query) {
          return true
      }
  })
  return false;
}

async function loadFirstImage(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    const imageFile = files.find(file => file.endsWith('.png') || file.endsWith('.jpg')
                                ||file.endsWith('.PNG'));

    if (!imageFile) {
        throw new Error('No image files found in the directory');
    }

    const imagePath = path.join(directoryPath, imageFile);
    return fs.readFileSync(imagePath);
}

module.exports = {
    deleteFolderRecursiveSync,
    storeTaskFiles,
    findDir,
    loadFirstImage,
};