import Certificate, { ICertificate } from "../../domain/models/Certificate";
import { v4 as uuidv4 } from 'uuid';

export class CertificateRepository {
    async createCertificate(certificateData: Partial<ICertificate>): Promise<ICertificate> {
        const certificate = new Certificate({
            ...certificateData,
            certificateId: this.generateCertificateId()
        });
        return await certificate.save();
    }

    async getCertificateById(certificateId: string): Promise<ICertificate | null> {
        return await Certificate.findOne({ certificateId })
            .populate('userId', 'firstName lastName email')
            .populate('courseId', 'title');
    }

    async getCertificateByUserAndCourse(userId: string, courseId: string): Promise<ICertificate | null> {
        return await Certificate.findOne({ userId, courseId });
    }

    async getUserCertificates(userId: string): Promise<ICertificate[]> {
        return await Certificate.find({ userId, isValid: true })
            .populate('courseId', 'title thumbnailUrl')
            .sort({ completionDate: -1 });
    }

    async incrementDownloadCount(certificateId: string): Promise<ICertificate | null> {
        return await Certificate.findOneAndUpdate(
            { certificateId },
            { $inc: { downloadCount: 1 } },
            { new: true }
        );
    }

    async revokeCertificate(certificateId: string): Promise<ICertificate | null> {
        return await Certificate.findOneAndUpdate(
            { certificateId },
            { isValid: false },
            { new: true }
        );
    }

    async getAllCertificates(): Promise<ICertificate[]> {
        return await Certificate.find()
            .populate('userId', 'firstName lastName email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
    }

    private generateCertificateId(): string {
        return `CERT-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    }
}
