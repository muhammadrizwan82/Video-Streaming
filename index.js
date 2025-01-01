import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import cron from "node-cron";

const app = express();

let isProcessing = false; // Flag to track if a job is running
const BASEURL = process.env.BASEURL || 'http://localhost:8000';

if (!fs.existsSync(`./uploads/temp`)) {
    fs.mkdirSync(`./uploads/temp`, { recursive: true });
}

// Multer Middleware Configuration
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads/temp"); // Temporary storage
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
    },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Middleware
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Hello World" });
});

// Video Listing
app.get("/lesson", (req, res) => {
    const lessonsFilePath = `./uploads/courses/courses.json`;
    let lessons = [];

    if (fs.existsSync(lessonsFilePath)) {
        const fileContent = fs.readFileSync(lessonsFilePath, 'utf8');
        if (fileContent) {

            lessons = JSON.parse(fileContent).filter(x => x.isActive == true); // Parse the JSON file content into an array           
        }
    }
    res.status(200).json({ lessons });

});

// Get Video By LessonId
app.get("/lesson/:lessonId", (req, res) => {
    try {

        const lessonId = req.params.lessonId; // Retrieve 'id' from the path
        if (!lessonId) {
            return res.status(400).json({ message: "Lesson Id is required." });
        }

        const lessonsFilePath = `./uploads/courses/courses.json`;


        if (fs.existsSync(lessonsFilePath)) {
            const fileContent = fs.readFileSync(lessonsFilePath, 'utf8');
            if (fileContent) {
                const lesson = JSON.parse(fileContent).find(x => x.isActive == true && x.lessonId == lessonId)
                if (lesson) {
                    res.status(200).json(lesson);
                }
                else {
                    res.status(400).json({ message: "invalid lesson id" })
                }
            }
            else {
                res.status(400).json({ message: "no lesson found on server" })
            }
        }
        else {
            res.status(400).json({ message: "no lesson found on server" })
        }

    } catch (error) {
        console.error(`Error in getting lession: ${error}`);
        res.status(500).json({ message: "Error in getting lession", error });
    }
});

// Update Video By LessonId
app.patch("/lesson/:lessonId", upload.single('file'), (req, res) => {
    try {
        const lessonId = req.params.lessonId;
        const { lessonName } = req.body; // Access the lesson name from `req.body`

        console.log('lessonName:', lessonName); // Debugging output
        console.log('file:', req.file); // Debugging output

        if (!lessonName) {
            return res.status(400).json({ message: "Lesson name is required." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const videoPath = req.file.path; // Temp path
        const placeholderUrl = `/uploads/courses/${lessonId}/index.m3u8`;

        // Move file metadata to a processing queue or database for cron job
        const uploadMetadata = {
            lessonId,
            lessonName,
            videoPath,
            createdAt: new Date(),
            isActive: true,
        };

        fs.writeFileSync(`./uploads/temp/${lessonId}.json`, JSON.stringify(uploadMetadata));

        res.json({
            message: "File uploaded successfully. Processing will start soon.",
            placeholderUrl,
            lessonId,
        });
    } catch (error) {
        console.error(`Error during upload: ${error}`);
        res.status(500).json({ message: "Error during file upload", error });
    }
});

// Upload Videos
app.post("/lesson", upload.single("file"), (req, res) => {
    try {

        const { lessonName } = req.body; // Access the lesson name
        console.log(lessonName)

        if (!lessonName) {
            return res.status(400).json({ message: "Lesson name is required." });
        }


        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const lessonId = uuidv4();
        const videoPath = req.file.path; // Temp path
        const placeholderUrl = `/uploads/courses/${lessonId}/index.m3u8`;

        // Move file metadata to a processing queue or database for cron job
        const uploadMetadata = {
            lessonId,
            lessonName,
            videoPath,
            createdAt: new Date(),
            isActive: true
        };

        fs.writeFileSync(`./uploads/temp/${lessonId}.json`, JSON.stringify(uploadMetadata));

        res.json({
            message: "File uploaded successfully. Processing will start soon.",
            placeholderUrl,
            lessonId,
        });
    } catch (error) {
        console.error(`Error during upload: ${error}`);
        res.status(500).json({ message: "Error during file upload", error });
    }
});


// FFmpeg Segmentation Function
const convertToFFmpeg = (videoPath, outputPath, hlsPath) => {
    return new Promise((resolve, reject) => {
        const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

        exec(ffmpegCommand, (err, stdout, stderr) => {
            if (err) {
                console.error(`FFmpeg Error: ${err}`);
                reject(err);
            } else {
                console.log(`FFmpeg Output: ${stdout}`);
                resolve();
            }
        });
    });
};

// Cron Job to Process Unsegmented Files
cron.schedule("*/1 * * * *", async () => {

    if (isProcessing) {
        console.log("Job is already running, skipping this cycle...");
        return;
    }

    console.log("Cron job running to process uploaded files...");
    isProcessing = true; // Set the flag to indicate a job is running

    const tempDir = "./uploads/temp";

    try {

        const files = fs.readdirSync(tempDir);
        for (const file of files) {
            if (file.endsWith(".json")) {
                const lessonsFilePath = `./uploads/courses/courses.json`;
                let lessons = [];
                const metadataPath = path.join(tempDir, file);
                const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

                const { lessonId, lessonName, videoPath, isActive } = metadata;
                const outputPath = `./uploads/courses/${lessonId}`;
                const hlsPath = `${outputPath}/index.m3u8`;
                const videoUrl = `${BASEURL}/uploads/courses/${lessonId}/index.m3u8`

                if (!fs.existsSync(outputPath)) {
                    fs.mkdirSync(outputPath, { recursive: true });
                }

                try {
                    await convertToFFmpeg(videoPath, outputPath, hlsPath);
                    fs.unlinkSync(videoPath); // Delete temp video file
                    fs.unlinkSync(metadataPath); // Delete metadata file

                    const lesson = {
                        lessonId,
                        lessonName,
                        videoUrl,
                        createdAt: new Date(),
                        isActive

                    };
                    if (!fs.existsSync(lessonsFilePath)) {
                        fs.writeFileSync(lessonsFilePath, JSON.stringify([], null, 2));
                    }

                    const fileContent = fs.readFileSync(lessonsFilePath, 'utf8');
                    if (fileContent) {
                        lessons = JSON.parse(fileContent); // Parse the JSON file content into an array
                        if (lessons) {
                            // Append the new lesson 
                            // filterLessons = lessons.filter(x => x.isActive == true && x.lessonId != lessonId)
                            // if (filterLessons) {
                            //     lessons = filterLessons;
                            // }
                            lessons.push(lesson);
                            fs.writeFileSync(lessonsFilePath, JSON.stringify(lessons, null, 2));
                        }
                    }
                    console.log(`Processed and cleaned up files for lessonId: ${lessonId}`);
                } catch (error) {
                    console.error(`Error processing file for lessonId: ${lessonId}, Error: ${error}`);
                }
            }
        }
    } catch (err) {
        console.error(`Error reading temp directory: ${err}`);
    } finally {
        isProcessing = false; // Reset the flag once the job completes
    }
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`App is listening at http://localhost:${PORT}...`);
});
