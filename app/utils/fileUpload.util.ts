import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        error: "No image provided.",
      });
    }

    let filetype: string = "";

    // Validate mimetype
    if (req.file.mimetype === "image/jpg") {
      filetype = "jpg";
    } else if (req.file.mimetype === "image/jpeg") {
      filetype = "jpeg";
    } else if (req.file.mimetype === "image/png") {
      filetype = "png";
    } else {
      return res.status(400).json({
        status: false,
        message: "Failed to upload image.",
        error: {
          msg: "Please check the file type. Only .jpg, .jpeg, .png allowed",
          param: "file",
          location: "images",
        },
      });
    }

    const serverDirectory = "server";
    const uploadEndpoint = "/storages/uploads/images/";
    const fileName = `${Math.floor(100000 + Math.random() * 900000)}.${filetype}`;

    // Resolve the full directory path
    const uploadDir = path.resolve(__dirname, `../../${serverDirectory}${uploadEndpoint}`);
    const fullFilePath = path.join(uploadDir, fileName);

    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(fullFilePath, req.file.buffer);

    // Send success response
    return {
      status: true,
      message: "Image uploaded successfully.",
      filePath: `${serverDirectory}${uploadEndpoint}${fileName}`,
    };
  } catch (error) {
    console.error("Error uploading image:", error);

 
  }
};

export { uploadImage };
