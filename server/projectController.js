const fs = require("fs");

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

module.exports = {
    deleteFolderRecursiveSync
};