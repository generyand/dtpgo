import { Prisma } from '@prisma/client';

export type StudentWithProgram = Prisma.StudentGetPayload<{
  include: {
    program: true;
  };
}>;

export interface StudentWithQRCode extends StudentWithProgram {
  qrCodeDataUrl?: string;
} 