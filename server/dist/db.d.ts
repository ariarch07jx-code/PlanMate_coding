import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
export declare const prisma: PrismaClient<{
    adapter: PrismaLibSql;
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
