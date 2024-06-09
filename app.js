const fs = require("fs/promises");

// open (32) file descriptor
// Read or write

(async () => {
  const createFile = async (path) => {
    try {
      // we want to check whether or not we already have that file
      const existingFileHandle = await fs.open(path, "r");
      existingFileHandle?.close();
      // We alraeady have that file
      return console.log(`The file ${path} already exists`);
    } catch (err) {
      // We don't have that file, now we should create it
      const newFileHandle = await fs.open(path, "w");
      console.log("A new file successfuly created");
      newFileHandle.close();
    }
  };

  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      //   await fs.rm(path, { recursive: true});
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(`The file ${oldPath} does not exist`);
      } else {
        console.log("An error occured while removing the file");
      }
    }
  };

  const renameFile = async (oldPath, newPath) => {
    console.log(`Renaming ${oldPath} to ${newPath}`);
    try {
      await fs.rename(oldPath, newPath);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.log(`The file ${oldPath} does not exist`);
      } else {
        console.log("An error occured while removing the file");
      }
    }
  };

  let addedContent;

  const addToFile = async (path, content) => {
    if (addedContent === content) return;
    try {
      const existingFileHandle = await fs.open(path, "a");
      existingFileHandle.write(content);
      addedContent = content;
      existingFileHandle.close();
      //   await fs.appendFile(path, content);

      console.log("Content added successfully");
    } catch (err) {
      console.log(`The file ${path} does not exist`);
    }
  };
  // commands
  const CREATE_FILE = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("change", async () => {
    //get the size of our file
    const size = (await commandFileHandler.stat()).size;
    // allocate our buffer with the size of file
    const buf = Buffer.alloc(size);
    // the location at which we want to start filling our buffer
    const offset = 0;
    // how many buytes we want to read
    const length = buf.byteLength;
    // the position in the file where we want to start reading
    const position = 0;

    // we always want to read the whole content (from begining all the way to the end)
    await commandFileHandler.read(buf, offset, length, position);

    // decoder 01 => meaninfull
    // encoder meaningfull => 01
    const command = buf.toString("utf-8");
    // create a file
    // Create a file <path>
    if (command.includes(CREATE_FILE)) {
      const filePath = command.substring(CREATE_FILE.length).trim();
      createFile(filePath);
    }

    // delete a file
    // delete a file <path>
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length).trim();
      deleteFile(filePath);
    }

    // rename file
    // rename the file <oldPath> to <newPath>
    if (command.includes(RENAME_FILE)) {
      //   const _idx = command.indexOf(" to ");
      //   const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx)
      //   const newFilePath = command.substring(_idx + 4)

      const [oldPath, newPath] = command
        .substring(RENAME_FILE.length + 1)
        .trim()
        .split("to")
        .map((path) => path.trim());
      renameFile(oldPath, newPath);
    }

    // add to file
    // add to the file <path> this content: <content>
    if (command.includes(ADD_TO_FILE)) {
      //   const _idx = command.indexOf("this content:");
      //   const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      //   const content = command.substring(_idx + 15);
      const [filePath, content] = command
        .substring(ADD_TO_FILE.length + 1)
        .trim()
        .split("this content:")
        .map((path) => path.trim());
      addToFile(filePath, content);
    }
  });

  // watcher ...
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("change");
    }
  }
})();
