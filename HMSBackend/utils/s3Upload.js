const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter - only allow PDF, images, and common document formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png|doc|docx|xls|xlsx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, images, and document files are allowed!'));
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload file to S3
const uploadToS3 = async (file, folder = 'lab-reports') => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private' // or 'public-read' if you want public access
    };

    const result = await s3.upload(params).promise();
    
    return {
      fileUrl: result.Location,
      fileName: file.originalname,
      key: result.Key
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('File upload failed');
  }
};

// Delete file from S3
const deleteFromS3 = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error('File deletion failed');
  }
};

// Generate presigned URL for private files
const getSignedUrl = async (fileKey, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Expires: expiresIn // URL expires in seconds (default 1 hour)
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('S3 Signed URL Error:', error);
    throw new Error('Failed to generate download URL');
  }
};

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3,
  getSignedUrl
};
