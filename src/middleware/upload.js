import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        // generate random string
        const randomString = Math.random().toString(36).substring(2, 15);

        cb(null, `${Date.now()}-${randomString}.${file.originalname.split('.').pop()}`);
    }
});

const imageFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format Image tidak sesuai'));
    }
}

const uploadImage = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }, 
    fileFilter: imageFilter 
});


export default uploadImage;

