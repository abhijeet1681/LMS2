import { NextFunction, Request, Response } from "express";
import { CertificateRepository } from "../../../../infrastructure/repositories/certificateRepository";
import { CustomError } from "../../../middlewares/errorMiddleWare";

const certificateRepository = new CertificateRepository();

export const getCertificateController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { certificateId } = req.params;
        if (!certificateId) throw new CustomError("Certificate ID is required", 400);

        const certificate = await certificateRepository.getCertificateById(certificateId);
        if (!certificate) {
            throw new CustomError("Certificate not found", 404);
        }

        if (!certificate.isValid) {
            throw new CustomError("This certificate has been revoked", 400);
        }

        res.status(200).json({
            success: true,
            data: certificate
        });
    } catch (error) {
        next(error);
    }
};

export const getUserCertificatesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) throw new CustomError("User not found", 401);

        const certificates = await certificateRepository.getUserCertificates(user.id);

        res.status(200).json({
            success: true,
            data: certificates
        });
    } catch (error) {
        next(error);
    }
};

export const downloadCertificateController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        const { certificateId } = req.params;
        
        if (!user) throw new CustomError("User not found", 401);
        if (!certificateId) throw new CustomError("Certificate ID is required", 400);

        const certificate = await certificateRepository.getCertificateById(certificateId);
        if (!certificate) {
            throw new CustomError("Certificate not found", 404);
        }

        if (certificate.userId.toString() !== user.id) {
            throw new CustomError("Unauthorized access to certificate", 403);
        }

        if (!certificate.isValid) {
            throw new CustomError("This certificate has been revoked", 400);
        }

        // Increment download count
        await certificateRepository.incrementDownloadCount(certificateId);

        res.status(200).json({
            success: true,
            data: certificate,
            message: "Certificate ready for download"
        });
    } catch (error) {
        next(error);
    }
};

export const verifyCertificateController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { certificateId } = req.params;
        if (!certificateId) throw new CustomError("Certificate ID is required", 400);

        const certificate = await certificateRepository.getCertificateById(certificateId);
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found",
                isValid: false
            });
        }

        res.status(200).json({
            success: true,
            isValid: certificate.isValid,
            data: {
                certificateId: certificate.certificateId,
                studentName: certificate.studentName,
                courseName: certificate.courseName,
                instructorName: certificate.instructorName,
                completionDate: certificate.completionDate,
                finalScore: certificate.finalScore
            }
        });
    } catch (error) {\n        next(error);
    }
};
