import mongoose, { Document, Schema, ObjectId } from "mongoose";

export interface ICertificate extends Document {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  courseId: string | ObjectId;
  certificateId: string; // unique certificate identifier
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  finalScore: number; // percentage score from quiz
  isValid: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Courses", required: true },
    certificateId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    instructorName: { type: String, required: true },
    completionDate: { type: Date, required: true },
    finalScore: { type: Number, required: true, min: 0, max: 100 },
    isValid: { type: Boolean, default: true },
    downloadCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound index to ensure one certificate per user per course
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });
CertificateSchema.index({ certificateId: 1 }, { unique: true });

const Certificate = mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
