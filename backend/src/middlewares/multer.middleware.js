import multer from "multer"

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "./public/temp")
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
//         console.log(file)

//         cb(
//             null,
//             file.fieldname +
//                 "-" +
//                 uniqueSuffix +
//                 "Artha-Nirikshan" +
//                 file.originalname
//         )
//     },
// })

const storage = multer.memoryStorage()

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
})
